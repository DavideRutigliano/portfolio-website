---
title: "Kubernetes Observability Design"
excerpt: "A high-level overview of metrics, logs, and traces in Kubernetes."
category: observability
layout: single
permalink: /notes/kubernetes-observability/
toc: true
---

Kubernetes observability is the process of collecting and analyzing **metrics**, **logs**, and **traces** (the "three pillars of observability") to understand the internal state, performance, and health of a cluster.

## 1. Metrics
Kubernetes components emit metrics in **Prometheus format** via `/metrics` endpoints.

*   **Key Components:** `kube-apiserver`, `kube-scheduler`, `kube-controller-manager`, `kubelet`, and `kube-proxy`.
*   **Kubelet Endpoints:** Also exposes `/metrics/cadvisor` (container stats), `/metrics/resource`, and `/metrics/probes`.
*   **Enrichment:** Tools like `kube-state-metrics` add context about Kubernetes object status.
*   **Pipeline:** Metrics are typically scraped periodically and stored in a TSDB (e.g., Prometheus, Thanos, Cortex).

## 2. Logs
Logs provide a chronological record of events from applications, system components, and audit trails.

*   **Application Logs:** Captured by the container runtime from `stdout`/`stderr`. Standardized via CRI logging format and accessible via `kubectl logs`.
*   **System Logs:**
    *   **Host-level:** `kubelet` and container runtimes (often write to `journald` or `/var/log`).
    *   **Containerized:** `kube-scheduler` and `kube-proxy` (usually write to `/var/log`).
*   **Pipeline:** A node-level agent (e.g., Fluent Bit, Fluentd) tails logs and forwards them to a central store (e.g., Elasticsearch, Loki).

## 3. Traces
Traces capture the end-to-end flow of requests across components, linking latency and timing.

*   **OTLP Support:** Kubernetes components can export spans using the **OpenTelemetry Protocol (OTLP)**.
*   **Exporters:** spans can be sent directly via gRPC or through an **OpenTelemetry Collector**.
*   **Backend:** Traces are processed by the collector and stored in backends like Jaeger, Tempo, or Zipkin.

---
**Reference:** [Kubernetes Observability Documentation](https://kubernetes.io/docs/concepts/cluster-administration/observability/)
