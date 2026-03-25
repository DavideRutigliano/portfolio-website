---
title: "Git Internals & Advanced Config"
excerpt: "Understanding Git's 4-stage workflow and advanced configurations for power users."
macro_category: devops
category: git-internals
order: 5
permalink: /notes/devops-git-internals/
---

# Git Internals & Advanced Config

Git is a content-addressable filesystem. Understanding how it moves data between its internal areas is key to mastering the tool.

## The Git Workflow (4 Areas)

Git manages your code across four distinct areas. Most commands are simply moving data between these stages.

1.  **Working Directory**: Your local files on disk that you are currently editing.
2.  **Staging Area (Index)**: A "draft" area where you prepare changes for the next commit.
3.  **Local Repository (HEAD)**: Your personal version history on your machine.
4.  **Remote Repository**: The shared version of the project (e.g., GitHub, GitLab).

### Essential Commands
- `git add`: Moves changes from **Working Directory** to **Staging Area**.
- `git commit`: Saves staged changes to the **Local Repository**.
- `git push`: Uploads local commits to the **Remote Repository**.
- `git fetch`: Downloads updates from **Remote** to **Local Repository** (without merging).
- `git merge`: Integrates downloaded changes into your current branch.
- `git pull`: Performs `fetch` + `merge` in a single step.
- `git checkout`: Switches between branches or restores files.
- `git stash`: Temporarily "shelves" changes in the Working Directory to be restored later.

### Visualizing the Data Flow
![Git Workflow](https://substackcdn.com/image/fetch/$s_!Fevp!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Feb1ae3fa-80a7-464d-97a2-869170caaa2f_2360x2960.png)

---

## Advanced Configurations

These settings are frequently used by Git core developers to improve the default experience, focusing on better diffing, pushing, and conflict resolution.

### Better Diffing & Visibility
```bash
# Use the smarter histogram diff algorithm
git config --global diff.algorithm histogram

# Highlight moved code in different colors
git config --global diff.colorMoved plain

# Show the full diff when writing commit messages
git config --global commit.verbose true
```

### Streamlined Pushing & Fetching
```bash
# Automatically set upstream branch on first push
git config --global push.autoSetupRemote true

# Automatically prune stale remote-tracking branches on fetch
git config --global fetch.prune true

# Push tags automatically when pushing branches
git config --global push.followTags true
```

### Conflict Resolution & Maintenance
```bash
# Show the "base" version in merge conflicts (Zealous Diff3)
git config --global merge.conflictstyle zdiff3

# Reuse recorded resolutions (rerere) for repeating conflicts
git config --global rerere.enabled true
git config --global rerere.autoupdate true

# Default to rebase when pulling
git config --global pull.rebase true

# enable filesystem monitor for faster status in large repos
git config --global core.fsmonitor true
```

### Safety & Automation
```bash
# Guess and prompt for autocorrecting mistyped commands
git config --global help.autocorrect prompt

# Automatically stash/pop changes before/after rebase
git config --global rebase.autoStash true
```

---

*Sources:* 
- [ByteByteGo: Git Workflow & Commands](https://blog.bytebytego.com/p/ep206-git-workflow-essential-commands)
- [GitButler: How Core Devs Configure Git](https://blog.gitbutler.com/how-git-core-devs-configure-git)

*Last updated: 2026-03-25*
