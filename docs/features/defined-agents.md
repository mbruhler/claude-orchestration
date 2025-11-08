# Defined Agents

Defined agents are permanent, reusable custom agents stored in the `agents/` folder. They work exactly like Claude Code's built-in subagents but are scoped to the orchestration plugin.

## What Are Defined Agents?

Defined agents are:
- **Permanent** - Saved to disk and available across all workflows
- **Reusable** - Can be used in multiple workflows
- **Custom** - Tailored to specific tasks or domains
- **Full agents** - Complete agent definitions, not wrappers

## File Structure

Each defined agent is a `.md` file in `agents/`:

```markdown
---
name: code-analyzer
description: Analyzes code for bugs, security issues, and code smells
created: 2025-01-08
---

You are a comprehensive code analyzer specializing in identifying issues across codebases.

Your responsibilities:
1. Scan for bugs, security vulnerabilities, and performance issues
2. Identify code smells and maintainability concerns
3. Check for best practice violations

[... detailed instructions ...]
```

## Usage in Workflows

Use defined agents by name in workflow syntax:

```
code-analyzer:"Scan the auth module":issues ->
general-purpose:"Generate report from {issues}":report
```

## Creating Defined Agents

Two ways to create defined agents:

### 1. Promotion from Temp Agents

After a workflow executes successfully with temp agents, you'll be prompted to promote them:

```
✓ [Recommended] security-scanner
  Generic security analysis - likely useful for other workflows

Select which agents to save as permanent defined agents:
☑ security-scanner
```

### 2. Manual Creation

Create a new `.md` file in `agents/` and add to registry:

1. Create `agents/your-agent-name.md`
2. Update `agents/registry.json`
3. Use in workflows

## Registry System

The `agents/registry.json` file tracks all defined agents:

```json
{
  "code-analyzer": {
    "file": "code-analyzer.md",
    "description": "Analyzes code for bugs and issues",
    "created": "2025-01-08",
    "usageCount": 15
  }
}
```

## Best Practices

1. **Generic prompts** - Write agents for general use cases, not specific files
2. **Clear responsibilities** - Define exactly what the agent does
3. **Structured output** - Specify output format for consistency
4. **Tool guidance** - Recommend which Claude Code tools to use
5. **Good naming** - Use descriptive, generic names (e.g., "code-analyzer" not "fix-auth-bug")

## See Also

- [Temporary Agents](./temporary-agents.md) - Ephemeral agents for one-time use
- [Agent Promotion](./agent-promotion.md) - Converting temp agents to defined agents
