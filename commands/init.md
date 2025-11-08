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

```javascript
// Find all agent files in ~/.claude/agents/
const agentsDir = "~/.claude/agents/";
const builtInAgents = ["explore", "plan", "general-purpose"];

// Use Glob to find all .md files
Glob({ pattern: "*.md", path: agentsDir })

// Read each file to extract description
// Parse frontmatter or first heading for agent info
```

**Step 2**: Present agents to user

Use AskUserQuestion to show available agents:

```javascript
AskUserQuestion({
  questions: [{
    question: "Which agents would you like to import to orchestration plugin?",
    header: "Import Agents",
    multiSelect: true,
    options: [
      // For each agent found:
      {
        label: "agent-name",
        description: "Agent description from file"
      }
    ]
  }]
})
```

**Step 3**: Register selected agents in skills context

For each selected agent:

```javascript
// 1. Read source file to extract metadata
const sourceContent = Read({ file_path: `~/.claude/agents/${agentName}.md` })

// 2. Extract agent metadata (name, description)
const metadata = extractMetadata(sourceContent)

// 3. Create reference mapping (NOT copying the file)
agentMappings.push({
  name: agentName,
  description: metadata.description,
  path: `~/.claude/agents/${agentName}.md`,
  type: "external"
})
```

**Step 4**: Create or update agent registry for orchestration context

```javascript
// Create/update orchestration agent registry
// This is a mapping file that tells orchestration system about available agents

const agentRegistry = {
  externalAgents: {},
  lastUpdated: new Date().toISOString()
}

for (const agent of selectedAgents) {
  agentRegistry.externalAgents[agent.name] = {
    path: `~/.claude/agents/${agent.name}.md`,
    description: agent.description,
    registered: new Date().toISOString().split('T')[0],
    usageCount: 0
  }
}

// Save to orchestration skills context
// This makes agents available to ALL orchestration workflows
Write({
  file_path: "~/.claude/plugins/repos/orchestration/skills/managing-agents/external-agents.json",
  content: JSON.stringify(agentRegistry, null, 2)
})
```

**Step 5**: Update orchestration skills to recognize external agents

Add context to relevant skills so they know about external agents:

```javascript
// Update creating-workflows/available-agents.md
const availableAgentsDoc = `
# Available Agents for Workflows

## Built-in Claude Code Agents
- Explore - Fast codebase exploration
- Plan - Planning and task breakdown
- general-purpose - Versatile multi-step tasks

## Plugin Agents
${Object.keys(agentRegistry.externalAgents).map(name =>
  `- ${name} - ${agentRegistry.externalAgents[name].description}`
).join('\n')}

## Usage in Workflows

External agents can be used directly by name:
\`\`\`
expert-code-implementer:"Implement feature X"
\`\`\`

The orchestration system will automatically resolve the agent from ~/.claude/agents/
`

Write({
  file_path: "~/.claude/plugins/repos/orchestration/skills/managing-agents/available-agents.md",
  content: availableAgentsDoc
})
```

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