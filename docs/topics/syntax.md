# Topic: Syntax

Complete syntax reference for workflow orchestration.

## Overview

The orchestration syntax is a declarative language for defining multi-agent workflows. It uses intuitive operators to express sequential, parallel, and conditional execution patterns.

## Core Operators

### Sequential Flow: `->`
Executes left before right.

**Syntax:**
```
step1 -> step2 -> step3
```

**Example:**
```
explore:"find bugs" -> fix -> test
```

**Semantics:** step2 starts only after step1 completes

---

### Parallel Execution: `||`
Executes simultaneously.

**Syntax:**
```
step1 || step2 || step3
```

**Example:**
```
[test || lint || security]
```

**Semantics:** All steps launch concurrently, execution waits for all to complete

---

### Conditional Flow: `~>`
Executes only if condition met.

**Syntax:**
```
step (if condition)~> next
```

**Example:**
```
test (if passed)~> deploy
```

**Semantics:** Evaluates condition based on step output, follows edge only if true

---

### Checkpoint/Label: `@`
Named pause point or jump target.

**Syntax:**
```
@label
```

**Example:**
```
@review -> deploy
@try -> fix (if failed)~> @try
```

**Semantics:** Execution pauses, shows steering menu

---

### Subgraph: `[...]`
Groups operations.

**Syntax:**
```
[step1 -> step2]
[step1 || step2]
```

**Example:**
```
[analyze -> plan] -> implement
```

**Semantics:** Treated as single unit in larger workflow

---

## Agent Invocation

**Syntax:**
```
agent-name:"instruction text"
```

**Components:**
- `agent-name` - One of: explore, general-purpose, code-reviewer
- `:` - Separator
- `"instruction text"` - What the agent should do (must be quoted)

**Examples:**
```
explore:"find all TODO comments"
general-purpose:"implement authentication"
code-reviewer:"check for security issues"
```

**Semantics:** Launches agent via Task tool with specified instruction

---

## Condition Expressions

**Syntax:**
```
(if condition-text)
```

**Standard Conditions:**
- `(if passed)` - Success indicators in output
- `(if failed)` - Failure indicators in output
- `(if no issues)` - No errors/warnings in output
- `(if all success)` - All parallel branches succeeded
- `(if any success)` - At least one branch succeeded

**Custom Conditions:**
```
(if "found security issues")
(if "tests passing")
```

**Semantics:** Interprets natural language condition from agent output

---

## Variable Binding

Variables make conditions explicit and traceable.

### Syntax

Bind condition result to variable:
```
operation (condition):variable_name~>
```

Reference variable in later conditions:
```
(if variable_name)~> handle-true ->
(if !variable_name)~> handle-false
```

### Example

```
test (if passed):tests-passing~>
  (if tests-passing)~> deploy ->
  (if !tests-passing)~> debug
```

See [Variable Binding Reference](../reference/variable-binding.md) for complete documentation.

---

## EBNF Grammar

```ebnf
workflow     ::= step | step operator workflow
step         ::= agent | checkpoint | subgraph
agent        ::= identifier ":" string
checkpoint   ::= "@" identifier
subgraph     ::= "[" workflow "]"
operator     ::= "->" | "||" | conditional
conditional  ::= "(" "if" condition ")" "~>"
condition    ::= string
identifier   ::= [a-zA-Z0-9_-]+
string       ::= '"' [^"]* '"'
```

**Precedence (highest to lowest):**
1. `[...]` - Subgraphs
2. `||` - Parallel
3. `->` - Sequential
4. `~>` - Conditional

---

## Complete Examples

### Example 1: Simple Sequential
```
explore:"find bugs" -> review -> implement
```

**Parse Tree:**
```
Sequential
├─ Agent(explore, "find bugs")
├─ Agent(review, default)
└─ Agent(implement, default)
```

---

### Example 2: Parallel Branches
```
[test || lint || security]
```

**Parse Tree:**
```
Subgraph
└─ Parallel
   ├─ Agent(test, default)
   ├─ Agent(lint, default)
   └─ Agent(security, default)
```

---

### Example 3: Conditional Flow
```
test (if passed)~> deploy
```

**Parse Tree:**
```
Conditional
├─ Agent(test, default)
├─ Condition("passed")
└─ Agent(deploy, default)
```

---

### Example 4: Complex Combination
```
explore:"analyze" -> @review -> [fix || test] (all success)~> deploy
```

**Parse Tree:**
```
Sequential
├─ Agent(explore, "analyze")
├─ Checkpoint(@review)
├─ Conditional
│  ├─ Subgraph
│  │  └─ Parallel
│  │     ├─ Agent(fix, default)
│  │     └─ Agent(test, default)
│  ├─ Condition("all success")
│  └─ Agent(deploy, default)
```

---

## Syntax Patterns

