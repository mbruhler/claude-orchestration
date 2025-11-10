---
description: Import agents from Claude Code environment to orchestration plugin context
---

# Initialize Orchestration Plugin

Import custom agents from your Claude Code environment (`~/.claude/agents/`) into the orchestration plugin's **skills context**, making them available globally for all workflows without needing to copy files.

## Usage

```
/orchestration:init
```

This command will:
1. Scan `~/.claude/agents/` for custom agent definitions
2. Show you which agents are available to import
3. Let you select which agents to register
4. Add agent references to the orchestration skills context
5. Make agents available for use in all workflows

## How It Works

The command:
- ✅ Finds all `.md` files in `~/.claude/agents/`
- ✅ Excludes built-in Claude Code agents (Explore, Plan, general-purpose)
- ✅ Shows agent names and descriptions
- ✅ Lets you select individual agents or import all
- ✅ Registers agents in orchestration skills context (NOT copied, just referenced)
- ✅ Updates agent availability mapping
- ✅ Agents remain in original location but become usable in workflows

## Example Flow

```
User: /orchestration:init

Claude: Found 5 custom agents in ~/.claude/agents/:

1. expert-code-implementer
   Description: Specialized agent for implementing code features

2. code-optimizer
   Description: Performance and code quality optimization

3. implementation-architect
   Description: System design and architecture planning

4. jwt-keycloak-security-auditor
   Description: Security auditing for JWT and Keycloak

5. react-native-component-reviewer
   Description: React Native component review and validation

Which agents would you like to import?
- Import all
- Select individual agents
- Cancel

User: Select individual agents

Claude: [Shows checkboxes for agents]
☑ expert-code-implementer
☑ code-optimizer
☐ implementation-architect
☑ jwt-keycloak-security-auditor
☐ react-native-component-reviewer

User: [Confirms selection]

Claude: ✅ Registered 3 agents in orchestration context:
- expert-code-implementer (from ~/.claude/agents/expert-code-implementer.md)
- code-optimizer (from ~/.claude/agents/code-optimizer.md)
- jwt-keycloak-security-auditor (from ~/.claude/agents/jwt-keycloak-security-auditor.md)

Updated orchestration skills context.

You can now use these agents directly in workflows:
- expert-code-implementer:"task"
- code-optimizer:"task"
- jwt-keycloak-security-auditor:"task"

No need for orchestration: prefix - they're available as if they were built-in!
```

## Action

**Step 1**: Scan for custom agents

1. Use Glob tool to find all `.md` files in `~/.claude/agents/`
2. Filter out built-in agents: `explore`, `plan`, `general-purpose`
3. For each custom agent file:
   - Read the file using Read tool
   - Extract description from frontmatter or first heading
   - Store agent name and description
4. If no custom agents found, inform user and exit

**Step 2**: Present agents to user using AskUserQuestion

**IMPORTANT:** MUST use AskUserQuestion tool for interactive selection!

1. Create options array from discovered agents
2. Each option should have:
   - `label`: agent name (e.g., "expert-code-implementer")
   - `description`: agent description or "No description available"
3. Use AskUserQuestion tool:
   - `question`: "Select agents to register in orchestration context. These agents will become available for use in workflows."
   - `header`: "Import Agents"
   - `multiSelect`: true (allow multiple selections)
   - `options`: the options array
4. Parse the response to get list of selected agent names

**Step 3**: Register selected agents in skills context

For each selected agent:

1. Read the agent file from `~/.claude/agents/{agent-name}.md`
2. Extract metadata (name, description)
3. Create reference mapping (do NOT copy the file!)
4. Store mapping with:
   - Agent name
   - Description
   - Path to original file: `~/.claude/agents/{agent-name}.md`
   - Type: "external"

**Step 4**: Create or update agent registry for orchestration context

**IMPORTANT:** Use `${CLAUDE_PLUGIN_ROOT}` for all plugin workspace paths!

