---
title: 'Building an AI Team Part 2: Orchestrating sub-agents with the filesystem'
date: 2025-11-25
permalink: /posts/2025/11/building-an-ai-team-part-2/
tags:
  - AI
  - Agents
  - Architecture
  - Systems Design
---

In the second part of the series, I dive into the technical coordination of my AI team, specifically using the local filesystem as a shared state mechanism. I explain how my sub-agents (responsible for tasks like research, coding, or review) communicate by reading and writing files in a structured way.

**Technical Achievements:**
This filesystem-based orchestration avoids the complexity of more heavy-weight messaging systems while providing a persistent, auditable trail of agent interactions. It solves the challenge of maintaining context across different specialized agents in a multi-step task.

[Read the full article on Medium](https://medium.com/@davide.ruti/building-an-ai-team-part-2-orchestrating-sub-agents-with-the-filesystem-01631d51a49f)
