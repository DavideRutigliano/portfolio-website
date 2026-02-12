---
layout: archive
permalink: /notes/
title: "Notes"
sidebar:
  nav: "notes_nav"
author_profile: false
toc: true
toc_sticky: true
---

A collection of technical notes, reference materials, and things I've learned along the way. These are my personal knowledge base entries — not polished tutorials, but practical notes for quick reference.

---

## Cloud Native

Notes on Kubernetes, container orchestration, and cloud-native technologies.

{% assign cloud_notes = site.notes | where: "category", "cloud-native" %}
{% if cloud_notes.size > 0 %}
{% for post in cloud_notes %}
  {% include archive-single.html %}
{% endfor %}
{% else %}
*No notes yet in this category.*
{% endif %}

---

## GPU & AI Infrastructure

Deep dives into GPU computing, NVIDIA MIG/vGPU, vLLM, and AI/ML infrastructure.

{% assign gpu_notes = site.notes | where: "category", "gpu-ai" %}
{% if gpu_notes.size > 0 %}
{% for post in gpu_notes %}
  {% include archive-single.html %}
{% endfor %}
{% else %}
*No notes yet in this category.*
{% endif %}

---

## Observability

OpenTelemetry, Prometheus, Grafana, and monitoring best practices.

{% assign obs_notes = site.notes | where: "category", "observability" %}
{% if obs_notes.size > 0 %}
{% for post in obs_notes %}
  {% include archive-single.html %}
{% endfor %}
{% else %}
*No notes yet in this category.*
{% endif %}

---

## Programming

Go, Python, Rust, and software development practices.

{% assign prog_notes = site.notes | where: "category", "programming" %}
{% if prog_notes.size > 0 %}
{% for post in prog_notes %}
  {% include archive-single.html %}
{% endfor %}
{% else %}
*No notes yet in this category.*
{% endif %}

---

*More notes coming soon. This is a living document that grows as I learn.*
