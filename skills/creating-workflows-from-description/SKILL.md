---
name: creating-workflows-from-description
description: Use when user describes complex multi-step tasks that could benefit from orchestration - guides natural language workflow creation
---

# Creating Workflows from Description

## When to Use

Proactively suggest orchestration when user describes tasks involving:

- **Multiple sequential steps** with dependencies
- **Parallel operations** that could run simultaneously
- **Conditional logic** or branching (if/then scenarios)
- **Error handling** or retry requirements
- **Testing, review, and deployment** phases
- **Complex multi-agent coordination**
- **Quality gates** or approval checkpoints

## Trigger Patterns

Watch for these patterns in user messages:

**Explicit workflow requests:**
- "I need to [multi-step task]"
- "Help me build a pipeline for [process]"
- "Create a workflow that [description]"
- "Automate [complex task]"

**Implicit workflow descriptions:**
- User describes 3+ sequential steps
- User mentions temporal ordering: "then", "after that", "once that's done"
- User mentions conditionals: "if that works", "if tests pass"
- User mentions parallel work: "at the same time", "in parallel", "simultaneously"
- User mentions reviews/approvals: "needs review", "after approval"
- User mentions retry/error handling: "if it fails", "retry", "rollback"

**Example phrases:**
- "run tests, then if they pass..."
- "deploy to production after security review"
- "implement with TDD workflow"
- "check code quality before merging"
- "parallel test execution"

## Action

When triggers detected, suggest orchestration:

```
This sounds like a perfect use case for orchestration! I can help you create a workflow that handles:

[List 2-4 key aspects identified from description, e.g.:]
- Sequential testing and deployment steps
- Parallel validation (tests + security scan)
- Conditional deployment based on test results
- Automatic rollback on failure

Would you like me to guide you through creating this workflow?
```

**If user says yes:**

Execute the create command with their description:
```
/orchestration:create [initial description from user message]
```

**If user says no or wants to see example first:**

Show relevant example from docs/reference/examples.md that matches their pattern.

## Examples

### Example 1: TDD Workflow

**User:** "I need to implement authentication using test-driven development"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a TDD workflow that handles:
- Writing tests first
- Running tests and tracking results
- Implementing features to pass tests
- Automatic retry loop for failed tests

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create implement authentication with TDD`

### Example 2: Deployment Pipeline

**User:** "Can you help me set up automated deployment that runs tests first, then if everything passes, does a security scan, and only deploys if both succeed?"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a deployment pipeline that handles:
- Parallel test and security validation
- Quality gate before deployment (both must pass)
- Automatic deployment when validation succeeds
- Rollback capability if deployment fails

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create deploy with tests and security validation`

### Example 3: Code Review Workflow

**User:** "I want to make sure all my changes go through code review and pass linting before merging"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a review workflow that handles:
- Parallel code review and linting
- Quality gate (both must succeed)
- Manual approval checkpoint
- Automatic merge after approval

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create code review with linting and approval`

## Don't Trigger For

**Simple single-step tasks:**
- "Run the tests" ← just run tests
- "Deploy to production" ← single action
- "Review this code" ← single agent

**Already using orchestration syntax:**
- User provides workflow syntax directly
- User asks to modify existing workflow

**Exploratory questions:**
- "What is orchestration?"
- "How does the menu work?"
- "Show me examples"

## Integration

This skill makes Claude proactive about suggesting orchestration when appropriate. It works alongside:

- `/orchestration:create` - Command this skill triggers
- `using-orchestration` - General guidance skill
- `workflow-socratic-designer` - Agent this launches

## Success Criteria

✅ Claude suggests orchestration for multi-step tasks
✅ Claude identifies parallel opportunities
✅ Claude recognizes conditional logic needs
✅ Claude explains workflow benefits before offering
✅ Claude uses /orchestration:create when user agrees
