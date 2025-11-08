# Cleanup and Namespacing Conventions

## Overview

This document describes the cleanup and namespacing conventions for the orchestration plugin to ensure proper resource management and avoid namespace conflicts.

## Automatic Cleanup

### What Gets Cleaned

After every workflow execution (success or failure), the system automatically cleans up:

1. **Temporary Agent Files** (`temp-agents/*.md`)
   - Deleted after workflow completion
   - Exception: User chooses to promote agents to permanent status
   - Location: `~/.claude/plugins/repos/orchestration/temp-agents/`

2. **Temporary JSON Files** (`examples/*.json`)
   - ALL `.json` files in examples/ directory
   - These are intermediate data files created during workflow execution
   - Location: `~/.claude/plugins/repos/orchestration/examples/`

### What Gets Preserved

- **Workflow Templates** (`examples/*.flow`) - Never deleted automatically
- **Defined Agents** (`agents/*.md`) - Permanent agent definitions
- **Promoted Temp Agents** - Moved to `agents/` and added to registry

### Cleanup Timing

```
Workflow Execution
       ↓
    Complete
       ↓
Agent Promotion (if temp agents used)
   ↓ (user selects agents to save)
       ↓
Cleanup Phase
   ↓ (delete unselected temp agents)
   ↓ (delete ALL .json files)
       ↓
   Final Report
```

### Implementation

The cleanup happens in **Phase 8** of the workflow execution (see `commands/run.md`):

```javascript
async function cleanupTemporaryFiles() {
  // 1. Temp agents already handled by agent promotion phase

  // 2. Clean up ALL JSON files
  const jsonFiles = glob('examples/*.json');
  for (const file of jsonFiles) {
    await deleteFile(file);
  }

  // 3. Report to user
  console.log(`🧹 Cleaned up ${jsonFiles.length} temporary file(s)`);
}
```

## Namespace Prefixing

### Why Namespacing?

Agents from plugins must be distinguishable from built-in Claude Code agents. The `orchestration:` prefix ensures:

1. No conflicts with built-in agents
2. Clear identification of plugin-provided agents
3. Proper routing in the Task tool

### Namespace Rules

| Agent Type | Namespace | Example |
|------------|-----------|---------|
| Built-in agents | None | `Explore`, `general-purpose`, `code-reviewer` |
| Plugin defined agents | `orchestration:` | `orchestration:workflow-socratic-designer` |
| Plugin temp agents | `orchestration:` | `orchestration:news-analyzer` |

### In Workflow Syntax

Users write workflows WITHOUT the namespace prefix:

```flow
# User writes:
$news-analyzer:"Analyze articles"

# System expands to:
orchestration:news-analyzer
```

### At Execution Time

The executor automatically prefixes plugin agents:

```javascript
// Workflow references agent by name
const agentName = "news-analyzer";

// Executor adds namespace prefix
Task({
  subagent_type: "orchestration:news-analyzer",
  description: "Temp agent: news-analyzer",
  prompt: "..."
})
```

### Agent Resolution Algorithm

```javascript
function resolveAgent(agentName) {
  // 1. Check if it's a built-in agent
  const builtInAgents = [
    'Explore', 'general-purpose', 'code-reviewer',
    'implementation-architect', 'expert-code-implementer'
  ];

  if (builtInAgents.includes(agentName)) {
    return agentName; // Use as-is
  }

  // 2. Check if it's a superpowers agent
  if (agentName.startsWith('superpowers:')) {
    return agentName; // Use as-is
  }

  // 3. Otherwise, it's a plugin agent - add namespace
  return `orchestration:${agentName}`;
}
```

## Registry Structure

The `agents/registry.json` file documents all defined agents with their namespaces:

```json
{
  "$schema": {
    "description": "Registry of defined agents in the orchestration plugin",
    "namespace": "orchestration:",
    "usage": "All agents are accessed via 'orchestration:{agent-name}'"
  },
  "workflow-socratic-designer": {
    "file": "workflow-socratic-designer.md",
    "description": "Guide users through Socratic questioning",
    "namespace": "orchestration:workflow-socratic-designer",
    "created": "2025-11-08",
    "usageCount": 0
  }
}
```

## Best Practices

### For Plugin Developers

1. **Always use namespace prefix** when calling Task tool with plugin agents
2. **Never hardcode agent names** - use registry to look up agents
3. **Document namespace** in agent frontmatter and descriptions

### For Workflow Authors

1. **Don't include namespace prefix** in workflow syntax - it's added automatically
2. **Use temp agents liberally** - they're automatically cleaned up
3. **Promote reusable agents** when prompted - helps build library

### For System Maintainers

1. **Run cleanup after every workflow** - prevents disk bloat
2. **Monitor temp-agents/ directory** - should be mostly empty between runs
3. **Audit examples/ directory** - should only contain .flow files

## Examples

### Complete Workflow Lifecycle

```flow
# 1. User creates workflow with temp agent
$analyzer := {base: "general-purpose", prompt: "Analyze code"}
$analyzer:"Check for bugs":results

# 2. Execution:
#    - System creates temp-agents/analyzer.md
#    - System calls Task with subagent_type: "orchestration:analyzer"
#    - May create examples/intermediate-data.json

# 3. Completion:
#    - User prompted: "Save analyzer as permanent agent?"
#    - If yes: moved to agents/analyzer.md, added to registry
#    - If no: deleted from temp-agents/

# 4. Cleanup:
#    - ALL .json files deleted from examples/
#    - Unsaved temp agents deleted
#    - User sees: "🧹 Cleaned up 2 temporary file(s)"
```

### Namespace Resolution

```javascript
// Workflow syntax
"$news-scraper:\"Scrape Polish news\""

// Parse phase
{
  agentType: "news-scraper",
  agentSource: "temp",
  instruction: "Scrape Polish news"
}

// Execution phase
Task({
  subagent_type: "orchestration:news-scraper", // ← Namespace added!
  description: "Temp agent: news-scraper",
  prompt: loadTempAgent("news-scraper").prompt + "\n\n" + instruction
})
```

## Troubleshooting

### "Agent not found" Error

If you see this error:
```
Error: Agent 'orchestration:my-agent' not found
```

**Possible causes:**
1. Temp agent file doesn't exist in `temp-agents/`
2. Defined agent not in `agents/` or `registry.json`
3. Typo in agent name
4. Agent was already cleaned up

**Solutions:**
1. Check `temp-agents/` and `agents/` directories
2. Verify agent name spelling
3. If temp agent, ensure it was created before use
4. If defined agent, check `registry.json`

### Cleanup Not Happening

If temp files aren't being deleted:

**Check:**
1. Did workflow reach completion?
2. Was there an error before cleanup phase?
3. Are file permissions correct?

**Debug:**
```bash
# Check for orphaned files
ls -la ~/.claude/plugins/repos/orchestration/temp-agents/
ls -la ~/.claude/plugins/repos/orchestration/examples/*.json

# Manual cleanup if needed
rm ~/.claude/plugins/repos/orchestration/examples/*.json
```

### Namespace Conflicts

If you get namespace conflicts between plugins:

**Solution:** Each plugin uses its own namespace:
- `orchestration:agent-name`
- `other-plugin::agent-name`

These don't conflict because namespaces are distinct.

## See Also

- [Temporary Agents](../features/temporary-agents.md) - How temp agents work
- [Agent Promotion](../features/agent-promotion.md) - Saving temp agents as permanent
- [Defined Agents](../features/defined-agents.md) - Creating permanent agents
- [Workflow Execution](../../commands/run.md) - Complete execution flow including cleanup
