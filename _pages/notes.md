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

<div id="cloud-native" class="notes-category">
  ## Cloud Native
  
  Notes on Kubernetes, container orchestration, and cloud-native technologies.

  {% assign cloud_notes = site.notes | where: "category", "cloud-native" %}
  {% if cloud_notes.size > 0 %}
    {% for post in cloud_notes %}
      <div class="note-content">
        <h3>{{ post.title }}</h3>
        {{ post.content }}
      </div>
      {% unless forloop.last %}<hr class="note-separator">{% endunless %}
    {% endfor %}
  {% else %}
    *No notes yet in this category.*
  {% endif %}
</div>

---

<div id="gpuhpc--ai-infrastructure" class="notes-category">
  ## GPU/HPC & AI Infrastructure

  Deep dives into GPU computing, NVIDIA MIG/vGPU, DCGM monitoring, vLLM, and AI/ML/HPC infrastructure.

  {% assign gpu_notes = site.notes | where: "category", "gpu-ai" %}
  {% if gpu_notes.size > 0 %}
    {% for post in gpu_notes %}
      <div class="note-content">
        <h3>{{ post.title }}</h3>
        {{ post.content }}
      </div>
      {% unless forloop.last %}<hr class="note-separator">{% endunless %}
    {% endfor %}
  {% else %}
    *No notes yet in this category.*
  {% endif %}
</div>

---

<div id="observability" class="notes-category">
  ## Observability

  OpenTelemetry, Prometheus, Grafana, and monitoring best practices.

  {% assign obs_notes = site.notes | where: "category", "observability" %}
  {% if obs_notes.size > 0 %}
    {% for post in obs_notes %}
      <div class="note-content">
        <h3>{{ post.title }}</h3>
        {{ post.content }}
      </div>
      {% unless forloop.last %}<hr class="note-separator">{% endunless %}
    {% endfor %}
  {% else %}
    *No notes yet in this category.*
  {% endif %}
</div>

---

<div id="programming" class="notes-category">
  ## Programming

  Go, Python, Rust, and software development practices.

  {% assign prog_notes = site.notes | where: "category", "programming" %}
  {% if prog_notes.size > 0 %}
    {% for post in prog_notes %}
      <div class="note-content">
        <h3>{{ post.title }}</h3>
        {{ post.content }}
      </div>
      {% unless forloop.last %}<hr class="note-separator">{% endunless %}
    {% endfor %}
  {% else %}
    *No notes yet in this category.*
  {% endif %}
</div>

---

*More notes coming soon. This is a living document that grows as I learn.*
