---
title: "Genie Broker"
description: "An end-to-end LLM-powered insurance renewal automation platform — multi-agent orchestration, RAG document extraction, and a production-ready handover."
pubDatetime: 2025-11-15T00:00:00Z
role: "AI R&D Intern @ Marsh McLennan"
stack:
  - LangGraph
  - RAG
  - FastAPI
  - TypeScript
  - Docker
  - Python
featured: true
draft: false
---

## TL;DR

Genie Broker is a LangGraph-based multi-agent system that automates insurance renewal across four policy complexity tiers, projecting a **75–90% reduction in manual processing time**. Built end-to-end during a 6-month R&D internship at Marsh McLennan and handed over to the development team with full technical documentation.

## The problem

Insurance renewals are a brutal manual workflow. Brokers manually extract clauses, line items, and risk profiles from PDFs, cross-reference them against historical policy data, and assemble new quote bundles. Each renewal can take hours, and the work scales linearly with portfolio size.

We wanted to know: how much of this could a multi-agent LLM system actually handle, and where do the failure modes live?

## What I built

The platform is a multi-agent pipeline:

1. **Document ingestion** — RAG-based extraction over policy PDFs, building a structured representation of clauses, coverages, and risk factors.
2. **Routing agent** — classifies the renewal into one of four complexity tiers and dispatches to the right downstream workflow.
3. **Specialist agents** — per-tier agents handle quote assembly, risk delta analysis, and clause comparison against the prior year.
4. **Review/handoff** — outputs flagged for human-in-the-loop review with confidence scoring and source citations.

The orchestration layer is LangGraph; the API surface is FastAPI with a TypeScript frontend; deployment goes through an internal CI/CD pipeline (Polaris) with Docker containerization.

## Tool selection: why LangGraph

Before committing, I evaluated AutoGen, CrewAI, LangChain, and LangGraph against three criteria that matter inside a regulated environment:

- **Determinism**: how predictable is the agent graph under repeated inputs?
- **Reliability**: how does the framework behave under partial failures, timeouts, and tool errors?
- **Production readiness**: observability, state management, deployability.

LangGraph won on determinism (explicit state machine model) and observability (per-node execution traces). AutoGen was the closest runner-up but felt too conversational for a deterministic pipeline.

## What I learned

- **Agent quality is mostly prompt + tool design, not framework choice.** The framework is plumbing. The signal lives in how clearly you define each agent's input contract, output contract, and failure mode.
- **Document extraction is still the hardest layer.** RAG on insurance PDFs hits a wall on tables, footnotes, and clauses with embedded references. Most of the engineering time went here.
- **Mentoring forces clarity.** I worked alongside other interns and wrote the technical docs as I went. Anything I couldn't explain in writing was usually a sign the abstraction was wrong.

## Outcome

- Production-ready design handed over with comprehensive technical documentation
- Projected 75–90% reduction in manual processing time
- Established LangGraph as the standard agentic AI framework for the team's enterprise deployments
