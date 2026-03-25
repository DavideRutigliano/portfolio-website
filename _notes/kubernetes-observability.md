---
title: "Kubernetes Observability Design"
excerpt: "A high-level overview of metrics, logs, and traces in Kubernetes."
macro_category: cloud-native
category: observability
order: 1
layout: single
permalink: /notes/kubernetes-observability/
toc: true
---

Kubernetes observability is the process of collecting and analyzing **metrics**, **logs**, and **traces** (the "three pillars of observability") to understand the internal state, performance, and health of a cluster.

## 1. Prometheus Architecture

Prometheus is an open-source systems monitoring and alerting toolkit. It is designed for reliability and is the industry standard for cloud-native observability.

![Prometheus Architecture](https://prometheus.io/assets/docs/architecture.svg)

### Core Components
- **Prometheus Server**: Scrapes metrics from instrumented jobs, stores them in a local TSDB, and runs rules over the data.
- **Service Discovery**: Automatically identifies targets in dynamic environments (like Kubernetes).
- **Pushgateway**: Supports short-lived jobs that cannot be scraped via the pull model.
- **Alertmanager**: Handles alerts sent by the Prometheus server, deduplicating, grouping, and routing them to notification providers.
- **PromQL**: A powerful functional query language designed for time series data.

---

## 2. Node Exporter Deep Dive

Node Exporter is the standard agent for harvesting hardware and OS metrics from *NIX kernels. It is designed to be **stateless** and lightweight.

### The Flow of Metrics
Node Exporter doesn't store data. When Prometheus initiates a scrape, Node Exporter reads the current values from the Linux kernel's virtual filesystems (`/proc` and `/sys`) and converts them into the **Prometheus Exposition Format**.

![Node Exporter Sequence](https://media2.dev.to/dynamic/image/width=800,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fwre7u0tl21f4wbcuk2ss.png)

### Internal Mechanics
- **Collectors**: Specialized modules (e.g., `cpu`, `meminfo`, `diskstats`) that delegate gathering specific metrics.
- **Textfile Collector**: Allows exporting custom metrics from static files, useful for batch jobs or hardware RAID status.
- **No Reliance on Syscalls**: Whenever possible, it reads from `/proc` to avoid the overhead of context switches from system calls.

---

## 3. Remote Write & Scalability

Prometheus **Remote Write** allows shipping time series samples to a remote storage backend immediately after they are scraped and written to the local TSDB.

![Prometheus Remote Write](https://cdn.prod.website-files.com/626a25d633b1b99aa0e1afa7/6949aa8382031e82b2c0c1f1_image1.png)

### Why Remote Write?
1.  **Long-Term Storage**: Local Prometheus TSDBs are typically optimized for short-term retention (e.g., 15 days). Remote Write enables archiving years of data in cloud storage.
2.  **Global View**: Consolidate metrics from multiple clusters into a single centralized hub (e.g., Grafana pointing to a central Cortex/Mimir instance).
3.  **High Availability**: Feed data into distributed systems built for resilience.

### Mechanism: Sharding & Queues
To handle high throughput, Remote Write uses an in-memory queue managed by concurrent **shards** (worker threads).
- **Data Ordering**: Samples for the same unique time series are always routed to the same shard to ensure correct ingestion order.
- **Retry Logic**: Shards implement exponential backoff to handle transient network issues or remote endpoint errors.

---

## 4. Federated Observability: Cortex

**Cortex** is a horizontally scalable, highly available, multi-tenant, long-term storage for Prometheus. It is built as a set of microservices.

![Cortex Architecture](https://cortexmetrics.io/images/architecture.png)

### Key Microservices
- **Distributor**: Handles incoming samples.
    - **Consistent Hashing**: Uses a "hash ring" to route data to the correct Ingesters.
    - **HA Tracker**: Deduplicates samples from redundant Prometheus pairs by tracking leader status via `cluster` and `replica` labels.
    - **Quorum Writes**: Ensures durability by waiting for a majority of Ingesters to acknowledge the write.
- **Ingester**: Statefully caches incoming samples in memory.
    - **WAL (Write Ahead Log)**: Records data before caching to prevent loss during crashes.
    - **Chunking**: Flushes data blocks to long-term storage (S3, GCS, Azure Blob) once they reach a certain size or age.
- **Querier**: Executes PromQL queries by fetching data from both Ingesters (for recent data) and long-term storage (via Store Gateway).

---

## Summary: The Metrics Pipeline

*   **Kubernetes Components**: Emit metrics via `/metrics` (e.g., Kubelet, API Server).
*   **Enrichment**: `kube-state-metrics` adds context about object status.
*   **Logs**: Nodes use agents like **Fluent Bit** to forward logs to central stores (e.g., Loki).
*   **Traces**: **OpenTelemetry (OTLP)** standardized spans are processed via OTel Collectors and stored in backends like Tempo or Jaeger.

---

**References:**
- [Prometheus Architecture Overview](https://prometheus.io/docs/introduction/overview/)
- [Node Exporter Deep Dive](https://dev.to/kanywst/node-exporter-deep-dive-connecting-the-linux-kernel-and-prometheus-5c6i)
- [Prometheus Remote Write Guide](https://www.groundcover.com/learn/observability/prometheus-remote-write)
- [Cortex Architecture](https://cortexmetrics.io/docs/architecture)
