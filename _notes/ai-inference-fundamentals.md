---
title: "AI Inference Fundamentals"
excerpt: "KV Cache, Time to First Token (TTFT), and the memory-compute tradeoff in LLM serving"
macro_category: ai-inference
category: llm-serving
order: 1
permalink: /notes/ai-inference-fundamentals/
---

# AI Inference Fundamentals

Efficiently serving Large Language Models (LLMs) requires specialized techniques to overcome memory bottlenecks and maximize throughput.

## KV Cache (Key-Value Cache)

In autoregressive decoding, each generated token depends on all previous tokens. To avoid recomputing the attention "keys" and "values" for every new token, they are stored in GPU memory.

- **Large**: Can take gigabytes for long sequences (e.g., ~1.7GB for a 13B model at 2048 tokens).
- **Dynamic**: Sizes change based on sequence length, leading to memory management challenges.
- **The Problem**: Traditional systems over-reserve memory for the maximum possible sequence length (Internal Fragmentation) or fail to reclaim gaps (External Fragmentation), losing **60-80%** of actual GPU capacity.

---

## Time to First Token (TTFT)

TTFT is the latency between request submission and the first output token. It is the most critical metric for interactive user experience.

### Prefill Phase (Compute-Bound)
The model processes the entire input prompt at once to populate the KV cache. This phase is limited by the GPU's TFLOPS (compute capacity).

### Decoding Phase (I/O-Bound)
Tokens are generated one by one. Each step requires loading the model weights and the KV cache from VRAM to the processors. This phase is limited by **Memory Bandwidth**.

> [!TIP]
> Optimizing TTFT involves minimizing queuing delays and using efficient "Chunked Prefill" to balance prompt processing with ongoing token generation.

---

*Last updated: 2026-03-25*
