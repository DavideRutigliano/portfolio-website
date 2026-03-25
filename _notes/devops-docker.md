---
title: "Docker Fundamentals"
excerpt: "An overview of Docker's architecture, Dockerfile directives, image building process, and layered image structure."
macro_category: devops
category: docker
order: 6
permalink: /notes/devops-docker/
---

# Docker Fundamentals

Docker is a platform for building, running, and shipping applications in isolated environments called **containers**. It provides a consistent environment across development, testing, and production.

## Docker Architecture

Docker uses a **client-server architecture**:

-   **Docker Daemon (`dockerd`)**: The background process that manages Docker objects like images, containers, networks, and volumes.
-   **Docker Client (`docker`)**: The command-line interface (CLI) used to communicate with the daemon via REST API.
-   **Docker Registries**: Storage systems for Docker images (e.g., Docker Hub, GitHub Container Registry).
-   **Docker Objects**:
    -   **Images**: Read-only templates used to create containers.
    -   **Containers**: Runnable instances of an image.

---

## The Dockerfile

A **Dockerfile** is a text document containing all the commands a user could call on the command line to assemble an image. It is the "recipe" for creating Docker images.

### Key Directives

| Instruction | Description |
| :--- | :--- |
| `FROM` | **Required.** Sets the base image (e.g., `FROM node:20-alpine`). |
| `RUN` | Executes commands in a new layer (e.g., `RUN apt-get update`). |
| `COPY` | Copies files/directories from the host to the image. |
| `ADD` | Similar to `COPY`, but can also handle remote URLs and extract tarballs. |
| `WORKDIR` | Sets the working directory for subsequent instructions (`RUN`, `CMD`, etc.). |
| `ENV` | Sets environment variables (persist in the image). |
| `ARG` | Defines variables that users can pass at build-time with `--build-arg`. |
| `EXPOSE` | Documents which ports the application listens on. |
| `USER` | Sets the user/UID to use when running the image. |
| `VOLUME` | Creates a mount point for persistent data. |
| `LABEL` | Adds metadata to your image (e.g., maintainer, version). |
| `CMD` | Provides defaults for an executing container. Easily overridden by CLI arguments. |
| `ENTRYPOINT` | Configures a container that will run as an executable. Harder to override. |

---

## Building & Managing Images

To create an image from a Dockerfile, use the `docker build` command:

```bash
# Build an image with a tag
docker build -t my-app:v1 .

# List local images
docker images

# Remove an image
docker rmi my-app:v1
```

---

## Layered Images Explained

Docker images are composed of a series of **read-only layers**. Each instruction in your Dockerfile that modifies the filesystem (like `RUN`, `COPY`, `ADD`) creates a new layer.

-   **Immutability**: Once a layer is created, it never changes.
-   **Caching**: Docker caches layers to speed up subsequent builds. If a layer hasn't changed, Docker reuses it.
-   **Copy-on-Write (CoW)**: When you run a container, Docker adds a thin **read-write layer** ("container layer") on top of the image layers. Any changes made by the running container (creating/deleting files) are stored in this layer.

### Visualizing Layers

![Docker Image Layers](https://labs.iximiuz.com/content/files/tutorials/container-image-from-scratch/__static__/container-image-core-rev2.png)

---

*Sources:*
- [Docker Documentation: Overview](https://docs.docker.com/get-started/docker-overview/)
- [Depot: The complete guide to building Docker images](https://depot.dev/blog/docker-build-image#so-what-is-a-dockerfile)

*Last updated: 2026-03-25*
