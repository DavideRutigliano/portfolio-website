---
layout: archive
permalink: /notes/
title: "Notes"
sidebar:
  include: "sidebar-notes.html"
author_profile: false
toc: false
---

A collection of technical notes, reference materials, and things I've learned along the way. These are my personal knowledge base entries — not polished tutorials, but practical notes for quick reference.

<div id="notes-welcome" class="notes-category-container" style="display: block;">
  <p><em>Select a category from the left menu to view the concepts and notes.</em></p>
</div>

{% assign subcats = "cloud-native|kubernetes|Cloud Native: Kubernetes,cloud-native|kubernetes-gpu|Cloud Native: Kubernetes + GPU,cloud-native|observability|Cloud Native: Observability,ai-inference|llm-serving|AI Inference,devops|cicd-fundamentals|DevOps: CI/CD Fundamentals,devops|deployment-strategies|DevOps: Deployment Strategies,devops|iac-gitops|DevOps: IaC & GitOps,devops|sre-principles|DevOps: SRE Principles,programming|golang|Programming: Golang,hpc-ai-infrastructure|gpu|HPC / AI Infrastructure: GPU Fundamentals,hpc-ai-infrastructure|storage-networking|HPC / AI Infrastructure: Storage & Networking,virtualization|kubernetes|Virtualization: KubeVirt,networking|dhcp|Networking: DHCP,networking|dns|Networking: DNS,system-design|distributed-systems|System Design: Distributed Systems,system-design|networking|System Design: Networking,system-design|storage-databases|System Design: Storage & Databases,system-design|scalability-reliability|System Design: Scalability & Reliability,system-design|case-studies|System Design: Case Studies" | split: "," %}

{% for subcat in subcats %}
  {% assign parts = subcat | split: "|" %}
  {% assign m_cat = parts[0] %}
  {% assign c_cat = parts[1] %}
  {% assign title = parts[2] %}
  
  <div id="{{ m_cat }}-{{ c_cat }}" class="notes-category-container" style="position: absolute; left: -9999px; visibility: hidden; height: 0; overflow: hidden;">
    
    {% assign current_macros = site.notes | where: "macro_category", m_cat %}
    {% assign current_notes = current_macros | where: "category", c_cat | sort: "order" %}
    
    {% if current_notes.size > 0 %}
      <div class="custom-right-toc" style="float: right; width: 250px; position: sticky; top: 4em; padding-left: 1em; border-left: 1px solid #eee; margin-top: 2em; margin-bottom: 2em;">
        <h4 style="margin-top: 0; margin-bottom: 0.5em; font-size: 1em;">Concepts</h4>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.85em;">
        {% for post in current_notes %}
          <li style="margin-bottom: 0.5em;"><a href="#{{ post.title | slugify }}" onclick="document.getElementById('{{ post.title | slugify }}').scrollIntoView({behavior: 'smooth', block: 'start'}); return false;" style="text-decoration: none; color: inherit;">{{ post.title }}</a></li>
        {% endfor %}
        </ul>
      </div>

      <div class="notes-category-main" style="width: calc(100% - 270px); float: left;">
        <h2>{{ title }}</h2>
        {% for post in current_notes %}
          <div id="{{ post.title | slugify }}" class="note-content" style="padding-top: 2em;">
            {{ post.content }}
          </div>
          {% unless forloop.last %}<hr class="note-separator">{% endunless %}
        {% endfor %}
      </div>
      <div style="clear: both;"></div>
    {% else %}
      <h2>{{ title }}</h2>
      <p><em>No notes yet in this category.</em></p>
    {% endif %}
  </div>
{% endfor %}

<script>
function showCategory(targetId, el) {
    /* Hide all category containers */
    var containers = document.querySelectorAll('.notes-category-container');
    containers.forEach(function(c) {
        c.style.position = 'absolute';
        c.style.left = '-9999px';
        c.style.visibility = 'hidden';
        c.style.height = '0';
        c.style.overflow = 'hidden';
    });
    
    /* Show the target container */
    var target = document.getElementById(targetId);
    if (target) {
        target.style.position = 'static';
        target.style.left = 'auto';
        target.style.visibility = 'visible';
        target.style.height = 'auto';
        target.style.overflow = 'visible';
    }
    
    /* Update active state in sidebar */
    var links = document.querySelectorAll('.subcat-link');
    links.forEach(function(link) {
        link.style.fontWeight = 'normal';
    });
    
    if (el) {
        el.style.fontWeight = 'bold';
    } else {
        /* Find the element with this data-target if called programmatically */
        var link = document.querySelector('.subcat-link[data-target="' + targetId + '"]');
        if (link) {
            link.style.fontWeight = 'bold';
        }
    }
    
    /* Update URL hash without jump, if supported */
    if(history.pushState) {
        history.pushState(null, null, '#' + targetId);
    } else {
        window.location.hash = targetId;
    }
}

/* Support hash routing on load */
document.addEventListener("DOMContentLoaded", function() {
    var hash = window.location.hash.substring(1);
    /* basic check if it's a category container vs a specific note header */
    if (hash && document.getElementById(hash) && document.getElementById(hash).classList.contains('notes-category-container')) {
        showCategory(hash, null);
    }
});
</script>
