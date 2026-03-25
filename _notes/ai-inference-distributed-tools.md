---
title: "Distributed Inference Tools"
excerpt: "KubeAI, LLM-D and the architecture of disaggregated prefill/decode serving"
macro_category: ai-inference
category: llm-serving
order: 4
permalink: /notes/ai-inference-distributed-tools/
---

# Distributed Inference Tools

Modern stacks extend beyond simple model servers to include Kubernetes-native orchestration and intelligent routing.

## KubeAI
A Kubernetes operator designed to streamline LLM deployments.
- **OpenAI Compatible**: Seamlessly integrates with existing LLM apps.
- **Autoscaling**: Supports "Scale-to-Zero" for cost savings.
- **Prefix-Aware Routing**: Directs requests to pods that already have the relevant KV cache.
- [KubeAI.org](https://kubeai.org)

![KubeAI Architecture](https://github.com/kubeai-project/kubeai/raw/main/docs/diagrams/arch.excalidraw.png)

## LLM-D (LLM Deployer)
A high-performance stack focusing on **Disaggregated Serving**.

### PD Disaggregation
Separates the **Prefill** (prompt processing) and **Decode** (token generation) stages into distinct clusters.
- **Prefill Clusters**: Optimized for high-compute (TFLOPS).
- **Decode Clusters**: Optimized for high memory bandwidth and low latency.

![LLM-D Architecture](https://github.com/llm-d/llm-d/raw/main/docs/assets/images/llm-d-arch.svg)

### Tiered KV Caching
LLM-D supports offloading KV-cache entries to:
1.  **CPU RAM**: Fast retrieval for warm requests.
2.  **SSD**: Persistent storage for long-tail cache.
3.  **Network Storage**: Shared cache across nodes.

---

*Last updated: 2026-03-25*
