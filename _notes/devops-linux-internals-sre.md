---
title: "Linux Internals: SRE Cheatsheet"
excerpt: "A practical guide to Linux internals for application performance, troubleshooting, and SRE interviews."
macro_category: devops
category: linux-fundamentals
order: 8
permalink: /notes/devops-linux-internals-sre/
---

# Linux Internals: The SRE Safety Net

When engineers ask about "Linux Internals," they are often testing whether you understand how the OS affects your application performance. You don't need to memorize the kernel source code; you just need to know where the "knobs" are and how to interpret common metrics.

## 1-Minute Troubleshooting Guide

![One Minute Troubleshooting](https://docs.sadservers.com/images/one-minute.png)

### The "Safety Net" Logic
If a process is slow or crashing, the problem is almost always one of these four: **CPU**, **Memory**, **Disk (I/O)**, or **Network**.

---

## 1. The "Three Types of Wait"
When a system is slow, identify which resource is the bottleneck:

*   **CPU-bound**: The task spends most of its time performing computations. 
    *   **Symptoms**: High CPU usage (>90%) in `top`/`htop`. Load Average significantly higher than the number of CPU cores.
*   **I/O-bound**: The CPU is stuck waiting for storage operations to complete.
    *   **Symptoms**: High **`%wa`** (iowait) in `top`. Check `iostat` for disk utilization.
*   **Network-bound**: A specific type of I/O wait where the bottleneck is network throughput or latency.
    *   **Symptoms**: Latency in `curl` or database queries despite low CPU/Disk usage.

---

## 2. Memory Internals
Understanding memory usage is more than just looking at "Total Memory."

### RSS vs. VIRT
*   **VIRT (Virtual Memory)**: The total address space a process has reserved. This includes everything: shared libraries, memory mapped files, and memory allocated but not yet used.
*   **RSS (Resident Set Size)**: The actual physical RAM the process is consuming right now. **This is what matters for capacity planning.**

### The OOMKiller (Out Of Memory)
When the kernel runs out of RAM + Swap, it invokes the **OOMKiller** to save the system from crashing.
*   **Badness Score (`oom_score`)**: The kernel calculates a score for each process. Higher score = first to be killed.
*   **Factors**: Large memory footprint, shorter-lived processes, and non-privileged users are penalized more.
*   **Adjustment**: You can protect critical processes (like your database) by setting a negative value in `/proc/[PID]/oom_score_adj` (from -1000 to 1000).

---

## 3. Isolation: Namespaces & Cgroups
How containers (Docker/K8s) actually work under the hood.

### Linux Namespaces (Boundaries)
Namespaces define what a process can **see**. They create isolated views of system resources.

![Linux Namespaces](https://digitalpress.fra1.cdn.digitaloceanspaces.com/bzg4z45/2025/07/linux-namespaces-types.webp)

*   **PID Namespace**: The process thinks it is PID 1.
*   **Network Namespace**: Private network stack (interfaces, routing, IP).
*   **Mount Namespace**: Independent filesystem mount points.
*   **UTS Namespace**: Custom hostname.
*   **IPC Namespace**: Isolated inter-process communication.
*   **User Namespace**: Map internal IDs to different external IDs (e.g., internal root = external nobody).

### Control Groups (cgroups)
Cgroups define how much a process can **use**. They enforce resource limits (CPU, Memory, I/O) and prevent "noisy neighbors" from starving other processes.

---

## 4. Virtual File System (VFS) & Storage
Linux treats "everything as a file" via the **VFS** abstraction layer.

### Inodes (The File's Identity)
An **Inode** is a data structure containing metadata about a file (permissions, owner, size, data block addresses).
*   **Crucial Fact**: The **Filename** is NOT stored in the Inode. It's stored in the directory entry that points to the Inode.
*   **Links**: A **Hard Link** is just another directory entry pointing to the same Inode. A **Symlink** is a special file containing the path to another Inode.

### File Behavior & Inodes
*   **`cp` (Copy)**: Creates a NEW Inode.
*   **`mv` (Move)**: Keeps the SAME Inode (just renames the directory entry pointer).
*   **`sed -i` (Edit in place)**: Often creates a temporary file (new Inode) and renames it over the original. This can break tools (like `tail -f`) that are watching the original Inode!

### File Descriptors (FD)
A **File Descriptor** is a process-level integer that index into the kernel's open file table. By default, 0 is stdin, 1 is stdout, and 2 is stderr.

---

## Practical Troubleshooting Workflow
When you log into a server (The "SadServers" Way):

1.  **Characterize**: `sudo ss -tlpn` (what's listening?) and `ps auxf` (what's running?).
2.  **Saturation**: `uptime` (load), `free -m` (memory), `df -h` (disk space).
3.  **Logs**: `journalctl -p err` (errors) or `tail -f /var/log/syslog`.

---

*Sources: [SadServers](https://docs.sadservers.com/docs/scenario-guides/practical-linux-server-review/), [Dev.to - Linux FS](https://dev.to/kanywst/linux-file-system-architecture-a-deep-dive-into-vfs-inodes-and-storage-1n9), [ByteByteGo]*

*Last updated: 2026-03-26*