1. Create agent registry JSON object with:
   - `externalAgents`: object containing all registered agents
   - `lastUpdated`: current timestamp
2. For each selected agent, add entry:
   - Key: agent name
   - Value object:
     - `path`: `~/.claude/agents/{agent-name}.md` (external path, read-only)
     - `description`: agent description
     - `registered`: today's date
     - `usageCount`: 0
3. Save registry to plugin workspace using Write tool:
   - Path: `${CLAUDE_PLUGIN_ROOT}/skills/managing-agents/external-agents.json`
   - Format: Pretty-printed JSON with 2-space indentation

**Step 5**: Update orchestration skills to recognize external agents

1. Create available-agents.md document content with:
   - Section: "Built-in Claude Code Agents"
     - Explore - Fast codebase exploration
     - Plan - Planning and task breakdown
     - general-purpose - Versatile multi-step tasks
   - Section: "Registered External Agents"
     - List all agents from registry with their descriptions
   - Section: "Usage in Workflows"
     - Show example of using external agent directly
     - Note that orchestration resolves agent from ~/.claude/agents/
2. Write document to plugin workspace using Write tool:
   - Path: `${CLAUDE_PLUGIN_ROOT}/skills/managing-agents/available-agents.md`

**Step 6**: Confirm completion

Show user:
- Number of agents registered
- Agent names and their source paths
- How to use them in workflows (direct name, no namespace needed)
- Confirmation that they're available in orchestration skills context

## Implementation Details

### Agent Metadata Extraction

Extract from agent file:
```markdown
---
name: expert-code-implementer
description: Specialized agent for implementing code features
---
```

OR from first heading:
```markdown
# Expert Code Implementer

Specialized agent for implementing code features
```

### Built-in Agents to Skip

Never import these (they're built into Claude Code):
- `explore.md` / `Explore`
- `plan.md` / `Plan`
- `general-purpose.md`

### External Agents Registry Structure

Saved to: `~/.claude/plugins/repos/orchestration/skills/managing-agents/external-agents.json`

```json
{
  "externalAgents": {
    "expert-code-implementer": {
      "path": "~/.claude/agents/expert-code-implementer.md",
      "description": "Specialized agent for implementing code features",
      "registered": "2025-01-08",
      "usageCount": 0
    },
    "code-optimizer": {
      "path": "~/.claude/agents/code-optimizer.md",
      "description": "Performance and code quality optimization",
      "registered": "2025-01-08",
      "usageCount": 0
    }
  },
  "lastUpdated": "2025-01-08T12:00:00.000Z"
}
```

### Available Agents Documentation

Saved to: `~/.claude/plugins/repos/orchestration/skills/managing-agents/available-agents.md`

This file is automatically included in orchestration skills context, making all registered agents available to workflows.

## Error Handling

- **No agents found**: Inform user that ~/.claude/agents/ is empty or doesn't exist
- **Agent already exists**: Ask if user wants to overwrite or skip
- **Invalid agent file**: Warn about malformed files and skip them
- **Registry update fails**: Show error and list which agents were copied

## Notes

- **No file copying**: Agents remain in `~/.claude/agents/`, orchestration just creates references
- **Direct usage**: Use agents by name in workflows (e.g., `expert-code-implementer:"task"`)
- **No namespace needed**: External agents work like built-in agents once registered
- **Re-runnable**: Run `/orchestration:init` again to register new agents or update existing
- **View registered agents**: Use `/orchestration:menu` to see all available agents
- **Skills context**: Registration updates orchestration skills so agents are globally available

## How Orchestration Resolves Agents

When you use an agent in a workflow:

```flow
expert-code-implementer:"Implement feature X"
```

The orchestration system:
1. Checks if it's a built-in agent (Explore, Plan, general-purpose)
2. If not, looks in `external-agents.json` for the mapping
3. Finds the path: `~/.claude/agents/expert-code-implementer.md`
4. Uses that agent definition for the Task tool

This means **no duplication** - agents live in one place, available everywhere!