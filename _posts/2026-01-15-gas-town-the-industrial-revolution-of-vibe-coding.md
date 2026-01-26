---
title: 'Gas Town: The Industrial Revolution of Vibe Coding'
date: 2026-01-15
permalink: /posts/2026/01/gas-town-the-industrial-revolution-of-vibe-coding/
tags:
  - AI
  - Coding
  - Agents
  - Gas Town
---

In our previous deep dive, we explored the Ralph Wiggum Technique , a method defined by its beautiful simplicity. It was the software equivalent of an infinite monkey theorem: set up a bash loop, feed an error log to an AI, and let it fail its way to success.

But if Ralph Wiggum is a lone monkey with a typewriter, **Gas Town** is the planet of the apes.

Architected by industry veteran Steve Yegge, Gas Town represents the transition from “Punk Rock” AI scripting to “Industrial” AI orchestration. It is based on a provocative thesis: we are leaving the era of the **IDE** and entering the era of the **Agent Factory**.

## From “I’m Helping!” to “We’re Building”

The Ralph Wiggum technique proved that an agent *could* fix code autonomously if trapped in a loop. However, Ralph has a fatal flaw: **Amnesia**. Once the loop ends or the context window overflows, Ralph forgets everything. He is an ephemeral genius.

Gas Town solves this by introducing **State** and **Hierarchy** to the agent swarm.

In [Welcome to Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04), Yegge argues that the single, omnipotent AI agent that does everything, is a myth. To scale AI coding, you don’t need a smarter model; you need a better management structure for a swarm of “mediocre” models.

> But colonies are going to win. Factories are going to win. Automation is going to win. Of course they’re gonna fucking win. Anyone who thinks otherwise is, well, not a big fan of history, I guess.

## The Architecture of the Factory

Gas Town is not a plugin for VS Code. It is a terminal-based operating system (mostly Go code and `tmux` sessions) that manages a civilization of agents.

## 1. The MEOW Stack (Molecular Expression of Work)

The technical backbone of Gas Town is the **MEOW stack**. It addresses the durability problem.

- **Beads (Atoms):** Instead of Jira tickets living in a cloud database, Gas Town uses **[Beads](https://github.com/steveyegge/beads)**. JSON objects stored directly in the Git repository (`.beads/`). This means your \"tickets\" are version-controlled alongside your code. When you switch branches, your to-do list switches with you.
- **Molecules (Workflows):** These are persistent chains of Beads. If an agent crashes on Step 4 of a 10-step refactor, the Molecule remains in Git. The next agent wakes up, reads the Molecule, sees Step 4 is incomplete, and resumes work.

## 2. The Civic Roles

Gas Town anthropomorphizes its processes into a “Town” metaphor to help the human orchestrator understand the chaos.

- **🎩 The Mayor:** The central cortex. Usually a high-intelligence model (like Claude 3.5 Sonnet or Opus). You talk to the Mayor (`gt may at`), and the Mayor breaks your high-level intent into tasks.
- **🦦 The Polecats:** The working class. These are ephemeral, “cattle-like” agents spawned for a single task. They wake up, check their **Hook** (a persistent slot), write code, push it, and self-destruct. They have no identity and no memory beyond the immediate task.
- **👮 The Deacon:** The immune system. A process that runs “patrols” to clean up stale locks, kill zombie agents, and ensure the town remains sanitary. (Early versions of the Deacon were notoriously aggressive, leading to the “Gas Town Serial Killer” bug where it murdered active workers).
- **🏭 The Refinery:** The merge queue. Because 20 agents pushing to `main` simultaneously is a recipe for disaster, the Refinery serializes contributions, rebasing and testing them before allowing them into the codebase.

## The GUPP: Perpetual Motion

The engine that drives this factory is the **Gastown Universal Propulsion Principle (GUPP)**.

In a standard AI chat, when you restart the session, the bot waits for you to say “Hello.” In Gas Town, the GUPP dictates that an agent’s first action upon waking is to check its Hook.

- **The Handoff:** When a Polecat is getting “tired” (context window filling up), it executes a `gt handoff`.
- **The Relay:** It saves its state to the Hook and kills itself.
- **The Resurrection:** A fresh Polecat spins up, reads the Hook, and continues typing the code exactly where the previous one left off.

This allows for “Turing-complete” workflows that can run for days, costing hundreds of dollars in API credits, without human intervention.

## The Economics of “Vibe Coding”

If Ralph Wiggum costs “less than a fast food worker,” Gas Town costs “more than a sports car lease.”

Yegge is transparent about the economics: Gas Town is a **“Cash Guzzler.”** Running a swarm of 20 concurrent Claude instances requires multiple API accounts to bypass rate limits and can burn hundreds of dollars in a weekend.

However, this is where the **Jevons Paradox** hits hardest. If spending $500 on API credits allows one senior engineer to do the work of a 10-person team in a week, the ROI is astronomical. It creates a bifurcation in the industry:

- **The Artisan:** Hand-crafts code, limited by typing speed.
- **The Industrialist:** Designs “Molecules” (workflows) and manages a factory of Polecats.

## Conclusion: The “Don’t Look” Rule

The most difficult adjustment for new Gas Town users is the **“Don’t Look”** rule.

When you run a Ralph loop, you watch the terminal. When you run Gas Town, you are instructed *not* to watch the agents. Watching 20 agents generate text is a “waste of human life.” You must trust the GUPP. You define the work, you start the factory, and you walk away. You only return when the Mayor pings you that the Convoy has arrived.

Gas Town is messy, expensive, and currently has a user experience described as “getting kicked in the groin.” But it is also a glimpse into a future where software engineering is no longer about writing loops, but about architecting the loops that write the loops.
