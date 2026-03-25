---
title: "CI/CD Fundamentals"
excerpt: "Understanding the automation bridge between development and production."
macro_category: devops
category: cicd-fundamentals
order: 3
permalink: /notes/devops-cicd-fundamentals/
---

# CI/CD Fundamentals

Automation is the engine behind DevOps. CI/CD pipelines provide a reliable, repeatable path for software to move from a developer's machine to the end-user.

## Continuous Integration (CI)

CI focuses on the early stages of the development cycle, ensuring that code changes are integrated and tested frequently.

### The CI Workflow
1.  **Code Commit**: Developers push code to a shared repository (Git).
2.  **Automated Build**: The build server (GitHub Actions, GitLab CI, Jenkins) compiles the code and builds artifacts (Docker images, binaries).
3.  **Static Analysis**: Tools like **SonarQube** or **checkstyle** analyze code for security vulnerabilities and style issues.
4.  **Testing**:
    - **Unit Tests**: Testing individual functions/classes.
    - **Integration Tests**: Testing interactions between components.
    - **Security (SAST)**: Scanning source code for vulnerabilities.

---

## Continuous Delivery vs. Deployment (CD)

While often used interchangeably, there is a key distinction in the level of automation.

### Continuous Delivery
The code is *always* in a deployable state. However, the final push to production requires a **manual trigger**.
- **Promotion**: Promoting artifacts through staging/QA environments before production.
- **Why?**: Business requirements, compliance, or risk management.

### Continuous Deployment
Every change that passes the automated pipeline is **automatically** deployed to production.
- **Prerequisite**: Extremely high confidence in automated testing and observability.
- **Benefit**: Minimum time-to-market and rapid feedback loops.

---

## Pipeline Design Best Practices

- **Build Once, Deploy Many**: The same artifact (Docker image) should move through all environments to ensure consistency.
- **Fail Fast**: Run the fastest, most critical tests first to provide immediate feedback.
- **Immutable Artifacts**: Never modify an artifact after it's built; version it and promote it.
- **Artifact Management**: Use registries like **Harbor**, **Nexus**, or **JFrog Artifactory** to store and version your builds.

---

| Stage | Goal | Tool Examples |
| :--- | :--- | :--- |
| **Source** | Version control | Git, GitHub, GitLab |
| **Build** | Compilation & Packaging | Maven, Go Build, Docker |
| **Test** | Quality & Security | Jest, JUnit, SonarQube |
| **Release** | Artifact storage | Harbor, ECR, Nexus |
| **Deploy** | Orchestration | Kubernetes, Helm, Terraform |

---

*Last updated: 2026-03-25*
