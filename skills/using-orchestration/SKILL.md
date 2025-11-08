---
name: using-orchestration
description: Use when user has complex multi-agent workflows, needs to coordinate sequential or parallel agent execution, wants workflow visualization and control, or mentions automating repetitive multi-agent processes - guides discovery and usage of the orchestration system
---

# Using the Orchestration System

## When to Suggest

Proactively suggest `/orchestrate` when user describes:

**Clear Triggers:**
- Multiple agents needed in sequence: "explore then review then implement"
- Parallel operations: "run tests and lint at the same time"
- Conditional workflows: "if tests pass, deploy; if failed, fix and retry"
- Retry logic: "keep trying until it works"
- Workflow automation: "I do this same process often"
- Multiple checkpoints: "I want to review before deploying"

**Specific Phrases:**
- "coordinate multiple agents"
- "workflow", "pipeline", "orchestrate"
- "run these in parallel"
- "if X then Y"
- "retry until success"
- "automate this process"

## How to Introduce

When triggers detected, suggest proactively:

```
This workflow would benefit from orchestration. I can use `/orchestrate` to:
- Visualize the workflow graph
- Execute agents in parallel where possible
- Handle retries and conditionals
- Provide interactive control at checkpoints

Would you like me to use `/orchestrate [workflow-syntax]` or create a reusable template?
```

**First-time setup reminder:**

If user mentions custom agents (like `expert-code-implementer`, `code-optimizer`, etc.) that aren't in the orchestration namespace:

```
I notice you have custom agents in your environment.
Would you like to import them to orchestration first?

Run: /orchestration:init

This will make your custom agents available in workflows as:
- orchestration:expert-code-implementer
- orchestration:code-optimizer
- etc.
```

## Quick Syntax Reference

Show relevant syntax based on user's needs:

**Sequential:** `explore:"task" -> review -> implement`
**Parallel:** `[test || lint || security]`
**Conditional:** `test (if passed)~> deploy`
**Retry:** `@try -> fix -> test (if failed)~> @try`

## When NOT to Suggest

- Single agent task (no coordination needed)
- Simple sequential tasks (<3 steps, no conditionals)
- User explicitly requests manual coordination
- Task already in progress without orchestration

## Integration Pattern

When user agrees to orchestration:
1. Parse their requirements into workflow syntax
2. Invoke `/orchestrate [workflow-syntax]`
3. Let the orchestration system handle execution
4. Don't manually coordinate agents - let orchestrator do it
