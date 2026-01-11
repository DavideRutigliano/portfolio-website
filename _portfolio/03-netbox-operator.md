---
title: "NetBox Operator"
excerpt: "Kubernetes operator synchronizing VLAN and VM assets into NetBox for infrastructure governance"
collection: portfolio
---

## Overview

Designed and implemented a **custom Kubernetes operator** to synchronize VLAN and virtual machine assets into NetBox. This established a **single source of truth** for infrastructure inventory and restored governance over VM and network assets previously unmanaged at scale.

## Key Achievements

- 📊 **Single source of truth** — Centralized infrastructure inventory management
- 🔒 **Restored governance** — Brought previously unmanaged assets under control
- 🔄 **Real-time sync** — Automatic synchronization of infrastructure changes

## Technical Details

The operator watches Kubernetes resources and synchronizes them to NetBox:

### VLANClaim Controller
- Monitors `NetworkAttachmentDefinition` resources from Harvester
- Synchronizes VLAN metadata to NetBox with conflict resolution
- Maintains declarative configuration with traceability

### VM Asset Synchronization
- Discovers virtual machines across Harvester clusters
- Syncs VM metadata, IP addresses, and resource allocations
- Updates NetBox records in real-time as infrastructure changes

## Technologies

`Go` `Kubernetes` `Operator SDK` `NetBox` `Harvester` `REST API`
