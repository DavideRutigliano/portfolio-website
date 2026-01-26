---
title: 'Building an AI Team: My Journey from Prompts to Local Agents'
date: 2025-11-20
permalink: /posts/2025/11/building-an-ai-team-part-1/
tags:
  - AI
  - Agents
  - Platform Engineering
  - gemini-cli
---

Just like everyone else, I’ve been using LLMs daily for coding. I have my library of “perfect prompts,” my favorite web UI, and I thought I had this AI thing figured out.

But today I learned that I’ve been doing it wrong. Or at least, I’ve been stuck in “Level 1.”

I realized that while I was busy chatting with AI, the real power users are orchestrating it. The industry is quietly shifting from “Chatbots” (which talk) to “Agents” (which act). Inspired by a fascinating article on [generic sub-agents], I decided to go down the rabbit hole of local AI agents.

Here is what I found, and how it completely changed my workflow.

## The “Aha!” Moment: Chatbots vs. Agents

My first realization was a semantic one. I used to use the terms interchangeably, but there is a massive functional difference:
- A Chatbot is passive. You ask a question, it gives an answer. It waits for you.
- An Agent is active. It thinks, picks a tool (like a file writer or a search bar), acts, observes the result, and then thinks again.

I realized that to get real engineering work done I didn’t need a better prompt. I needed an entity that could read my files, make a plan, and execute it while I grabbed my coffee.

## Discover gemini-cli

```bash
gemini-cli
```

I wanted to build this locally. I didn’t want to wire up a complex Python web of LangChain callbacks just to test an idea. That’s when I discovered `gemini-cli`.

At first glance, it looks like just another wrapper to curl the Gemini API. But I learned it has a superpower: extensions.

Usually, CLI tools are static. But `gemini-cli` lets you install extensions that act like packages for AI behavior. I saw that people were using these extensions to give the AI specific tools, like interacting with Google Cloud or managing local files.

But then [this](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi) hit me: extensions aren’t just for tools. They can be used to define AI Personas, that are sub-agents for specific tasks.

## What is a Sub-Agent?

A subagent is a specialized AI Agent whose purpose is to do a single, well-defined task. They are often used in combination with an orchestrator agent, which delegates tasks to them. A subagent is just like a normal agent and has the same components, with the main difference that they addresses a key limitation of AI agents: context pollution. When a single, big and complex agent handles many tasks, its context window, number of tools, can become cluttered and less reliable.

## The Concept: AI Personas as sub-agents

I deep dive into the configuration files (specifically `gemini-extension.json`) and realized I could package specific behaviors into reusable modules.

Instead of pasting a giant “You are a Senior Software Engineer” prompt every time I started a session, I could wrap that context into a formally defined extension. This meant I could have a “Coder” extension that only knows how to write code, and a “Reviewer” extension that only knows how to critique it.

This led me to the architecture I’m building now:
1. The Coder: An agent constrained to strictly writing code.
2. The Reviewer: An agent that applies the “fresh eyes” principle to check the Coder’s work.
3. The Orchestrator: The agent that manages the other two.

One agent to rule them all, one agent to find them, One agent to bring them all, and in the darkness bind them; In the Land of AI where the shadows lie.

## What’s Next?

Today I learned that the filesystem is the perfect state machine for AI.

I realized that I don’t need complex memory vectors for a simple dev workflow. I can just let my agents talk to each other by reading and writing files.

In the next post, I’m going to stop talking theory and show you the code. I will share the exact prompts and configuration I used to build a Coder, a Reviewer, and an Orchestrator that run entirely in my terminal, passing tasks back and forth until the job is done.

If you want to get ready for Part 2, go grab the `gemini-cli` and start thinking about what "Personas" you’d want on your digital team.
---
