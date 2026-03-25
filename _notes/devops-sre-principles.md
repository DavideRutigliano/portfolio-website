---
title: "SRE Principles"
excerpt: "Applying software engineering principles to operations and reliability."
macro_category: devops
category: sre-principles
order: 4
permalink: /notes/devops-sre-principles/
---

# Site Reliability Engineering (SRE)

SRE is what happens when you ask a software engineer to design an operations function. It focuses on scalability, reliability, and automation.

## Reliability Measurement

The core of SRE is the quantitative measurement of reliability through targets and budgets.

### SLI, SLO, and SLA
- **SLI (Service Level Indicator)**: A quantitative measure of some aspect of the service (e.g., Request Latency, Error Rate).
- **SLO (Service Level Objective)**: A target value for an SLI (e.g., 99.9% of requests must be < 200ms).
- **SLA (Service Level Agreement)**: A business-level contract that defines the consequences (e.g., refunds) for meeting or missing SLOs.

### Error Budget
An error budget is `1 - SLO`. It's the amount of "unreliability" allowed for a given period.
- **Example**: A 99.9% SLO allows for ~43 minutes of downtime per month.
- **Policy**: If the budget is exhausted, releases are halted to focus on improvements.

---

## The Four Golden Signals

Effective monitoring focuses on four key metrics:
1.  **Latency**: The time it takes to service a request.
2.  **Traffic**: A measure of how much demand is being placed on the system.
3.  **Errors**: The rate of requests that fail (explicitly, implicitly, or by policy).
4.  **Saturation**: How full your service is (e.g., CPU, Memory, I/O).

---

## Observability Pillars

Observability is more than just monitoring; it's the ability to understand the internal state of a system from its external outputs.
- **Metrics**: Aggregated data (counter, gauge, histogram). Best for finding "that" something is wrong.
- **Logs**: Discrete events. Best for finding "where" something is wrong.
- **Traces**: End-to-end request flows. Best for finding "why" something is wrong in distributed systems.

---

## Toil and Automation

Toil is the kind of work tied to running a production service that tends to be manual, repetitive, automatable, and devoid of enduring value.
- **SRE Target**: SREs should spend at least 50% of their time on engineering projects (automation, reliability features) to reduce toil.

---

| Concept | Purpose |
| :--- | :--- |
| **Post-mortem** | Blameless analysis of an incident to prevent recurrence. |
| **Incident Management** | Structured process for responding to service disruptions. |
| **Capacity Planning** | Ensuring the system can handle future loads efficiently. |

---

*Last updated: 2026-03-25*