### Basic Patterns

**Sequential Chain:**
```
a -> b -> c -> d
```

**Parallel Fan-out:**
```
[a || b || c]
```

**Parallel with Merge:**
```
start -> [a || b] -> merge -> end
```

**Conditional Branch:**
```
check (if passed)~> success-path
check (if failed)~> failure-path
```

### Advanced Patterns

**Retry Loop:**
```
@try -> action (if failed)~> @try
```

**Conditional Retry with Success Path:**
```
@try -> action (if failed)~> @try -> (if passed)~> next
```

**Quality Gate:**
```
[test || lint] (all success)~> deploy
```

**Nested Parallel:**
```
[[a -> b] || [c -> d]] -> merge
```

**Multi-Stage Pipeline:**
```
stage1 -> @checkpoint1 -> [stage2a || stage2b] -> @checkpoint2 -> stage3
```

---

## Syntax Rules

### Whitespace
- Spaces around operators are optional
- Newlines are treated as spaces
- Indentation is ignored

**Valid:**
```
a->b->c
a -> b -> c
a ->
  b ->
  c
```

### Quotes
- Agent instructions must be in double quotes
- Quotes in instructions must be escaped: `\"`

**Valid:**
```
explore:"find bugs"
explore:"find \"critical\" bugs"
```

**Invalid:**
```
explore:find bugs      ❌ Missing quotes
explore:'find bugs'    ❌ Single quotes not supported
```

### Identifiers
- Agent names: lowercase, hyphens allowed
- Labels: alphanumeric, hyphens, underscores

**Valid:**
```
explore:"..."
code-reviewer:"..."
@try
@review-security
```

**Invalid:**
```
Explore:"..."          ❌ Uppercase not standard
@try!                  ❌ Special characters
```

### Subgraphs
- Must be balanced: every `[` has matching `]`
- Can be nested
- Can contain any workflow syntax

**Valid:**
```
[a -> b]
[[a || b] -> c]
[a -> [b || c] -> d]
```

**Invalid:**
```
[a -> b               ❌ Missing ]
[a -> b]]             ❌ Extra ]
```

### Conditionals
- Condition text is case-insensitive
- Parentheses required around condition
- `~>` must follow condition

**Valid:**
```
step (if passed)~> next
step (if PASSED)~> next
step (if "custom condition")~> next
```

**Invalid:**
```
step if passed~> next        ❌ Missing parentheses
step (passed)~> next         ❌ Missing "if"
step (if passed) next        ❌ Missing ~>
```

---

## Error Messages

### Syntax Errors

**Unclosed Subgraph:**
```
Error: Unclosed subgraph bracket at position 42
Expected: ]
Found: [a -> b -> c [EOF]
```

**Invalid Operator:**
```
Error: Unknown operator '==>' at position 15
Valid operators: ->, ||, ~>
Did you mean: -> ?
```

**Missing Quotes:**
```
Error: Agent instruction must be quoted
Found: explore:find bugs
Expected: explore:"find bugs"
```

**Unbalanced Quotes:**
```
Error: Unbalanced quotes in agent instruction
Found: explore:"find bugs
Expected: explore:"find bugs"
```

---

## Best Practices

### Readability

✓ **Use descriptive instructions**
```
explore:"find authentication bugs in login module"
```

✗ **Avoid vague instructions**
```
explore:"check stuff"
```

### Structure

✓ **Group related operations**
```
[security-check || performance-test || lint]
```

✗ **Avoid flat parallelism without context**
```
a || b || c || d || e || f
```

### Complexity

✓ **Break complex workflows into templates**
```
Template: security-audit.flow
Usage: @call:security-audit
```

✗ **Avoid deeply nested structures**
```
[[[a || b] -> [c || d]] || [[e -> f] || [g -> h]]]
```

### Naming

✓ **Use meaningful checkpoint names**
```
@security-review
@pre-deployment-check
```

✗ **Avoid generic names**
```
@checkpoint1
@step2
```

---

## Advanced Features

### Variable Binding

See [Variable Binding Reference](../reference/variable-binding.md) for complete documentation.

### Negative Conditions

Use `!` to negate conditions:
```
(if !variable)~> handle-false-case
```

### Custom Syntax

Extend orchestration with domain-specific syntax. See [Custom Syntax Guide](./custom-syntax.md).

## Creating Workflows

- **From syntax:** Write workflow syntax directly
- **From natural language:** Use `/orchestration:create` to describe workflow in plain language

See [Natural Language Workflow Creation](../features/natural-language.md) for guided workflow creation.

---

## Related Topics

- **agents** - Details on agent invocation
- **parallel** - Parallel execution patterns
- **conditionals** - Conditional flow details
- **loops** - Loop patterns with labels
- **checkpoints** - Checkpoint usage
- **subgraphs** - Subgraph patterns
