---
title: "vLLM & PagedAttention"
excerpt: "How vLLM uses virtual memory concepts to eliminate KV cache fragmentation"
macro_category: ai-inference
category: llm-serving
order: 2
permalink: /notes/ai-inference-vllm-pagedattention/
---

# vLLM & PagedAttention

vLLM is a high-throughput LLM serving engine. Its "secret sauce" is **PagedAttention**, an algorithm inspired by virtual memory paging in operating systems.

## The PagedAttention Mechanism

Instead of allocating contiguous memory for a sequence's KV cache (which leads to fragmentation), PagedAttention partitions it into fixed-size **physical blocks**.

### Logical vs. Physical Mapping
Contiguous logical blocks of a sequence are mapped to non-contiguous physical blocks via a **Block Table**. Physical blocks are allocated strictly on demand.

![Logical vs Physical Mapping](https://vllm.ai/blog-assets/figures/annimation1.gif)
*Animation showing how logical KV cache blocks are mapped to non-contiguous physical memory.*

![PagedAttention Kernel](https://vllm.ai/blog-assets/figures/annimation0.gif)
*The PagedAttention kernel fetches blocks efficiently by consulting the Block Table during computation.*

## Memory Sharing & Copy-on-Write

PagedAttention naturally enables efficient memory sharing for complex sampling algorithms (e.g., parallel sampling, beam search).

- **Shared Prompt**: Multiple output sequences from the same prompt can point to the same physical blocks.
- **Copy-on-Write (CoW)**: When a shared block needs to be modified, a new physical block is allocated only for the delta.

![Parallel Sampling Shared Prompt](https://vllm.ai/blog-assets/figures/annimation2.gif)
*Sharing the prompt's KV cache across multiple generation sequences.*

> [!NOTE]
> vLLM reduces memory waste to **under 4%**, allowing for significantly larger batch sizes and up to 24x higher throughput than standard Transformers implementations.

---

*Last updated: 2026-03-25*
