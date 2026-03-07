---
title: "GPU Performance: Data Movement & Bottlenecks"
excerpt: "Identifying and debugging PCIe, NVLink, and memory bottlenecks using DCGM"
category: gpu-ai
order: 4
permalink: /notes/gpu-performance-bottlenecks/
---

# GPU Performance: Data Movement & Bottlenecks

Understanding how data flows through a system is critical for identifying why a GPU might be underutilized.

## How Data Moves

The journey of data from storage to the GPU execution unit involves multiple hops, each a potential bottleneck.

### 1. Storage to CPU RAM
Data is loaded from disk (SSD, Parallel Filesystem like Lustre/WEKA) into Host Memory (RAM).
- **Bottleneck**: I/O throughput of the storage system or network (if using remote storage).

### 2. CPU RAM to GPU VRAM (The PCIe Pipe)
The CPU orchestrates the transfer of data from RAM to the GPU's onboard memory (VRAM) via the PCIe bus.
- **Bottleneck**: PCIe bandwidth. Even PCIe Gen 5 (64GB/s x16) is significantly slower than GPU VRAM bandwidth (>2TB/s on H100).
- **Optimization**: Use **GPUDirect Storage (GDS)** to bypass the CPU and move data directly from storage/NIC to GPU memory.

### 3. GPU to GPU (NVLink)
In multi-GPU setups, gradients and data are exchanged between GPUs.
- **Bottleneck**: PCIe is often too slow for this. **NVLink** provides a dedicated, high-speed interconnect (up to 900GB/s on H100) that allows GPUs to talk directly without involving the CPU.

---

## Debugging Bottlenecks with DCGM

To identify where the "stall" is happening, monitor specific DCGM metrics and follow these decision paths.

### Identifying the Bottleneck

```mermaid
graph TD
    Start[GPU-Util shows 80% but job is slow] --> DCGM{DCGM profiling metrics available?}
    
    DCGM -- Yes (Datacenter GPU) --> SM_Active{Check SM Active}
    DCGM -- No (Consumer GPU) --> SMI[Use nvidia-smi signals: Temp + Clock + Memory-Util]
    
    SM_Active -- "High > 70%" --> DRAM_Active{Check DRAM Active}
    SM_Active -- "Low < 30%" --> Transfers[Check PCIe/NVLink throughput: PCIE_RX_BYTES, PCIE_TX_BYTES]
    SM_Active -- "30-70%" --> Mixed[Mixed signals: Check temp + clock + transfers]
    
    DRAM_Active -- "High > 70%" --> MemBound[Memory-bound workload: Consider smaller batches]
    DRAM_Active -- Low --> Tensor{Check Tensor Pipeline}
    
    Tensor -- "High > 70%" --> ComputeBound[Compute-bound: Hitting fast path]
    Tensor -- Low --> NoTensor[Not using tensor cores: Check FP16/BF16 settings]
    
    SMI --> SMI_Heuristic{High GPU-Util + High Temp + High Clock?}
    SMI_Heuristic -- Yes --> LikelyCompute[Likely compute-bound]
    SMI_Heuristic -- No --> LikelyStalled[Likely stalled/waiting: Check memory utilization]

    style MemBound fill:#f96,stroke:#333
    style ComputeBound fill:#9f9,stroke:#333
    style LikelyCompute fill:#9f9,stroke:#333
    style LikelyStalled fill:#f96,stroke:#333
    style Transfers fill:#f96,stroke:#333
```

### Workload Specific Flowcharts

#### 1. Training (Steady, long-running)
```mermaid
graph TD
    T_Start{SM Active sustained over time?}
    
    T_Start -- Yes --> T_DRAM{DRAM Active matches model expectations?}
    T_Start -- "No (but GPU-Util high)" --> T_RedFlag[Red flag: GPU-Util high but SMs idle]
    
    T_DRAM -- Yes --> T_Phys{Power, temp, clocks stable?}
    T_DRAM -- No --> T_MemAccess[Check memory access patterns: Possible underutilization]
    
    T_Phys -- Yes --> T_Healthy[Healthy training: Sustained throughput confirmed]
    T_Phys -- No --> T_Throttling[Thermal or power throttling: Throughput dropping]
    
    T_RedFlag --> T_Bottleneck[Stalls or waits, not real compute]
    T_Bottleneck --> T_IO[Check transfer metrics: Data pipeline bottleneck?]
    T_Bottleneck --> T_Sync[Check sync patterns: Gradient sync overhead?]

    style T_Healthy fill:#9f9,stroke:#333
    style T_Throttling fill:#f96,stroke:#333
    style T_RedFlag fill:#f66,stroke:#333
```

