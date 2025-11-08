# Agent Namespacing Reference

## Why Namespacing?

Agent namespacing is critical for the orchestration system to properly route agent invocations. Without namespacing:

- **Conflicts with built-in agents**: Plugin agents could shadow Claude Code's built-in agents
- **Ambiguous routing**: The system wouldn't know whether to use a plugin agent or built-in agent
- **Cross-plugin conflicts**: Multiple plugins could define agents with the same name
- **Task tool routing**: The Task tool needs to know which agent system to route to

Namespacing ensures that every agent has a unique identifier and the system can correctly resolve and execute the right agent.

## Namespace Rules

| Agent Type | User Writes | System Executes | Example Use Case |
|------------|-------------|-----------------|------------------|
| Built-in | `Explore:"task"` | `Explore` | Code exploration and analysis |
| Built-in | `general-purpose:"task"` | `general-purpose` | General purpose tasks |
| Built-in | `code-reviewer:"task"` | `code-reviewer` | Code review |
| Plugin defined | `workflow-socratic-designer` | `orchestration:workflow-socratic-designer` | Workflow creation |
| Plugin defined | `workflow-executor` | `orchestration:workflow-executor` | Workflow execution |
| Temp agent | `$security-scanner` | `orchestration:security-scanner` | One-off security scanning |
| Temp agent | `$data-transformer` | `orchestration:data-transformer` | Workflow-specific data transformation |

**Key takeaway**: Users write the short form, the system automatically adds the namespace prefix during execution.

## Namespace Format

### Plugin Agents
- Format: `orchestration:agent-name`
- Single colon (NOT `orchestration::` or `orchestration/`)
- Lowercase with hyphens (kebab-case)
- Examples:
  - ✅ `orchestration:workflow-socratic-designer`
  - ✅ `orchestration:validation-expert`
  - ❌ `orchestration::workflow-designer` (double colon)
  - ❌ `orchestration/workflow-designer` (slash)
  - ❌ `orchestration:WorkflowDesigner` (camelCase)

### Other Plugin Namespaces
- Format: `plugin-name:agent-name`
- Examples:
  - `superpowers:brainstorming`
  - `superpowers:code-reviewer`

## Automatic Namespace Prefixing

The orchestration system automatically adds the `orchestration:` prefix to plugin and temp agents. Users never manually add the prefix in workflow syntax.

**User writes**:
```flow
workflow-socratic-designer:"create a data processing workflow"
```

**System transforms to**:
```javascript
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  instructions: "create a data processing workflow"
})
```

This automatic prefixing happens during the workflow parsing phase, before execution.

## Agent Resolution Algorithm

The system uses a three-step algorithm to resolve agent names:

```javascript
function resolveAgent(name) {
  // 1. Check if it's a built-in Claude Code agent
  const builtIns = [
    'Explore',
    'general-purpose',
    'code-reviewer',
    'implementation-architect',
    'expert-code-implementer'
  ];

  if (builtIns.includes(name)) {
    return name; // Use as-is, no prefix
  }

  // 2. Check if it already has a namespace (from another plugin)
  if (name.includes(':')) {
    return name; // Already namespaced, use as-is
  }

  // 3. Add orchestration namespace
  return `orchestration:${name}`;
}
```

**Resolution examples**:
- `Explore` → `Explore` (built-in, no prefix)
- `workflow-socratic-designer` → `orchestration:workflow-socratic-designer` (plugin agent)
- `$news-analyzer` → `orchestration:news-analyzer` (temp agent, `$` stripped)
- `superpowers:brainstorming` → `superpowers:brainstorming` (other plugin, no change)

## In Workflow Syntax

### Example 1: Mixed Agent Types

**User writes**:
```flow
Explore:"analyze the codebase structure" ->
workflow-socratic-designer:"create a testing workflow" ->
$test-executor:"run the generated tests"
```

