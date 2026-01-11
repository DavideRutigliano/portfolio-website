---
title: 'Why I Run Kubernetes on Top of Kubernetes: Rancher + Harvester'
date: 2025-06-20
permalink: /posts/2025/06/kubernetes-on-top-of-kubernetes/
tags:
  - Kubernetes
  - Rancher
  - Harvester
  - Infrastructure
---

I explain the benefits of a "Kubernetes-on-Kubernetes" architecture using Rancher and Harvester. I use Harvester as a bare-metal hyper-converged infrastructure (HCI) solution built on KubeVirt and Longhorn, providing a stable base for my virtualized workloads. Rancher then sits on top to orchestrate and manage multiple downstream Kubernetes clusters.

**Technical Achievements:**
This setup solves common challenges of multi-tenancy and resource isolation by creating dedicated clusters for different teams or projects on a unified private cloud. My technical approach leverages the deep integration between Harvester’s virtualization capabilities and Rancher’s fleet management.

[Read the full article on Medium](https://medium.com/@davide.ruti/why-i-run-kubernetes-on-top-of-kubernetes-rancher-harvester-28bb3b6d2673)