#### 2. Inference (Bursty, latency-sensitive)
```mermaid
graph TD
    I_Start{SM Active high during request bursts?}
    
    I_Start -- Yes --> I_Mem{Memory pressure spikes as expected?}
    I_Start -- No --> I_Clock{Clocks ramping up when requests arrive?}
    
    I_Mem -- Yes --> I_Tail{Tail latency P95/P99 acceptable?}
    I_Mem -- No --> I_Compute[Not memory-bound during bursts: Check compute patterns]
    
    I_Tail -- Yes --> I_Healthy[Healthy inference: GPU active when needed]
    I_Tail -- No --> I_Queue[Check queuing, preprocessing or post-processing]
    
    I_Clock -- Yes --> I_Pipeline[Input data not ready: Check data pipeline]
    I_Clock -- No --> I_Power[Clock ramp-up delay or power management issue]

    style I_Healthy fill:#9f9,stroke:#333
    style I_Pipeline fill:#f96,stroke:#333
    style I_Power fill:#f96,stroke:#333
```

### Summary of Data Travel Paths
```mermaid
graph TD
    Paths[Three paths data travels]
    Paths --> P1[Host -> GPU: PCIe 16-32 GB/s]
    Paths --> P2[GPU -> GPU: NVLink 300-900 GB/s]
    Paths --> P3[GPU Memory -> SMs: HBM ~2 TB/s]

    SM{SM Active?}
    
    SM -- High --> C_Bound[Compute-bound: SMs busy]
    SM -- Low --> Interconnect{PCIe/NVLink traffic high?}
    
    Interconnect -- Yes --> T_Bottleneck[Transfer bottleneck: Waiting for data]
    Interconnect -- No --> D_Active{DRAM Active high?}
    
    D_Active -- Yes --> M_Bound[Memory-bound: GPU memory is the limiter]
    D_Active -- No --> S_Check[Check kernel launches, sync or scheduling]

    style C_Bound fill:#9f9,stroke:#333
    style T_Bottleneck fill:#f96,stroke:#333
    style M_Bound fill:#f96,stroke:#333
```

| Metric | Focus | Insight |
|--------|-------|---------|
| `DCGM_FI_PROF_PCIE_TX_BYTES` | PCIe Outbound | High values indicate heavy data transfer from GPU to Host. |
| `DCGM_FI_PROF_PCIE_RX_BYTES` | PCIe Inbound | High values indicate the CPU is feeding the GPU at the bus limit. |
| `DCGM_FI_DEV_MEM_COPY_UTIL` | Memory Controller | Percentage of time spent moving data in/out of VRAM. |
| `DCGM_FI_DEV_GPU_UTIL` | Compute Engine | If this is low while `PCIE_RX` is high, the GPU is **Data Starved**. |

### Interpreting Graphs

> [!TIP]
> **The "Data Stall" Pattern**: You see low `GPU_UTIL` (e.g., 20-30%) but `PCIE_RX_BYTES` is pegged at the theoretical maximum of your PCIe generation. This confirms the bottleneck is the PCIe bus.

> [!IMPORTANT]
> **MIG Bottlenecks**: When using MIG, remember that the PCIe bandwidth is shared across all instances on the physical GPU. One aggressive instance can starve others.

---

## Performance Checklist
- **Check PCIe Link Speed**: Ensure the GPU is actually negotiated at its maximum rated speed (e.g., x16 Gen4).
- **Monitor NVLink Error Rates**: Use `nvidia-smi nvlink -g 0` to check for CRC errors which might indicate faulty hardware slowing down transfers.
- **CPU Affinity**: Ensure the process is pinned to the CPU socket physically closest to the GPU to minimize PCIe latency.

---

*Last updated: 2026-03-07*
