# Orchestration Syntax Reference

Quick reference card for workflow orchestration syntax.

## Operators

| Operator | Name | Description | Example |
|----------|------|-------------|---------|
| `->` | Sequential | Execute left before right | `a -> b` |
| `||` | Parallel | Execute simultaneously | `a || b` |
| `~>` | Conditional | Execute if condition met | `(if passed)~> deploy` |
| `@` | Checkpoint | Named pause/jump point | `@review` |
| `[...]` | Subgraph | Group operations | `[a || b]` |

## Agent Invocation

```
agent-name:"instruction text"
```

**Available Agents:**
- `general-purpose` - Versatile agent for most tasks
- `Explore` - Code exploration and search
- `code-reviewer` - Code review and quality checks
- `expert-code-implementer` - Code implementation
- `implementation-architect` - Planning and architecture

**Examples:**
```
Explore:"find all TODO comments"
general-purpose:"implement authentication"
code-reviewer:"check for security issues"
```

## Conditions

```
(if condition-text)~> next-step
```

**Standard Conditions:**
- `(if passed)` - Success indicators
- `(if failed)` - Failure indicators
- `(if no issues)` - No errors/warnings
- `(if all success)` - All parallel branches succeeded
- `(if any success)` - At least one branch succeeded

**Negative Conditions:**
```
(if !variable)~> handle-false
```

## Variable Binding

**Capture condition result:**
```
operation (condition):variable_name~>
```

**Reference variable:**
```
(if variable_name)~> handle-true ->
(if !variable_name)~> handle-false
```

**Example:**
```
test (if passed):tests_passing~>
  (if tests_passing)~> deploy ->
  (if !tests_passing)~> debug
```

## Temporary Agents

**Define:**
```
$agent-name := {base: "agent-type", prompt: "custom prompt", model: "sonnet"}
```

**Invoke with output capture:**
```
$agent-name:"instruction":output_var
```

**Interpolate variables:**
```
"Process this data: {output_var}"
```

**Example:**
```
$scanner := {base: "Explore", prompt: "Security expert", model: "opus"}
$scanner:"Scan auth code":issues ->
general-purpose:"Fix these: {issues}"
```

## Common Patterns

### Sequential Chain
```
step1 -> step2 -> step3
```

### Parallel Execution
```
[task1 || task2 || task3]
```

### Conditional Branch
```
check (if passed)~> success ->
check (if failed)~> failure
```

### Retry Loop
```
@try -> action (if failed)~> @try
```

### Quality Gate
```
[test || lint] (all success)~> deploy
```

### Multi-Stage Pipeline
```
build -> @review -> [test || security] -> @approve -> deploy
```

## Precedence

From highest to lowest:
1. `[...]` - Subgraphs
2. `||` - Parallel
3. `->` - Sequential
4. `~>` - Conditional

## Syntax Rules

**Whitespace:** Optional around operators, newlines treated as spaces

**Quotes:** Agent instructions must use double quotes (`"..."`)

**Identifiers:**
- Agent names: lowercase, hyphens allowed
- Labels: alphanumeric, hyphens, underscores

**Subgraphs:** Must be balanced (`[` matches `]`)

**Conditionals:** Parentheses required: `(if condition)~>`

## Error Prevention

✓ **Do:**
```
explore:"find auth bugs" -> @review -> fix
[test || lint] (all success)~> deploy
$scanner:"analyze":results
```

✗ **Don't:**
```
explore:find bugs                    # Missing quotes
test (passed)~> deploy              # Missing "if"
[test -> deploy                     # Unclosed bracket
$agent:"task"                       # Undefined temp agent
```

## See Also

- [Complete Syntax Guide](../topics/syntax.md) - Full syntax documentation with examples
- [Variable Binding](./variable-binding.md) - Detailed variable binding reference
- [Temporary Agents Syntax](./temp-agents-syntax.md) - Full temp agent reference
- [Best Practices](./best-practices.md) - Guidelines and patterns
