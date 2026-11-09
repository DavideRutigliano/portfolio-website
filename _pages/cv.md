---
layout: archive
title: "CV"
permalink: /cv/
redirect_from:
  - /resume
---

{% include base_path %}

---

<a href="{{ '/files/Davide_Rutigliano_Resume__PE_.pdf' | relative_url }}" class="btn btn--primary" download>📄 Download Resume (PDF)</a>

## Summary

Senior Platform Engineer focused on GPU infrastructure for AI training and inference. Builds Kubernetes/Slurm scheduling, GPU sharing, and fleet observability for multi-tenant workloads, with measurable improvements in utilization and cost.

## Open Source

- **KubeAI (vLLM operator)**: Maintainer (feature design, code reviews, releases) · *2025 – Present*
- **Cloud Native Computing Foundation (CNCF)**: Contributor (bug fixes and documentation) · *2025 – Present*

## Experience

### PhysicsX
**Senior Platform Engineer** · Remote, Italy · *Sep 2026 – Present*

- **GPU Compute Efficiency**: Designed and implemented GPU sharing with HAMi-core, KAI, and MIG, and deployed KServe scale-to-zero and JupyterHub notebook culling, cutting GPU infrastructure spend by 80% ($34K/week, about $1.7M/year).
- **Cloud Cost Reductions**: Optimized cross-region, storage, and networking overhead by deploying regional ECR pull-through caches, S3 Gateway Endpoints and ECR/EBS cleanup policies, achieving $50K+/month in recurring cloud cost savings.
- **LPM Training Infrastructure**: Deployed Slurm on Kubernetes (via Slinky) across InfiniBand-capable GPU nodes, enabling multi-GPU physics simulations and Large Physics Model training.
- **Virtualized GPU Workloads**: Deployed KubeVirt-based VM environment with GPU passthrough to unify Windows CAD and CFD simulation on a single Kubernetes control plane.
- **Inference Cold-start**: Reduced inference cold-start latency from 5 minutes down to 30s by architecting a pre-warming mechanism using Karpenter CapacityBuffer nodes and a custom pre-pull DaemonSet.

*Stack: Kubernetes, NVIDIA GPUs, AI Training, AI Inference, HPC simulation, Slurm, Observability, Crossplane, ArgoCD, Go*

---

### SUSE
**Senior Platform Engineer** · Remote, Italy · *Jan 2026 – Sep 2026*

- **LLM Inference Observability**: Instrumented vLLM with OpenTelemetry collectors to track time to first token (TTFT) and related inference KPIs, enabling on-call diagnosis for a multi-tenant GPU serving platform.
- **GPU Monitoring**: Built GPU observability for Kubernetes and KubeVirt with NVIDIA DCGM and OpenTelemetry, monitoring A2 and H100 GPUs across MIG and vGPU configurations.
- **Cluster Autoscaling**: Reduced infrastructure costs by 62% ($100K+/year) across AWS, GCP, and on-premises environments by deploying Kubernetes autoscaler via Cluster API (CAPI) and consolidating workloads through bin-packing and Descheduler.
- **Kubernetes CNI Migration**: Achieved an 11x increase in network throughput by migrating from Canal to Cilium after using custom eBPF probes to identify a VXLAN encapsulation and iptables/conntrack bottleneck.

**Platform Engineer** · Remote, Italy · *Jan 2025 – Dec 2025*

- **Infrastructure Automation**: Designed and implemented a Kubernetes operator to orchestrate large-scale virtual machine migrations from KVM to Harvester, enabling the migration of 100+ VMs.

*Stack: Kubernetes, Rancher, Harvester, KubeVirt, GPUs, vLLM, OpenTelemetry, Prometheus, Grafana, Terraform, GitOps, Go*

---

### Ericsson
**DevOps Engineer (Team Lead)** · Pagani, Italy · *Sep 2023 – Dec 2024*

- **Self-Service Platform**: Led a team of 5 delivering a company-wide Internal Developer Portal based on Spotify Backstage.

**DevOps Engineer** · *Jun 2022 – Sep 2023*

- **ML-driven Optimization**: Built an ML-driven k8s performance tuning tool, reducing optimization time from weeks to days.

**Cloud Engineer** · *Mar 2021 – Jun 2022*

- **Resource Efficiency**: Reduced footprint of multiple cloud-native microservices by 25% via autoscaling and resource tuning.

*Stack: Kubernetes, OpenShift, Backstage, Performance Tuning, Distributed Systems, GitLab CI, Jenkins, Go, Python*

---

### Cisco
**ML Engineer** · Vimercate, Italy · *Apr 2020 – Mar 2021*

- **ML-based Troubleshooting**: Engineered ML-based optical device defect detection, improving accuracy from 45% to 89%.

*Stack: Computer Vision, TensorFlow, TFLite, Python, C++*

---

## Education

### Master's Degree in Computer Engineering
**Politecnico di Milano** · Milan, Italy · *2018 – 2021*

### Bachelor's Degree in Computer Engineering
**Università degli Studi di Salerno** · Fisciano, Italy · *2014 – 2018*

---

## Skills

### AI Infra
GPU Scheduling and Sharing (HAMi, MIG, KAI, Volcano, Kueue, Slurm), Model Serving (KServe, vLLM)

### Site Reliability
eBPF, OpenTelemetry, Prometheus, Grafana, SLIs/SLOs, Incident Response, Capacity Planning

### Platform Tooling
Kubernetes, Helm, Docker, KubeVirt, Cluster API, GitOps, Terraform, GCP, AWS

### Development
Go, Python, Java, Rust, Kubernetes Operators, Event-Driven Architecture, Linux
