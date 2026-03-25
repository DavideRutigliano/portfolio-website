---
title: "Deployment Strategies"
excerpt: "Deep dive into modern software delivery, deployment techniques, and progressive delivery."
macro_category: devops
category: deployment-strategies
order: 1
permalink: /notes/devops-deployment-strategies/
---

# Deployment Strategies

Modern software delivery requires strategies that minimize downtime and blast radius. Beyond standard rolling updates, progressive delivery techniques allow for safer, metrics-driven releases.

## Core Strategies

### Blue/Green Deployment
Two identical environments (Blue=Stable, Green=New).
- **Traffic Shifting**: Managed at the load balancer or DNS level.
- **DB Migrations**: The biggest challenge. Strategies include:
    - **Expand and Contract**: First add new columns (expand), then deploy code that uses both, then remove old columns (contract).
    - **Read-only mode**: Briefly put the app in read-only during the switch.
- **Pros**: Instant rollback by switching back to Blue.

### Canary Deployment
Incremental traffic shifting.
- **Header-based Routing**: Route only internal users or specific regions using HTTP headers (e.g., `x-user-type: beta`).
- **Automated Analysis**: Tools like **Argo Rollouts** or **Flux Flagger** automatically compare metrics (Success Rate, Latency) between stable and canary.
- **Rollback**: Automatically triggered if error rates exceed a threshold.

### Rolling Update
The default Kubernetes strategy.
- **maxSurge**: How many extra pods can be created during the update.
- **maxUnavailable**: How many pods can be taken down during the update.
- **Readiness Probes**: Critical for ensuring traffic only hits "warm" and healthy instances.

### Recreate
- **Usage**: When the application cannot handle two versions running simultaneously (e.g., exclusive file locks or complex singleton states).
- **Downtime**: Scaled by the speed of startup/shutdown.

---

## Progressive Delivery Tools
- **Argo Rollouts**: A Kubernetes controller that provides advanced deployment capabilities (Blue/Green, Canary, Analysis).
- **Istio/Linkerd**: Service meshes that enable fine-grained traffic splitting (e.g., 99% vs 1%).
- **Feature Flags**: Decoupling *deployment* from *release*. Code is deployed but hidden behind a toggle (LaunchDarkly, Unleash).

---

| Strategy | Speed | Risk | Seamless | Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Recreate** | Fast | High | No | Low |
| **Rolling** | Slow | Medium | Yes | Low |
| **Blue/Green** | Fast | Low | Yes | High |
| **Canary** | Slow | Lowest | Yes | High |

---

*Last updated: 2026-03-25*
