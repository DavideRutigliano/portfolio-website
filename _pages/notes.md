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
  
  <div id="{{ m_cat }}-{{ c_cat }}" class="notes-category-container" style="display: none;">
    
    {% assign current_macros = site.notes | where: "macro_category", m_cat %}
    {% assign current_notes = current_macros | where: "category", c_cat | sort: "order" %}
    
    {% if current_notes.size > 0 %}
      <div class="custom-right-toc" style="float: right; width: 250px; position: sticky; top: 4em; padding-left: 1em; border-left: 1px solid #eee; margin-top: 2em; margin-bottom: 2em;">
        <h4 style="margin-top: 0; margin-bottom: 0.5em; font-size: 1em;">Concepts</h4>
        <ul class="dynamic-toc-list" style="list-style: none; padding: 0; margin: 0; font-size: 0.85em;">
          <!-- Populated by JS -->
        </ul>
      </div>

      <div class="notes-category-main" style="width: calc(100% - 270px); float: left; min-height: 600px;">
        <h2>{{ title }}</h2>
        {% for post in current_notes %}
          <div class="note-content" style="padding-top: 2em;">
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
function generateTOC(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var tocList = container.querySelector('.dynamic-toc-list');
    if (!tocList) return;
    
    tocList.innerHTML = '';
    var headers = container.querySelectorAll('.note-content h2, .note-content h3');
    
    headers.forEach(function(h, index) {
        if (!h.id) {
            h.id = 'heading-' + containerId + '-' + index;
        }
        
        var li = document.createElement('li');
        li.style.marginBottom = '0.5em';
        if (h.tagName === 'H3') {
            li.style.paddingLeft = '1em';
            li.style.fontSize = '0.95em';
            li.style.opacity = '0.8';
        }
        
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.style.textDecoration = 'none';
        a.style.color = 'inherit';
        a.onclick = function(e) {
            e.preventDefault();
            h.scrollIntoView({behavior: 'smooth', block: 'start'});
            if(history.pushState) {
                history.pushState(null, null, '#' + h.id);
            }
        };
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

function showCategory(targetId, el) {
    /* Hide all category containers */
    var containers = document.querySelectorAll('.notes-category-container');
    containers.forEach(function(c) {
        c.style.display = 'none';
    });
    
    var welcome = document.getElementById('notes-welcome');
    if (welcome) welcome.style.display = 'none';
    
    /* Show the target container */
    var target = document.getElementById(targetId);
    if (target) {
        target.style.display = 'block';
        generateTOC(targetId);
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
