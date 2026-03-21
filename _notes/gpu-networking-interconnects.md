---
title: "GPU Networking & Interconnects"
excerpt: "RDMA, InfiniBand, RoCE, and internal GPU-to-GPU communication (NVLink)"
macro_category: hpc-ai-infrastructure
category: storage-networking
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

![NVLink Connections](https://developer-blogs.nvidia.com/wp-content/uploads/2022/02/high-bandwidth-NVLink-connections.png)

## NCCL & Rail Optimization

**NCCL** stands for NVIDIA Collective Communication Library. It is a library used in applications that need to do collective, cross-GPU actions. It's topology-aware and allows an abstracted interface to the set of GPUs being used across a cluster system, such that applications don't need to understand where a particular GPU resides.

### Rail Optimization

In a **Rail-Optimized topology**, each NIC is connected to a different switch (or spine-leaf network) and is called a rail (often represented by a unique color in architecture diagrams). The rails are also interconnected at an upper tier. Therefore, this topology provides two ways to cross rails: through the Scale Up fabric (preferred) or through the upper tier of the Scale Out topology.

![Rail Optimized Topology](https://www.juniper.net/documentation/us/en/software/jvd/jvd-ai-dc-apstra-nvidia-weka/media/image14.png)

For example, to communicate with GPU 8 on server 2, GPU 4 on server 1 can either:

- Transfer its data into the memory of GPU 8 on server 1. Then GPU 8 on server 1 communicates through NIC 8 on server 1 with GPU 8 on server 2, through NIC 8 on server 2.
- Send its data to NIC 4 on server 1, which can reach through the upper tier to NIC 8 on server 2, coupled with GPU 8 on server 2.

![NCCL Message Path](https://developer-blogs.nvidia.com/wp-content/uploads/2022/02/message-path.png)

This property allows AI workloads to perform better on a Rail-Optimized topology than on a Pure Rail topology because the current Collective Communication Libraries are not yet fully optimized for the Pure Rail topology. As such, the Rail-Optimized topology is the recommended topology to build a Scale Out fabric.

---

## Network Topologies: Leaf-Spine (CLOS) vs Fat-Tree

Distributed training workloads require predictable, high-bandwidth communication. Different topologies handle this scaling in various ways.

### Leaf-Spine (CLOS)
A two-tier architecture where every **Leaf** switch (connected to servers) is connected to every **Spine** switch.
- **Predictable Latency**: Any-to-any communication is always a fixed number of hops.
- **East-West Optimization**: Optimized for server-to-server traffic rather than client-server (North-South).

![3-Tier vs Leaf-Spine](https://docscontent.nvidia.com/dims4/default/a2ba2f7/2147483647/strip/true/crop/493x236+0+0/resize/986x472!/format/webp/quality/90/?url=https%3A%2F%2Fk3-prod-nvidia-docs.s3.us-west-2.amazonaws.com%2Fbrightspot%2Fconfluence%2F00000187-94ca-d3c2-a7af-9fde93400000%2Fimages%2Fnetworking%2Fdownload%2Fattachments%2F110005028%2Fimage2020-10-25_2-7-39.png)

### Fat-Tree
A specific, non-blocking implementation of a CLOS network often used in InfiniBand. It is hierarchical but "fat" because the aggregate bandwidth remains constant (or increases) as you move up the tiers toward the root.
- **Non-Blocking**: Designed so that if all leaves communicate simultaneously, the core can handle the total bandwidth without congestion.
- **Scalability**: Can scale to three or more stages (Edge, Aggregation, Core) to support thousands of nodes.

![Fat-Tree Topology](https://docscontent.nvidia.com/dims4/default/722fa62/2147483647/strip/true/crop/558x355+0+0/resize/1116x710!/format/webp/quality/90/?url=https%3A%2F%2Fk3-prod-nvidia-docs.s3.us-west-2.amazonaws.com%2Fbrightspot%2Fconfluence%2F00000187-94ca-d3c2-a7af-9fde93400000%2Fimages%2Fnetworking%2Fdownload%2Fattachments%2F110005028%2Fimage2020-10-25_2-10-16.png)

---

## Comparison Table

| Feature | InfiniBand | RoCE v2 | TCP/IP |
| :--- | :--- | :--- | :--- |
| **Transport** | Native IB | UDP/IP (Ethernet) | TCP/IP |
| **Flow Control** | Credit-based | PFC/ECN | Software |
| **Latency** | Extremely Low | Low | Higher |

---

*Last updated: 2026-03-07*
