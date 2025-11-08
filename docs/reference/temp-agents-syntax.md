# Temporary Agents Syntax Reference

Quick reference for temporary agent syntax in orchestration workflows.

## Definition Syntax

### Basic Definition

```
$agent-name := {base: "agent-type", prompt: "custom prompt"}
```

### Full Definition

```
$agent-name := {
  base: "agent-type",
  prompt: "detailed system prompt",
  model: "sonnet|opus|haiku"
}
```

### Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `base` | ✓ | Base agent type to use | `"general-purpose"`, `"Explore"`, `"code-reviewer"` |
| `prompt` | ✓ | Additional system prompt/context | `"You are a security expert..."` |
| `model` | ✗ | Model to use (default: sonnet) | `"opus"`, `"sonnet"`, `"haiku"` |

### Available Base Agents

- `general-purpose` - Versatile agent for most tasks
- `Explore` - Code exploration and search
- `code-reviewer` - Code review and quality checks
- `expert-code-implementer` - Code implementation
- `implementation-architect` - Planning and architecture

## Invocation Syntax

### With Output Capture

```
$agent-name:"instruction":output_var
```

Executes agent and stores result in `output_var`.

### Without Output Capture

```
$agent-name:"instruction"
```

Executes agent but doesn't capture output.

## Variable Interpolation

Reference captured outputs in subsequent instructions:

```
"Process the following data: {output_var}"
```

Variables are replaced with actual values at execution time.

## Complete Example

```
$analyzer := {
  base: "general-purpose",
  prompt: "Analyze code for bugs and issues",
  model: "sonnet"
}

$fixer := {
  base: "expert-code-implementer",
  prompt: "Fix issues while maintaining functionality",
  model: "haiku"
}

$analyzer:"Analyze the authentication module":issues ->
$fixer:"Fix these issues: {issues}":fixes ->
general-purpose:"Verify fixes work correctly"
```

## Workflow Integration

Temporary agents work seamlessly with standard orchestration syntax:

```
$custom-agent:"task":var -> @checkpoint -> [parallel || branches] -> standard-agent
```

## Parse-Time Transformation

**Input:**
```
$scanner := {base: "general-purpose", prompt: "Security scan", model: "opus"}
$scanner:"Scan code":results
```

**Transformed to:**
```
general-purpose:"Security scan\n\nScan code"
+ metadata: {outputVar: "results", model: "opus", tempAgentName: "scanner"}
```

## Best Practices

### Model Selection

- **Opus**: Complex analysis, security audits, architectural decisions
- **Sonnet**: General implementation, balanced cost/quality
- **Haiku**: Fast exploration, simple tasks, parallel branches

### Prompt Design

**Good prompts are:**
- Specific about domain/focus
- Include relevant constraints
- Mention expected output format

```
prompt: "You are a React expert. Focus on hooks usage, component size, and render optimization. Provide file:line references."
```

**Bad prompts:**
```
prompt: "Review the code"  // Too vague
```

### Variable Naming

Use descriptive variable names:

```
:scan_results     ✓ Clear what it contains
:output           ✗ Too generic
:auth_issues      ✓ Specific domain
:x                ✗ Meaningless
```

### Agent Granularity

**Too many agents:**
```
$agent1 := {base: "general-purpose", prompt: "..."}
$agent2 := {base: "general-purpose", prompt: "..."}
$agent3 := {base: "general-purpose", prompt: "..."}
[... 10 more ...]
```

**Better:**
```
$analyzer := {base: "Explore", prompt: "..."}
$implementer := {base: "expert-code-implementer", prompt: "..."}
```

Aim for 2-4 temporary agents per workflow.

## Common Patterns

### Analyze → Fix → Verify

```
$analyzer := {base: "Explore", prompt: "Find issues"}
$fixer := {base: "expert-code-implementer", prompt: "Fix issues"}

$analyzer:"Analyze code":issues ->
$fixer:"Fix {issues}":fixes ->
general-purpose:"Verify {fixes}"
```

### Parallel Analysis → Aggregate

```
$agent1 := {base: "Explore", prompt: "Check A"}
$agent2 := {base: "Explore", prompt: "Check B"}

[
  $agent1:"Analyze":results_a ||
  $agent2:"Analyze":results_b
] ->
general-purpose:"Report on {results_a} and {results_b}"
```

### Iterative Refinement

```
$improver := {base: "general-purpose", prompt: "Improve code"}

@start ->
$improver:"Improve code":improved ->
general-purpose:"Check quality":quality
(if issues)~> @start
```

## Error Messages

### Undefined Agent

```
Error: Undefined temporary agent '$scanner'
Available agents: $analyzer, $fixer
```

**Fix:** Check agent name spelling or add definition.

### Missing Variable

```
Error: Variable 'results' referenced but not produced
```

**Fix:** Add `:results` to an agent invocation to capture output.

### Variable Not Ready

```
Error: Cannot execute node: missing variables: results
```

**Fix:** Ensure agent producing `results` runs before agent consuming it.

### Missing Required Field

```
Error: Temporary agent 'scanner' missing required field: base
```

**Fix:** Add `base: "agent-type"` to definition.

## Debugging Tips

1. **Check definitions** - Ensure all `$agent` references have matching definitions
2. **Verify variable flow** - Trace which agent produces which variable
3. **Test incrementally** - Start with one temp agent, add more gradually
4. **Use checkpoints** - Add `@checkpoint` after temp agents to inspect outputs
5. **Check models** - Ensure model choice matches task complexity

## Limitations

- Temporary agents exist only during workflow execution
- Each agent can capture only one output variable
- Variables are interpolated as strings (not structured data)
- Agent definitions must appear before first invocation
- Maximum ~2000 characters per variable (truncated if longer)

## See Also

- `docs/features/temporary-agents.md` - Full design specification
- `examples/workflow-with-temp-agents.flow` - Example workflow using temp agents
- `docs/reference/variable-binding.md` - Variable binding reference
