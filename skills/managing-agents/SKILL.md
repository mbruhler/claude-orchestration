---
name: managing-agents
description: Manages temporary and defined agents including creation, promotion, cleanup, and namespacing. Use when user creates custom agents, asks about agent lifecycle, temp agents, or agent management.
---

# Managing Orchestration Agents

I manage the lifecycle of agents in the orchestration system: creation, execution, promotion, and cleanup.

## When I Activate

I automatically activate when you:
- Create or define custom agents
- Ask about agent lifecycle
- Mention temp agents or agent promotion
- Want to understand agent namespacing
- Ask "how do I create an agent?"

## Agent Types

### Built-in Agents

**No namespace prefix**, always available:
- `Explore` - Codebase exploration
- `general-purpose` - General-purpose tasks
- `code-reviewer` - Code review
- `implementation-architect` - Architecture planning
- `expert-code-implementer` - Code implementation

### Plugin Defined Agents

**With `orchestration:` prefix**, permanent agents in this plugin:
- `orchestration:workflow-socratic-designer`
- `orchestration:workflow-syntax-designer`
- Custom agents you promote

Located in: `agents/` directory
Registry: `agents/registry.json`

### Temp Agents

**With `orchestration:` prefix**, workflow-specific ephemeral agents:
- Created during workflow design
- Saved in `temp-agents/` directory
- Auto-cleaned after workflow execution
- Can be promoted to permanent

Reference in workflows: `$agent-name`

## Temp Agent Lifecycle

See [temp-agents.md](temp-agents.md) for complete guide.

### 1. Creation

Created automatically during workflow design:

```markdown
---
name: security-scanner
description: Scans for security vulnerabilities
created: 2025-01-08
---

You are a security expert specializing in vulnerability detection...
```

Saved to: `temp-agents/security-scanner.md`

### 2. Execution

Referenced in workflow with `$` prefix:

```flow
$security-scanner:"Scan codebase":findings ->
general-purpose:"Analyze {findings}"
```

Executed with namespace: `orchestration:security-scanner`

### 3. Promotion

After workflow completion, you can save temp agents:

```
Workflow complete!

Temp agents created:
  - security-scanner
  - performance-profiler

Save as permanent agents? [Y/n]
```

If saved:
- Moved from `temp-agents/` to `agents/`
- Added to `agents/registry.json`
- Available in all future workflows
- No need to recreate

### 4. Cleanup

Unsaved temp agents are deleted:

```
🧹 Cleaned up 2 temporary file(s):
   - temp-agents/security-scanner.md
   - examples/workflow-data.json
```

## Creating Defined Agents

See [defined-agents.md](defined-agents.md) for detailed guide.

To create a permanent agent manually:

### 1. Create Agent File

`agents/custom-agent.md`:

```markdown
---
name: custom-agent
namespace: orchestration:custom-agent
description: One-line description of what this agent does
tools: [Read, Grep, Edit]
usage: "Use via Task tool with subagent_type: 'orchestration:custom-agent'"
---

You are a specialized agent for [purpose].

Your responsibilities:
1. Task 1
2. Task 2

Output format:
[Expected output format]

Use these tools:
- Read: [When to use]
- Grep: [When to use]
```

### 2. Register Agent

Add to `agents/registry.json`:

```json
{
  "custom-agent": {
    "file": "custom-agent.md",
    "description": "One-line description",
    "namespace": "orchestration:custom-agent",
    "created": "2025-01-08",
    "usageCount": 0
  }
}
```

### 3. Use in Workflows

Reference by name (system adds namespace automatically):

```flow
custom-agent:"Perform specialized task":output
```

## Namespace Conventions

See [namespacing.md](namespacing.md) for complete reference.

### Namespace Rules

| Agent Type | User Writes | System Executes |
|------------|-------------|-----------------|
| Built-in | `Explore:"task"` | `Explore` |
| Defined plugin | `workflow-socratic-designer` | `orchestration:workflow-socratic-designer` |
| Temp | `$security-scanner` | `orchestration:security-scanner` |

### Why Namespacing?

1. **Avoid conflicts** - Plugin agents don't conflict with built-ins
2. **Clear identification** - Know which plugin provides agent
3. **Proper routing** - System knows where to find agent