**System executes**:
```javascript
// Step 1: Built-in agent
Task({
  subagent_type: "Explore",
  instructions: "analyze the codebase structure"
})

// Step 2: Plugin defined agent
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  instructions: "create a testing workflow"
})

// Step 3: Temp agent
Task({
  subagent_type: "orchestration:test-executor",
  instructions: "run the generated tests"
})
```

### Example 2: Parallel Execution

**User writes**:
```flow
{
  Explore:"find all API endpoints",
  workflow-socratic-designer:"design API test workflow",
  $security-checker:"check for vulnerabilities"
}
```

**System executes** (all in parallel):
```javascript
[
  Task({ subagent_type: "Explore", ... }),
  Task({ subagent_type: "orchestration:workflow-socratic-designer", ... }),
  Task({ subagent_type: "orchestration:security-checker", ... })
]
```

## Registry Structure

All defined plugin agents are registered in `agents/registry.json`:

```json
{
  "agents": [
    {
      "name": "workflow-socratic-designer",
      "namespace": "orchestration",
      "fullName": "orchestration:workflow-socratic-designer",
      "file": "agents/workflow-socratic-designer.md",
      "description": "Creates workflows through Socratic dialogue"
    },
    {
      "name": "workflow-executor",
      "namespace": "orchestration",
      "fullName": "orchestration:workflow-executor",
      "file": "agents/workflow-executor.md",
      "description": "Executes workflow definitions"
    }
  ]
}
```

The registry is used for:
- Agent discovery and documentation
- Validation (ensuring agent exists before execution)
- Auto-completion suggestions
- Error messages ("Did you mean...?")

## Temp Agent Namespacing

Temporary agents (defined inline in workflows) follow the same namespacing rules:

1. **User defines with `$` prefix**:
   ```flow
   $news-analyzer:{
     role: "Analyze news articles",
     instructions: "Extract key facts and sentiment"
   }
   ```

2. **System strips `$` and adds namespace**:
   ```javascript
   // Internal representation
   {
     name: "news-analyzer",
     fullName: "orchestration:news-analyzer",
     role: "Analyze news articles",
     instructions: "Extract key facts and sentiment"
   }
   ```

3. **Execution uses namespaced form**:
   ```javascript
   Task({
     subagent_type: "orchestration:news-analyzer",
     instructions: "Analyze the latest tech news"
   })
   ```

4. **Cleanup after workflow**:
   - Temp agent definition removed from memory
   - Unless promoted to permanent agent (via promotion flow)

## Common Issues and Solutions

### Issue 1: Agent Not Found Error

**Error message**:
```
Error: Agent 'my-analyzer' not found
```

**Possible causes**:
- Agent file doesn't exist in `agents/` or `temp-agents/`
- Typo in agent name
- Agent not registered in `registry.json` (for defined agents)

**Solution**:
1. Check spelling: `my-analyzer` vs `my-analizer`
2. Verify file exists: `agents/my-analyzer.md`
3. For defined agents, check `agents/registry.json`
4. For temp agents, ensure definition appears before usage

### Issue 2: Manually Adding Namespace

**Wrong**:
```flow
orchestration:workflow-socratic-designer:"create workflow"
```

**Right**:
```flow
workflow-socratic-designer:"create workflow"
```

The system adds the namespace automatically. Manual namespace addition will cause the agent to not be found (it will look for `orchestration:orchestration:workflow-socratic-designer`).

### Issue 3: Incorrect Namespace Format

**Wrong**:
```javascript
// In agent file or registry
{
  "namespace": "orchestration::workflow-designer" // Double colon
}
```

**Right**:
```javascript
{
  "namespace": "orchestration:workflow-designer" // Single colon
}
```

### Issue 4: Case Sensitivity

**Wrong**:
```flow
WorkflowSocraticDesigner:"task"
```

**Right**:
```flow
workflow-socratic-designer:"task"
```

Agent names are case-sensitive and should always use kebab-case (lowercase with hyphens).

