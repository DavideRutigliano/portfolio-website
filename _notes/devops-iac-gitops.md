---
title: "IaC & GitOps"
excerpt: "Modern infrastructure management using code, version control, and reconciliation loops."
macro_category: devops
category: iac-gitops
order: 2
permalink: /notes/devops-iac-gitops/
---

# Infrastructure as Code (IaC) & GitOps

Treating infrastructure like software is the cornerstone of modern DevOps. This ensures reproducibility, auditability, and speed.

## Infrastructure as Code (IaC)

IaC allows teams to manage and provision infrastructure through code rather than manual processes.

### Key Concepts
- **Declarative vs Imperative**: 
    - **Declarative**: Focuses on the *desired state* (e.g., "I want 3 VMs"). Examples: **Terraform**, **OpenTofu**, **CloudFormation**, **Pulumi**.
    - **Imperative**: Focuses on the *steps* to achieve the state (e.g., "Run this script to install Nginx"). Examples: **Ansible**, **Chef**, **Puppet**.
- **Idempotency**: The ability to run the same code multiple times and achieve the same result without unintended side effects.
- **State Management**: Tools like Terraform maintain a `.tfstate` file to track the real-world resources and map them to your code.

### Terraform Deep Dive
- **Providers**: Plugins that interact with cloud APIs (AWS, GCP, Kubernetes).
- **Modules**: Reusable building blocks to standardize infrastructure patterns.
- **Backends**: Remote storage for state files (S3, GCS, Terraform Cloud) with locking mechanisms (DynamoDB) to prevent concurrent changes.

---

## GitOps Principles

GitOps is an operational framework that takes DevOps best practices (version control, collaboration, CI/CD) and applies them to infrastructure automation.

### The Four Pillars
1.  **Declarative Description**: The entire system is described declaratively in Git.
2.  **Versioned Source of Truth**: Changes to the system are made via Pull Requests.
3.  **Automatically Pulled**: The infrastructure is automatically updated when the Git state changes.
4.  **Continuously Reconciled**: Software agents (operators) constantly compare the desired state (Git) with the actual state (Cluster).

### GitOps vs Traditional CI/CD
| Feature | Traditional CD (Push) | GitOps (Pull) |
| :--- | :--- | :--- |
| **Trigger** | CI server pushes to Cluster | Cluster agent pulls from Git |
| **Security** | CI needs cluster credentials | Agents run *inside* the cluster |
| **Drift** | Hard to detect | Automatically corrected |

### Tools
- **ArgoCD**: Provides a powerful UI and supports multi-cluster management.
- **Flux CD**: A lightweight, CNCF-graduated tool focused on automation and security.
- **Sealed Secrets / External Secrets**: Strategies to manage sensitive data in Git without storing plan-text secrets.

---

| Tool | Focus | Philosophy |
| :--- | :--- | :--- |
| **Terraform** | Infrastructure Provisioning | Generic, multi-cloud |
| **Ansible** | Configuration Management | Procedural, agentless |
| **ArgoCD** | Kubernetes CD | GitOps, UI-driven |

---

*Last updated: 2026-03-25*