### Resolution Algorithm

```javascript
function resolveAgent(name) {
  // 1. Check if built-in
  if (isBuiltIn(name)) return name;

  // 2. Check if other plugin (e.g., superpowers:)
  if (name.includes(':')) return name;

  // 3. Add orchestration namespace
  return `orchestration:${name}`;
}
```

## Agent Promotion Process

See [promotion.md](promotion.md) for details.

After workflow execution with temp agents:

### 1. Review Phase

```
Temp agents used in this workflow:

1. security-scanner
   Description: Scans for security vulnerabilities
   Used: 1 time in workflow

2. performance-profiler
   Description: Analyzes code performance
   Used: 1 time in workflow

Select agents to save (space-separated numbers, or 'none'):
```

### 2. Selection

```
You selected: security-scanner

Promotion options:
[P]romote as-is - Save with current definition
[E]dit first - Modify before saving
[S]kip - Don't save this agent
```

### 3. Promotion

If promoted:
1. File moved from `temp-agents/` to `agents/`
2. Entry added to `agents/registry.json`
3. Confirmation message shown

### 4. Cleanup

Unselected agents are deleted

## Agent Maintenance

### Updating Agents

To update a defined agent:

1. Edit `agents/agent-name.md`
2. Update description/responsibilities/tools
3. Optionally update `agents/registry.json` metadata

Changes take effect immediately in new workflows.

### Deleting Agents

To remove a defined agent:

1. Delete `agents/agent-name.md`
2. Remove entry from `agents/registry.json`

Agent will no longer be available in workflows.

### Agent Usage Statistics

Track agent usage in `agents/registry.json`:

```json
{
  "security-scanner": {
    "usageCount": 15,
    "lastUsed": "2025-01-08T14:30:00Z"
  }
}
```

## Best Practices

### Creating Agents

✅ **DO**:
- Make prompts comprehensive and specific
- Include clear output format requirements
- Recommend appropriate tools
- Handle edge cases
- Define success criteria

❌ **DON'T**:
- Create for simple one-line tasks
- Make too generic ("do analysis")
- Forget error handling
- Skip tool recommendations

### Promoting Agents

✅ **Promote when**:
- Agent is reusable across workflows
- Well-tested and reliable
- Provides domain-specific expertise
- Saves time in future workflows

❌ **Don't promote when**:
- One-time use only
- Too specific to single workflow
- Untested or unreliable
- Duplicates existing agent

### Naming Agents

✅ **Good names**:
- `security-scanner` (clear purpose)
- `api-doc-generator` (descriptive)
- `performance-profiler` (specific)

❌ **Bad names**:
- `helper` (too generic)
- `agent1` (meaningless)
- `do-stuff` (vague)

## Common Issues

**"Agent not found" error**:
- Check spelling of agent name
- Verify temp agent file exists in `temp-agents/`
- Ensure defined agent in `agents/` and registry
- Check if agent was already cleaned up

**Namespace conflict**:
- Built-in agents don't need prefix
- Plugin agents automatically prefixed
- Don't manually add `orchestration:` in workflows

**Temp agent disappeared**:
- Temp agents auto-deleted after workflow
- Save important agents during promotion phase
- Check cleanup logs for what was deleted

## Registry Structure

`agents/registry.json`:

```json
{
  "$schema": {
    "description": "Registry of defined agents",
    "namespace": "orchestration:",
    "usage": "All agents accessed via 'orchestration:{agent-name}'"
  },
  "agent-name": {
    "file": "agent-name.md",
    "description": "One-line description",
    "namespace": "orchestration:agent-name",
    "created": "2025-01-08",
    "usageCount": 0,
    "lastUsed": null
  }
}
```

## Examples

See examples in:
- [temp-agents.md](temp-agents.md) - Temp agent examples
- [defined-agents.md](defined-agents.md) - Permanent agent examples
- [promotion.md](promotion.md) - Promotion workflow examples

## Related Skills

- **creating-workflows**: Create workflows that use agents
- **executing-workflows**: Execute workflows with agents
- **designing-syntax**: Design custom syntax for agents

---

**Need to create or manage agents? Just ask!**
