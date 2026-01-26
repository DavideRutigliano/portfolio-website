---
title: 'Building an AI Team (Part 2): Orchestrating Sub-Agents with the Filesystem'
date: 2025-11-20
permalink: /posts/2025/11/building-an-ai-team-part-2/
tags:
  - AI
  - Agents
  - Platform Engineering
  - Automation
header:
  teaser: "https://cdn-images-1.medium.com/fit/c/800/447/1*UG91Q25t8-1Vn_efO4cmlw.png"
---

In Part 1, we talked about the shift from chatting with AI to orchestrating it. We introduced `gemini-cli` and the concept of extensions as shipping containers for AI personas.

Now, we build the team.

![](https://cdn-images-1.medium.com/fit/c/800/447/1*UG91Q25t8-1Vn_efO4cmlw.png)

We are going to implement a **Multi-Agent System** where an “Orchestrator” agent tells a “Coder” and a “Reviewer” agents what to do. But here is the twist: we aren’t using LangChain, REST APIs, or complex Python frameworks. We are using the most robust, battle-tested inter-process communication protocol in history: *The Filesystem.*

## Filesystem for storing the Agent State

The core idea is simple: *Files are the source of truth.*

In most agent frameworks, state is passed around in hidden memory vectors or JSON objects in an API chain. If the script crashes, the state is lost. With this “Filesystem as State” model, every task, every plan, and every status update is a physical file on your disk.

This approach, heavily inspired by the Unix philosophy (“Everything is a file”), gives us three massive benefits:

1.  **Persistency:** If the orchestrator crashes, the `TASK.md` file is still there.
2.  **Simplicity:** No webhooks. Just file watchers and text.
3.  **Manageability:** You can `cat` a file to see exactly what each agent is *thinking*.

## Step 1: Defining the Personas (The Extensions)

We need three distinct agents. We define them using `gemini-extension.json` to bind a specific markdown \"Persona File\" to the CLI.

## 1. The Coder

The Coder is a “doer.” It shouldn’t ask questions or plan high-level strategy. Its job is to take a task and execute it.

In `CODER.md`, we set strict **CONSTRAINTS** to prevent it from getting distracted:

> *“Your ONLY function is to write code… Do NOT attempt to use any `/agent:*` commands."

Crucially, we define the **Completion Signal**:

> *“Once the code is written… create an empty sentinel file at `.gemini/agents/tasks/<Task_ID>.done` to signal your completion."

This “sentinel file” pattern is how our Orchestrator knows the Coder is finished without needing a callback URL.

## 2. The Reviewer

The Reviewer is the “fresh pair of eyes.” It doesn’t write implementation code; it critiques it.

In `REVIEWER.md`, we define its role as an **Expert Code Reviewer**:

> *“Your SOLE task is to analyze the code for bugs, style violations, and improvements. Update the agent’s plan file with your review.”

This separation of concerns — splitting the “generation” from the “verification” — drastically reduces bugs. As noted in recent research on generic sub-agents, having a distinct persona for review catches hallucinations that a self-correcting single agent might miss.

## 3. The Orchestrator

Finally, we have the Orchestrator. This is the agent you actually talk to.

Defined in `GEMINI.md` (and `ORCHESTRATOR.md`), this agent acts as the interface layer. It doesn't code. It manages the queue.

> *“Your primary purpose is to assist the user in managing a task queue for specialized AI agents… You do not execute tasks autonomously. You respond to the user’s commands.”

## Step 2: The Workflow in Action

So, what happens when you type a command? Let’s trace the flow.

**1. The Trigger** You type: `/agent:run \"Refactor the user login module\"`

**2. The Plan (Orchestrator)** The Orchestrator reads your prompt. It doesn’t start coding. It creates a new state file, e.g., `.gemini/agents/tasks/TASK-001.md`. It outlines the steps needed and assigns the first step to the Coder.

**3. The Execution (Coder)** The Coder extension activates. It reads `TASK-001.md`, writes the Python/JS code to `.gemini/agents/workspace/login.py`, and then creates the `TASK-001.done` sentinel file.

**4. The Review (Reviewer)** The Orchestrator (or a file watcher) sees the `.done` file. It triggers the Reviewer. The Reviewer reads the new code, finds a security flaw, and updates the plan file.

**5. The Loop** The cycle repeats until the Reviewer signs off.

## Why This Works

This pattern turns your terminal into a living organism of specialized workers.

- **Context Windows:** Because each agent only sees what it needs (Coder sees the task, Reviewer sees the code), you save tokens and keep the context focused.
- **Modularity:** Want a “Security Auditor”? Just add a `SECURITY.md` persona and update the Orchestrator to call it.
- **Transparency:** You can literally watch your agents work by keeping a file explorer window open in the `.gemini/agents/` folder.

## Conclusion

We often overcomplicate AI. We build massive RAG pipelines and autonomous swarms when sometimes, all we need is a few good prompts and a filesystem.

By treating “Personas” as installable extensions and “State” as files, we can build powerful, resilient local AI teams that actually get work done.

**References & Inspiration:**

- [Generic Sub-Agents are… Good?](https://dev.to/datadog-frontend-dev/generic-sub-agents-are-good-33o5)
- [Building Multi-Agent Systems](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi)
---
