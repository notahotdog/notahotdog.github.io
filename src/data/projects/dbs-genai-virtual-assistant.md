---
title: "GenAI Virtual Assistant"
description: "Production RAG assistant with real-time transcription serving 500 CSOs and 250K+ monthly customers. Cut review time 90% and call handling time 20%."
pubDatetime: 2024-08-01T00:00:00Z
role: "ML Ops & Software Engineer @ DBS Bank"
stack:
  - vLLM
  - ONNX
  - FastT5
  - OpenShift
  - RAG
  - Grafana
  - Python
featured: true
draft: false
---

<a class="bookmark" href="https://www.dbs.com/newsroom/DBS_empowers_its_Customer_Service_Officers_with_Gen_AI_powered_virtual_assistant_to_reduce_toil_and_enhance_customer_experience" target="_blank" rel="noreferrer"><span class="bookmark-title">DBS empowers its Customer Service Officers with Gen AI-powered virtual assistant to reduce toil and enhance customer experience</span><span class="bookmark-description">DBS is deploying a generative AI virtual assistant called "CSO Assistant" to its 500 customer service officers in Singapore by the end of 2024. The in-house developed tool transcribes customer queries in real-time and retrieves relevant information from the bank's knowledge base, expected to reduce call handling time by up to 20%.</span><span class="bookmark-url"><img src="https://www.google.com/s2/favicons?domain=dbs.com&sz=32" alt="" /><span>dbs.com/newsroom/DBS_empowers_its_Customer_Service_Officers_with_Gen_AI_powered_virtual_assistant…</span></span></a>

## TL;DR

A production GenAI assistant deployed to 500 Customer Service Officers serving 250,000+ monthly customers at DBS Bank. Combined RAG-based knowledge retrieval with real-time call transcription, reducing manual post-call review time by **90%** and overall call handling time by **20%**.

## What it does

Two things, both in real time:

1. **Live knowledge retrieval during calls** — the assistant transcribes the conversation, pulls relevant policy snippets and procedural docs from a vector index, and surfaces them to the CSO in their console without them having to search.
2. **Automated post-call documentation** — at call end, a summarization pipeline produces a structured case note from the transcript, which the CSO reviews and approves rather than writing from scratch.

## The infrastructure stack

- **Model serving**: vLLM for the primary LLM, ONNX + FastT5 for smaller summarization models. Quantization and batch processing on A100/H100 GPU clusters. Designed to scale to **6,000+ concurrent users**.
- **Deployment**: OpenShift (Kubernetes) with auto-scaling and GPU-aware scheduling. Zero-downtime rolling updates and rollback strategies via the internal model registry.
- **Retrieval**: vector database with prompt-engineered RAG pipelines. After evaluating multiple LLM configurations, we landed on a setup that improved retrieval speed by **70%** versus the baseline.
- **Observability**: Grafana dashboards for inference latency, GPU utilization, and queue depth, hooked into the team's incident triage flow.

## What I owned

- End-to-end production deployment of the LLM serving stack (vLLM/ONNX/FastT5 + OpenShift).
- Vector DB infrastructure and RAG prompt strategies.
- Model lifecycle: registry, versioning, rollback, drift monitoring.
- Telemetry and on-call runbooks.

## Outcomes

- **90%** reduction in manual review time for post-call documentation.
- **20%** reduction in overall call handling time.
- Demos to senior leadership directly influenced the bank's strategic decision to expand GenAI initiatives bank-wide.
