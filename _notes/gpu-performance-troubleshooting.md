---
title: "GPU Performance & Troubleshooting"
excerpt: "Debugging bottlenecks, XID errors, and hardware diagnostic flowcharts"
macro_category: cloud-native
category: kubernetes-gpu
order: 5
permalink: /notes/gpu-performance-troubleshooting/
---

# GPU Performance & Troubleshooting

## Identifying Bottlenecks

Follow these decision paths to find out why your workload is slow.

```mermaid
graph TD
    Start[GPU-Util shows 80% but job is slow] --> DCGM{DCGM profiling metrics available?}
    
    DCGM -- Yes (Datacenter GPU) --> SM_Active{Check SM Active}
    DCGM -- No (Consumer GPU) --> SMI[Use nvidia-smi signals: Temp + Clock + Memory-Util]
    
    SM_Active -- "High > 70%" --> DRAM_Active{Check DRAM Active}
    SM_Active -- "Low < 30%" --> Transfers[Check PCIe/NVLink throughput: PCIE_RX_BYTES, PCIE_TX_BYTES]
    
    DRAM_Active -- "High > 70%" --> MemBound[Memory-bound workload]
    DRAM_Active -- Low --> Tensor{Check Tensor Pipeline}
    
    Tensor -- High --> ComputeBound[Compute-bound]
    Tensor -- Low --> NoTensor[Not using tensor cores]
    
    style MemBound fill:#f96,stroke:#333
    style ComputeBound fill:#9f9,stroke:#333
    style Transfers fill:#f96,stroke:#333
```

*(See detailed training/inference flowcharts in the full note content)*

---

## Hardware Faults & XIDs

XID errors are reports from the NVIDIA driver indicating hardware or driver-level failures.

### Common XID Codes
- **XID 31 (Page Fault)**: Invalid memory access. Software or faulty HW.
- **XID 61 (Internal Error)**: Firmware error, usually requires reboot.
- **XID 79 (Falling off the Bus)**: GPU is unresponsive. PCIe link issue.

### ECC Errors
- **Single-Bit (SBE)**: Automatically corrected.
- **Double-Bit (DBE)**: Uncorrectable. Crashes application to prevent corruption. Requires GPU reset.

---

## Diagnostic Checklist
- **PCIe Link Speed**: Verify `x16 Gen4/5` negotiation.
- **Thermal Throttling**: Check if Clocks drop under load.
- **CPU Affinity**: Ensure Pod is on the same NUMA node as the GPU.

---

*Last updated: 2026-03-07*