## Complete Examples

### Example 1: Simple Built-in Agent

**Workflow**:
```flow
Explore:"Find all configuration files in the project"
```

**Execution**:
```javascript
Task({
  subagent_type: "Explore",
  instructions: "Find all configuration files in the project"
})
```

**Result**: Uses Claude Code's built-in Explore agent directly.

### Example 2: Plugin Agent Only

**Workflow**:
```flow
workflow-socratic-designer:"Design a CI/CD workflow for testing"
```

**Execution**:
```javascript
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  instructions: "Design a CI/CD workflow for testing"
})
```

**Result**: Uses the orchestration plugin's workflow designer agent.

### Example 3: Sequential with Mixed Types

**Workflow**:
```flow
Explore:"Analyze database schema" ->
workflow-socratic-designer:"Create data migration workflow" ->
general-purpose:"Validate the migration plan"
```

**Execution**:
```javascript
// Step 1
Task({ subagent_type: "Explore", instructions: "Analyze database schema" })

// Step 2 (uses result from step 1 via context)
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  instructions: "Create data migration workflow"
})

// Step 3 (uses results from steps 1 and 2)
Task({
  subagent_type: "general-purpose",
  instructions: "Validate the migration plan"
})
```

**Result**: Chains built-in agents with plugin agents seamlessly.

### Example 4: Temp Agent Definition and Usage

**Workflow**:
```flow
$i18n-scanner:{
  role: "Scan codebase for hardcoded strings that need internationalization",
  instructions: "Find all user-facing strings not using i18n functions"
}

Explore:"List all React components" ->
$i18n-scanner:"Scan components for hardcoded strings" ->
general-purpose:"Create a report of findings"
```

**Execution**:
```javascript
// Temp agent registered as orchestration:i18n-scanner

// Step 1
Task({ subagent_type: "Explore", instructions: "List all React components" })

// Step 2
Task({
  subagent_type: "orchestration:i18n-scanner",
  instructions: "Scan components for hardcoded strings"
})

// Step 3
Task({
  subagent_type: "general-purpose",
  instructions: "Create a report of findings"
})
```

**Result**: Temp agent is created, used, and cleaned up after workflow completion.

### Example 5: Parallel Execution with Multiple Namespaces

**Workflow**:
```flow
{
  Explore:"Find all test files",
  workflow-socratic-designer:"Design integration test workflow",
  $coverage-analyzer:"Analyze current test coverage"
}
```

**Execution** (all parallel):
```javascript
[
  Task({ subagent_type: "Explore", instructions: "Find all test files" }),
  Task({
    subagent_type: "orchestration:workflow-socratic-designer",
    instructions: "Design integration test workflow"
  }),
  Task({
    subagent_type: "orchestration:coverage-analyzer",
    instructions: "Analyze current test coverage"
  })
]
```

**Result**: Three agents execute simultaneously, each properly namespaced.

### Example 6: Cross-Plugin Agent Usage

**Workflow**:
```flow
Explore:"Analyze codebase" ->
superpowers:brainstorming:"Brainstorm refactoring approaches" ->
workflow-socratic-designer:"Create refactoring workflow"
```

**Execution**:
```javascript
// Step 1: Built-in
Task({ subagent_type: "Explore", instructions: "Analyze codebase" })

// Step 2: Superpowers plugin
Task({
  subagent_type: "superpowers:brainstorming",
  instructions: "Brainstorm refactoring approaches"
})

// Step 3: Orchestration plugin
Task({
  subagent_type: "orchestration:workflow-socratic-designer",
  instructions: "Create refactoring workflow"
})
```

**Result**: Seamless integration across multiple plugin ecosystems.

### Example 7: Complex Multi-Stage Workflow

