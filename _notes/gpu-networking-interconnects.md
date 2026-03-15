---
title: "GPU Networking & Interconnects"
excerpt: "RDMA, InfiniBand, RoCE, and internal GPU-to-GPU communication (NVLink)"
category: gpu-ai
order: 2
permalink: /notes/gpu-networking-interconnects/
---

# GPU Networking & Interconnects

Efficient data movement is the backbone of distributed AI training.

## Node-to-Node: RDMA & InfiniBand

Traditional TCP/IP is too slow for large-scale GPU workloads due to CPU overhead and latency.

### RDMA (Remote Direct Memory Access)
Allows direct memory access between nodes, bypassing the CPU and OS kernel.
- **Zero-Copy**: No intermediate buffers.
- **Kernel Bypass**: Applications talk directly to NICs.

### InfiniBand (IB)
A specialized, credit-based lossless network architecture.
- **Latency**: Sub-microsecond.
- **Throughput**: HDR (200G), NDR (400G/800G).

### RoCE (RDMA over Converged Ethernet)
Brings RDMA to Ethernet. Requires **PFC (Priority Flow Control)** to be lossless.

---

## Inside the Node: NVLink vs PCIe

How GPUs communicate with each other and the CPU within a single server.

| Interconnect | Bandwidth (H100) | Hop Type | Purpose |
|--------------|------------------|----------|---------|
| **PCIe Gen 5** | 64-128 GB/s | Host-Centric | GPU-to-CPU traffic |
| **NVLink 4** | 900 GB/s | Peer-to-Peer | GPU-to-GPU traffic (Mesh) |

### NVLink Advantage
NVLink allows direct memory access between GPUs, effectively creating a unified memory space and bypassing the PCIe bottleneck during collective operations (AllReduce).

---

## Comparison Table

| Feature | InfiniBand | RoCE v2 | TCP/IP |
| :--- | :--- | :--- | :--- |
| **Transport** | Native IB | UDP/IP (Ethernet) | TCP/IP |
| **Flow Control** | Credit-based | PFC/ECN | Software |
| **Latency** | Extremely Low | Low | Higher |

---

*Last updated: 2026-03-07*
