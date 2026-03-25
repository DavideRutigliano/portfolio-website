---
title: "Inference Parallelism"
excerpt: "Tensor, Pipeline, and Expert parallelism strategies for large-scale LLM deployments"
macro_category: ai-inference
category: llm-serving
order: 3
permalink: /notes/ai-inference-parallelism/
---

# Inference Parallelism

When a model is too large for a single GPU or when scaling throughput is required, various parallelism strategies are employed.

## Tensor Parallelism (TP)
Shards model weights (tensors) across multiple GPUs within a single layer.
- **Scope**: Usually within a single node (using high-speed NVLink).
- **vLLM Config**: `--tensor-parallel-size 4`

![Tensor Parallelism](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*AYGAphsUxiqQ877_.png)

## Pipeline Parallelism (PP)
Distributes different layers of the model across different GPUs.
- **Scope**: Can span multiple nodes.
- **vLLM Config**: `--pipeline-parallel-size 2`

![Pipeline Parallelism](https://miro.medium.com/v2/resize:fit:1396/format:webp/0*fB3PMsXqZmGGFi55.png)

## Data Parallelism (DP)
Replicates the entire model across multiple GPU sets. Each set processes a different batch of requests.
- **Best for**: Maximizing overall system throughput.

![Data Parallelism](https://miro.medium.com/v2/resize:fit:1396/format:webp/0*ZveQfAv0zSwTxfer.png)

## Expert Parallelism (EP)
Used for **Mixture-of-Experts (MoE)** models (like DeepSeek or Mixtral). It shards the "expert" layers across GPUs while keeping common layers replicated or sharded via TP.

![Expert Parallelism](https://miro.medium.com/v2/resize:fit:1256/format:webp/0*yef9Uj3YiB_gWBWL.png)

---

*Last updated: 2026-03-25*