**Workflow**:
```flow
$requirements-analyzer:{
  role: "Analyze project requirements",
  instructions: "Extract functional and non-functional requirements"
}

$architecture-designer:{
  role: "Design system architecture",
  instructions: "Create architecture based on requirements"
}

Explore:"Scan existing codebase" ->
$requirements-analyzer:"Analyze requirements from docs" ->
{
  $architecture-designer:"Design new architecture",
  workflow-socratic-designer:"Create implementation workflow",
  general-purpose:"Identify potential risks"
} ->
code-reviewer:"Review proposed changes"
```

**Execution flow**:
```javascript
// Step 1: Built-in
Task({ subagent_type: "Explore", ... })

// Step 2: Temp agent
Task({ subagent_type: "orchestration:requirements-analyzer", ... })

// Step 3: Three parallel agents
[
  Task({ subagent_type: "orchestration:architecture-designer", ... }),
  Task({ subagent_type: "orchestration:workflow-socratic-designer", ... }),
  Task({ subagent_type: "general-purpose", ... })
]

// Step 4: Built-in (uses all previous results)
Task({ subagent_type: "code-reviewer", ... })
```

**Result**: Complex workflow with temp agents, plugin agents, and built-in agents working together.

## Best Practices

### 1. Use Built-in Agents When Possible

Built-in agents are well-tested and optimized for common tasks:

```flow
// Good: Use built-in for code exploration
Explore:"Find all API endpoints"

// Unnecessary: Creating temp agent for same task
$code-explorer:{role: "Find code"} ->
$code-explorer:"Find all API endpoints"
```

### 2. Create Plugin Agents for Specialized, Reusable Tasks

Define plugin agents for domain-specific work you'll use repeatedly:

```javascript
// Good: Specialized, reusable agent
// agents/api-documentation-generator.md
{
  "name": "api-documentation-generator",
  "namespace": "orchestration",
  "role": "Generate API documentation from code"
}
```

### 3. Use Temp Agents for Workflow-Specific Needs

Temp agents are perfect for one-off, workflow-specific tasks:

```flow
// Good: Workflow-specific agent
$stripe-webhook-validator:{
  role: "Validate Stripe webhook signatures and payloads",
  instructions: "Check webhook authenticity and parse events"
}
```

### 4. Never Hardcode Namespace Prefixes

Let the system handle namespacing:

```flow
// Wrong: Manual namespace
orchestration:workflow-socratic-designer:"task"

// Right: System handles it
workflow-socratic-designer:"task"
```

### 5. Use Consistent Naming Conventions

Follow kebab-case for all agent names:

```flow
// Good
workflow-socratic-designer
api-test-generator
security-vulnerability-scanner

// Avoid
workflowSocraticDesigner  // camelCase
workflow_socratic_designer // snake_case
WorkflowSocraticDesigner   // PascalCase
```

### 6. Document Agent Purpose in Registry

Keep `agents/registry.json` up-to-date with clear descriptions:

```json
{
  "name": "workflow-socratic-designer",
  "description": "Creates workflows through Socratic dialogue, asking clarifying questions to understand user needs"
}
```

### 7. Validate Agent Existence Before Complex Workflows

For workflows with many agents, validate upfront:

```flow
// List available agents first
Explore:"Check agents/registry.json" ->
workflow-socratic-designer:"Create workflow using validated agents"
```

### 8. Use Context Passing Between Namespaced Agents

Agents automatically receive context from previous steps:

```flow
Explore:"Find database models" ->
workflow-socratic-designer:"Create CRUD workflow for models" ->
// Designer receives model information from Explore automatically
```

## Summary

Namespacing in the orchestration system is automatic and transparent to users:

- **Write simple names**: `workflow-socratic-designer`, `$temp-agent`
- **System adds namespace**: `orchestration:workflow-socratic-designer`, `orchestration:temp-agent`
- **Built-ins stay unchanged**: `Explore`, `general-purpose`
- **Other plugins respected**: `superpowers:brainstorming`

This design provides clarity, prevents conflicts, and enables seamless multi-agent orchestration across different agent systems.
