# Agent Promotion Flow

After a workflow completes successfully using temp agents, the system offers to promote them to permanent defined agents.

## Overview

The promotion flow helps you build a library of reusable agents over time by:
1. Analyzing which temp agents are reusable
2. Providing smart recommendations
3. Allowing batch selection
4. Cleaning up unselected agents

## How It Works

### Step 1: Workflow Completion

When a workflow using temp agents completes successfully:

```
✓ Workflow completed successfully!

Execution summary:
- security-scanner: analyzed 87 files, found 12 issues
- vulnerability-fixer: fixed 10 vulnerabilities
- code-reviewer: reviewed all changes
```

### Step 2: Smart Analysis

The system analyzes each temp agent for reusability:

**Generic agents** (recommend saving):
- Describe general capabilities
- Use generic names
- No specific file paths or project references
- Structured output formats

**Workflow-specific agents** (don't recommend):
- Reference specific files or line numbers
- One-off task descriptions
- Project-specific context

### Step 3: Batch Selection

You'll see a prompt with recommendations:

```
Temp agents used in this workflow:

✓ [Recommended] security-scanner
  Generic security analysis - likely useful for other workflows

✓ [Recommended] code-reviewer
  General code review capability - reusable pattern

✗ [Not recommended] vulnerability-fixer
  Contains workflow-specific instructions for this codebase

Select which agents to save as permanent defined agents:
☐ security-scanner (recommended)
☐ vulnerability-fixer
☐ code-reviewer (recommended)
```

### Step 4: Processing

Selected agents are:
1. Moved from `temp-agents/` to `agents/`
2. Added to `agents/registry.json`
3. Available for future workflows

Unselected agents are deleted.

### Step 5: Confirmation

```
✓ Saved 2 agents:
  - security-scanner → agents/security-scanner.md
  - code-reviewer → agents/code-reviewer.md

These agents are now available for future workflows!
Cleaned up 1 temp agent(s)
```

## Edge Cases

### No Temp Agents Used

If workflow only uses built-in or defined agents, promotion is skipped.

### All Workflow-Specific

```
No reusable agents detected.
All temp agents deleted.
```

### Name Conflicts

If an agent name already exists:
```
code-analyzer already exists in defined agents.
Options:
1. Rename new agent to code-analyzer-2
2. Overwrite existing agent
3. Skip this agent
```

### User Cancels

All temp agents are deleted.

## Best Practices

1. **Trust recommendations** - The AI analysis is usually accurate
2. **Don't over-save** - Only promote truly reusable agents
3. **Review before promoting** - Check the agent file if unsure
4. **Clean naming** - Rename generic if needed (e.g., "analyzer" → "security-analyzer")

## Manual Promotion

You can also manually promote agents outside the workflow:

```bash
# Move agent file
mv temp-agents/my-agent.md agents/my-agent.md

# Update registry (or use agent-manager.promoteAgent())
```

## See Also

- [Defined Agents](./defined-agents.md) - Learn about permanent agents
- [Temporary Agents](./temporary-agents.md) - Learn about temp agents
