---
title: "GPU Troubleshooting Fundamentals"
excerpt: "XID errors, ECC errors, and PCIe bus failures in HPC environments"
category: gpu-ai
permalink: /notes/gpu-hpc-fundamentals/
---

# GPU Troubleshooting Fundamentals

Common GPU failure modes and diagnostics in high-performance computing (HPC) and AI infrastructure.

## XID Errors

XID errors are error reports from the NVIDIA driver printed to the operating system's kernel log or event log. They provide a high-level indication of where a failure occurred.

### Common XID Codes
- **XID 31 (GPU Memory Page Fault)**: Typically indicates an application trying to access an invalid memory address. Often a software bug (illegal memory access) but can be triggered by faulty hardware.
- **XID 45 (GPU Raven Termination)**: Critical error indicating the GPU has encountered a hardware issue that required it to be reset or terminated.
- **XID 61 (Internal Microcontroller Error)**: Internal GPU firmware error, often requiring a node reboot or power cycle.
- **XID 79 (GPU has fallen off the bus)**: The most critical state where the GPU is no longer communication via PCIe.

**Diagnostics:**
```bash
dmesg | grep -i xid
# or
journalctl -kn | grep -i xid
```

## ECC Errors (Error Correction Code)

Modern data center GPUs (A100, H100) use ECC to detect and correct memory corruption.

### Types of Errors
1. **Single-Bit Errors (SBE)**: Corrected automatically by hardware without data loss. High counts of SBEs can indicate aging hardware or impending failure.
2. **Double-Bit Errors (DBE)**: Uncorrectable errors. These lead to immediate application crashes (to prevent data corruption) and require a GPU reset.

**Diagnostics:**
```bash
nvidia-smi -q -d ECC
```

## "Falling off the Bus"

A situation where the GPU becomes completely unresponsive to the host CPU via the PCIe interface. The device remains visible in `lspci` (usually), but `nvidia-smi` will report "No devices found" or "Unable to determine the device handle".

### Common Causes
- **Thermal Issues**: GPU overheating triggers a survival shutdown.
- **Power Fluctuations**: Transient voltage drops causing the GPU to drop its link.
- **PCIe Link Training Failure**: Signal integrity issues on the motherboard or riser cards.
- **Firmware/Driver Bugs**: Internal state machine lockups.

### Recovery
1. **Soft Reset**: `nvidia-smi -r` (if the driver can still talk to the GPU).
2. **Hard Reboot**: Cold boot of the physical node.
3. **Firmware Reload**: Using specialized tools like `flshutil` (for HGX systems).

---

*Last updated: 2026-02-18*
