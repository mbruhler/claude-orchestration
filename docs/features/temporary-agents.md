# Temporary Agents - Design Specification

## New Architecture (2025-01-08)

Temp agents are now full standalone agents, not wrappers:

- **Old**: `$analyzer := {base: "Explore", prompt: "..."}`
- **New**: Full `.md` files in `temp-agents/` folder

Temp agents are:
- Created automatically by workflow designer
- Full agent definitions with detailed prompts
- Ephemeral (deleted after workflow unless promoted)
- Identical to defined agents except for persistence

See [Agent Promotion](./agent-promotion.md) for converting temp to defined agents.

## Overview (Legacy Documentation)

Temporary agents allow you to define custom, workflow-specific agents inline using the `$` syntax. They are expanded at parse-time into standard agent nodes with enhanced instructions, and can pass state between each other through named variables.

## Syntax

### Agent Definition

```
$agent-name := {base: "agent-type", prompt: "custom prompt", model: "sonnet|opus|haiku"}
```

**Fields:**
- `base` (required): The base agent type (general-purpose, Explore, code-reviewer, etc.)
- `prompt` (required): Additional system prompt/context for this agent
- `model` (optional): Model to use (sonnet, opus, haiku). Defaults to sonnet.

**Example:**
```
$security-scanner := {
  base: "general-purpose",
  prompt: "You are a security expert. Focus on OWASP vulnerabilities, SQL injection, XSS, and CSRF.",
  model: "opus"
}
```

### Agent Invocation

```
$agent-name:"instruction":output_var
```

**Parts:**
- `$agent-name`: Reference to defined temporary agent
- `"instruction"`: Specific task instruction for this invocation
- `:output_var`: (optional) Variable name to store the output

**Example:**
```
$security-scanner:"Scan the authentication code":scan_results
```

### Variable Interpolation

Reference outputs from previous agents using `{var_name}`:

```
$reporter:"Create a report from {scan_results}":report
```

## Parse-Time Behavior

### Phase 1: Extract Definitions

Parser scans for `$name := {...}` patterns and builds a registry:

```javascript
tempAgentRegistry = {
  'security-scanner': {
    base: 'general-purpose',
    prompt: 'You are a security expert...',
    model: 'opus'
  }
}
```

### Phase 2: Expand Invocations

When parser encounters `$agent-name:"instruction":output_var`:

1. **Look up definition** in registry
2. **Create standard agent node**:
   ```javascript
   {
     id: 'node-1',
     type: 'agent',
     agent: definition.base,  // 'general-purpose'
     instruction: definition.prompt + '\n\n' + 'instruction',
     outputVar: 'output_var',
     model: definition.model,
     status: 'pending'
   }
   ```
3. **Track variable** in graph metadata

### Phase 3: Process Variable References

When parsing instructions with `{varname}`:
- Mark as template (needs interpolation)
- Add dependency tracking (this node depends on node producing `varname`)

## Execution-Time Behavior

### Variable Storage

Graph maintains a variables map:

```javascript
graph.variables = {
  'scan_results': null,  // Set when node completes
  'report': null
}
```

### Instruction Interpolation

Before executing a node:
1. Check if instruction contains `{...}` templates
2. Replace with values from `graph.variables`
3. Execute with interpolated instruction

### Output Capture

After node execution:
1. If node has `outputVar`, store result in `graph.variables[outputVar]`
2. Make available for subsequent nodes

## Complete Example

### Workflow Definition

```
$security-scanner := {
  base: "general-purpose",
  prompt: "You are a security expert. Focus on OWASP top 10 vulnerabilities.",
  model: "opus"
}

$fixer := {
  base: "expert-code-implementer",
  prompt: "Fix security issues while maintaining functionality.",
  model: "sonnet"
}

$security-scanner:"Scan authentication and authorization code":issues ->
$fixer:"Fix the following issues: {issues}":fixes ->
general-purpose:"Verify fixes are complete"
```

### Parse-Time Transformation

**Step 1: Extract definitions**
```javascript
registry = {
  'security-scanner': {base: 'general-purpose', prompt: '...', model: 'opus'},
  'fixer': {base: 'expert-code-implementer', prompt: '...', model: 'sonnet'}
}
```

**Step 2: Transform to graph**
```javascript
{
  nodes: [
    {
      id: 'node-0',
      type: 'agent',
      agent: 'general-purpose',
      instruction: 'You are a security expert...\n\nScan authentication and authorization code',
      outputVar: 'issues',
      model: 'opus'
    },
    {
      id: 'node-1',
      type: 'agent',
      agent: 'expert-code-implementer',
      instruction: 'Fix security issues...\n\nFix the following issues: {issues}',  // Template
      outputVar: 'fixes',
      model: 'sonnet',
      templateVars: ['issues']  // Depends on 'issues' variable
    },
    {
      id: 'node-2',
      type: 'agent',
      agent: 'general-purpose',
      instruction: 'Verify fixes are complete'
    }
  ],
  edges: [
    {from: 'node-0', to: 'node-1'},
    {from: 'node-1', to: 'node-2'}
  ],
  variables: {}
}
```

### Execution Flow

**Execute node-0:**
```javascript
await Task({
  subagent_type: 'general-purpose',
  description: 'Security scan',
  prompt: 'You are a security expert...\n\nScan authentication and authorization code',
  model: 'opus'
})
// Result: "Found 3 SQL injection vulnerabilities in auth.js:42, 67, 89"

graph.variables['issues'] = result
```

**Execute node-1:**
```javascript
// Interpolate instruction
const interpolated = 'Fix security issues...\n\nFix the following issues: Found 3 SQL injection vulnerabilities...'

await Task({
  subagent_type: 'expert-code-implementer',
  description: 'Fix security issues',
  prompt: interpolated,
  model: 'sonnet'
})

graph.variables['fixes'] = result
```

**Execute node-2:**
```javascript
await Task({
  subagent_type: 'general-purpose',
  description: 'Verify fixes',
  prompt: 'Verify fixes are complete'
})
```

## Benefits

1. **Simple**: Parse-time expansion means no runtime complexity
2. **Clear**: Standard graph structure, just with enhanced instructions
3. **Flexible**: Each temporary agent can use different models and prompts
4. **Stateful**: Variables pass data between agents naturally
5. **Debuggable**: Graph visualization shows actual agents and instructions

## Limitations

1. **No dynamic creation**: Agents must be defined before workflow execution
2. **Single output per agent**: Each agent can only capture one output variable
3. **String interpolation only**: Variables are stringified when interpolated

## Implementation Files

- `src/temp-agents-parser.js` - Parse and expand temporary agent syntax
- `src/temp-agents-executor.js` - Handle variable interpolation during execution
- Parser enhancement in `docs/core/parser.md`
- Executor enhancement in `docs/core/executor.md`
