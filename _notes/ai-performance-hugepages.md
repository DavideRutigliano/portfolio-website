---
title: "AI Performance: Huge Pages & Memory Paging"
excerpt: "Transparent (THP) vs. Static Huge Pages optimization, TLB misses, fallback detection, and latency tracking"
macro_category: hpc-ai-infrastructure
category: ai-performance
order: 1
permalink: /notes/ai-performance-hugepages/
---

# AI Performance: Huge Pages & Memory Paging

Memory mapping translations from Virtual to Physical space present a major bottleneck in high-throughput AI pipelines due to the frequency of large tensor allocations and high TLB cache pressure.

---

## 1. Paging & Huge Page Mechanics

*   **Default Paging**: The OS maps memory using **4 KB pages**. Backing a 1 GB tensor requires managing **262,144 pages**, triggering a CPU page-fault storm on first-touch.
*   **Huge Pages**: Mapping memory in **2 MB** (or **1 GB**) blocks. Backing a 1 GB tensor requires only **512 page faults**, drastically reducing kernel overhead.

```
Virtual Address ──> [ Check TLB Cache ] ──(Hit: 1 cycle)──> RAM Address
                           │
                         (Miss) ──> Walk Page Table in RAM ──> (Slower: 50-200 cycles)
```

---

## 2. Transparent (THP) vs. Static Huge Pages

### Transparent Huge Pages (THP)
*   **Mechanics**: The OS kernel dynamically promotes 4 KB allocations to 2 MB blocks in the background.
*   **Integration**: Implicit and transparent. Standard `malloc()` or PyTorch `torch.zeros()` use them automatically with zero code changes.
*   **Trade-off**: Best-effort. If RAM is fragmented, it silently falls back to 4 KB pages. Background compaction can introduce CPU latency spikes (jitter).

### Static Huge Pages (K8s Resource Limits)
*   **Mechanics**: Pre-allocated at boot time and locked in RAM (cannot be swapped or reclaimed).
*   **Integration**: Explicit. Pods request them via limits (`hugepages-2Mi`) and mount a `hugetlbfs` volume. The application must explicitly use `mmap(..., MAP_HUGETLB)` or point allocators (like `jemalloc`) to the `/hugepages` mount.
*   **Trade-off**: Guaranteed availability and zero jitter, but unused reserved memory sits completely wasted.

---

## 3. TLB Pressure: Training vs. Inference

The **TLB (Translation Lookaside Buffer)** caches page translations. When workloads exceed cache coverage, TLB misses cause severe stalls.

*   **Training (High TLB Pressure)**: Involves massive address spaces holding input batches, model weights, gradients, optimizer states, and cached forward activation maps. 2 MB pages are a massive win, increasing TLB reach 512-fold and keeping the translation cache hot.
*   **Inference (Targeted TLB Pressure)**: Footprint is smaller (no backward activations or optimizer states), but large models (e.g. 70B+) sweep gigabytes of weights and KV caches for every token. Static hugepages ensure stable, jitter-free tail latency (P95/P99).

---

## 4. Monitoring & Detection Metrics

To ensure huge pages are active and not causing performance regressions, monitor these primary signals:

### OS-Level Counters (`/proc/`)
*   **`/proc/meminfo` $\rightarrow$ `AnonHugePages`**: Total anonymous memory currently backed by transparent huge pages.
*   **`/proc/vmstat` $\rightarrow$ `thp_fault_fallback`**: **Regression Alarm**. Increments when a hugepage allocation fails due to fragmentation, falling back to 4 KB pages.
*   **`/proc/vmstat` $\rightarrow$ `thp_fault_alloc`**: Total huge pages successfully mapped at fault-time.

### Hardware TLB Misses (`perf`)
Measure if TLB cache misses are bottlenecking execution:
```bash
perf stat -e dTLB-loads,dTLB-load-misses,iTLB-loads,iTLB-load-misses -p <PID>
```
*   *Threshold*: A miss-to-load ratio $>1.5\%$ indicates heavy translation stalls.

### eBPF Tracing Probes
Use eBPF to trace synchronous compaction stalls and page fault latency:
```bash
# Trace duration of synchronous memory compaction (THP allocation delays)
sudo funclatency -u -m try_to_compact_pages

# Trace general page fault resolution times
sudo funclatency -u -m handle_mm_fault
```
*   *Remediation*: If direct compaction latency is high, set `/sys/kernel/mm/transparent_hugepage/defrag` to `defer` or `never` to prevent synchronous blocking allocations.
