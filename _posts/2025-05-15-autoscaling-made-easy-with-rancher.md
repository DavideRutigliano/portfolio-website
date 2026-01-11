---
title: 'Autoscaling Made Easy with Rancher'
date: 2025-05-15
permalink: /posts/2025/05/autoscaling-made-easy-with-rancher/
tags:
  - Kubernetes
  - Rancher
  - Platform Engineering
---

In this article, I explore how to implement seamless cluster autoscaling in RKE2 environments using Rancher’s Node Drivers and MachineDeployment resources. I highlight the use of the upstream Kubernetes Cluster Autoscaler (CA) as the core engine, which communicates with Rancher to dynamically provision or terminate nodes based on pod demand.

**Technical Achievements:**
By leveraging standard Kubernetes APIs, I implemented a vendor-agnostic way to manage cluster size across different infrastructure providers. The result is a robust, scalable architecture that ensures optimal resource utilization without manual intervention.

[Read the full article on Medium](https://medium.com/@davide.ruti/autoscaling-made-easy-with-rancher-8b9b44844bf0)
