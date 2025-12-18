---
description: Import agents from Claude Code environment to orchestration plugin context
---

# Initialize Orchestration Plugin

Import custom agents from your Claude Code environment to make them available in orchestration workflows.

## Usage

```
/orchestration:init
```

This command will:
1. **Scan** `~/.claude/agents/` for custom agent definitions
2. **Let you select** which agents to register
3. **Make agents available** for use in all workflows

## Action

**IMPORTANT:** Execute ALL steps in order. Use AskUserQuestion for user choices.

### Step 1: Scan for Custom Agents

1. Use Glob tool to find all `.md` files in `~/.claude/agents/`
2. Filter out built-in agents: `explore`, `plan`, `general-purpose`
3. For each custom agent file:
   - Read the file using Read tool
   - Extract description from frontmatter or first heading
   - Store agent name and description
4. If no custom agents found, inform user and exit

### Step 2: Present Agents to User

**IMPORTANT:** MUST use AskUserQuestion tool for interactive selection!

If custom agents were found:

1. Create options array from discovered agents
2. Each option should have:
   - `label`: agent name (e.g., "expert-code-implementer")
   - `description`: agent description or "No description available"
3. Use AskUserQuestion tool:
   - `question`: "Select agents to register in orchestration context. These agents will become available for use in workflows."
   - `header`: "Import Agents"
   - `multiSelect`: true (allow multiple selections)
   - `options`: the options array (max 4, if more agents exist, add "Import all" option)
4. Parse the response to get list of selected agent names

### Step 3: Register Selected Agents

For each selected agent:

1. Read the agent file from `~/.claude/agents/{agent-name}.md`
2. Extract metadata (name, description)
3. Create reference mapping (do NOT copy the file!)
4. Store mapping with:
   - Agent name
   - Description
   - Path to original file: `~/.claude/agents/{agent-name}.md`
   - Type: "external"

### Step 4: Update Agent Registry

**IMPORTANT:** Use `${CLAUDE_PLUGIN_ROOT}` for all plugin workspace paths!

1. Create agent registry JSON object:
```json
{
  "externalAgents": {
    "agent-name": {
      "path": "~/.claude/agents/agent-name.md",
      "description": "Agent description",
      "registered": "2025-11-26",
      "usageCount": 0
    }
  },
  "lastUpdated": "2025-11-26T12:00:00.000Z"
}
```

2. Save registry to: `${CLAUDE_PLUGIN_ROOT}/skills/managing-agents/external-agents.json`

### Step 5: Update Available Agents Documentation

1. Create `available-agents.md` with:
   - Built-in Claude Code Agents section
   - Registered External Agents section
   - Usage examples in workflows

2. Save to: `${CLAUDE_PLUGIN_ROOT}/skills/managing-agents/available-agents.md`

### Step 6: Show Completion Summary

Display final status:

```
Orchestration Plugin Initialized!

Agents:
- Imported 3 agents from ~/.claude/agents/
  - expert-code-implementer
  - code-optimizer
  - jwt-keycloak-security-auditor

Quick Start:
- Run workflows: /orchestration:run or /orchestration:orchestrate
- Create workflow: /orchestration:create
- Load template: /orchestration:template <name>
```

## Error Handling

- **No agents found**: Inform user, still successful initialization
- **Agent file invalid**: Warn and skip, continue with others
- **Permission error**: Show error, suggest checking file permissions

## Notes

- Re-running `/orchestration:init` is safe - will rescan and update agent registry
- Agent files are NOT copied, only referenced by path
- Use `/orchestration:menu` to access all features
