---
title: "VM Import Controller"
excerpt: "Kubernetes operator orchestrating large-scale VM migrations from KVM to Harvester"
collection: portfolio
---

## Overview

Designed and implemented a **Kubernetes operator** to orchestrate large-scale virtual machine migrations from KVM to Harvester. This solution enabled the migration of **100+ VMs** — a transition that was not operationally feasible without custom orchestration.

## Key Achievements

- 🚀 **100+ VMs migrated** — Enabled enterprise-scale virtualization modernization
- ⚙️ **Custom orchestration** — Built where no off-the-shelf solution existed
- 🔄 **Seamless transitions** — Zero-downtime migration workflows

## Technical Details

The operator implements a sophisticated reconciliation loop that:

1. **Discovers** source VMs via SSH connection to KVM/Libvirt hosts
2. **Gracefully powers off** source VMs with configurable timeouts
3. **Streams and converts** disk images using `qemu-img` 
4. **Creates** KubeVirt VirtualMachine CRs with appropriate CPU/memory/network mappings
5. **Tracks** migration status via Kubernetes custom resource status fields

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   KVM Source    │────▶│  VM Import       │────▶│   Harvester     │
│   (Libvirt)     │ SSH │  Controller      │     │   (KubeVirt)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Technologies

`Go` `Kubernetes` `Operator SDK` `KubeVirt` `Harvester` `Libvirt` `QEMU`
