# Workflow Syntax Reference

Complete reference for workflow orchestration syntax used in the executing-workflows skill.

## Table of Contents

- [Operators](#operators)
- [Agent Invocation](#agent-invocation)
- [Conditions](#conditions)
- [Variable Binding](#variable-binding)
- [Temporary Agents](#temporary-agents)
- [Complete Examples](#complete-examples)

---

## Operators

### Sequential Operator: `->`

Executes agents in sequence, where each agent runs after the previous one completes.

**Syntax:**
```flow
agent1:"task1" -> agent2:"task2" -> agent3:"task3"
```

**Example:**
```flow
implementation-architect:"Design user authentication" ->
expert-code-implementer:"Implement the design" ->
code-reviewer:"Review the implementation"
```

**Behavior:**
- Agents execute in left-to-right order
- Each agent waits for the previous to complete
- If an agent fails, execution stops unless conditional operators are used

---

### Parallel Operator: `||`

Executes multiple agents concurrently.

**Syntax:**
```flow
agent1:"task1" || agent2:"task2" || agent3:"task3"
```

**Example:**
```flow
Explore:"Find all API endpoints" ||
Explore:"Find all database models" ||
Explore:"Find all test files"
```

**Behavior:**
- All agents start simultaneously
- Execution continues when all parallel agents complete
- Variables from parallel agents are available to subsequent steps

---

### Conditional Operator: `~>`

Executes the next agent only if a condition is met.

**Syntax:**
```flow
agent1:"task1" ~> (condition) agent2:"task2"
```

**Example:**
```flow
code-reviewer:"Review the code":review ~>
(if no issues) implementation-architect:"Plan next feature" ~>
(if issues) expert-code-implementer:"Fix the issues"
```

**Behavior:**
- Evaluates condition after agent completes
- Only executes next agent if condition is true
- Can chain multiple conditional branches

---

### Checkpoint Operator: `@`

Creates a named checkpoint for workflow control and reporting.

**Syntax:**
```flow
@ checkpoint-name
```

**Example:**
```flow
implementation-architect:"Design the feature":design ->
@ design-complete ->
expert-code-implementer:"Implement {design}" ->
@ implementation-complete ->
code-reviewer:"Review implementation"
```

**Behavior:**
- Marks a point in workflow execution
- Useful for reporting progress
- Helps with debugging workflow execution
- Does not affect execution flow

---

### Grouping: `[...]`

Groups multiple agents into a subgraph for organization or conditional execution.

**Syntax:**
```flow
[
  agent1:"task1" ->
  agent2:"task2"
]
```

**Example:**
```flow
code-reviewer:"Review code":review ~>
(if issues) [
  implementation-architect:"Analyze issues":analysis ->
  expert-code-implementer:"Fix based on {analysis}" ->
  code-reviewer:"Verify fixes"
]
```

**Behavior:**
- Creates a logical grouping of agents
- Can be used with conditional operators
- Helps organize complex workflows
- Entire subgraph executes as a unit

---

## Agent Invocation

### Basic Invocation

**Syntax:**
```flow
agent-name:"instruction text"
```

**Example:**
```flow
Explore:"Find all authentication related files"
```

### Invocation with Output Capture

**Syntax:**
```flow
agent-name:"instruction text":variable_name
```

**Example:**
```flow
Explore:"List all API endpoints":endpoints
```

### Built-in Agents

| Agent Name | Purpose | Typical Use Case |
|------------|---------|------------------|
| `Explore` | Search and discover code/files | Finding files, analyzing codebase structure |
| `general-purpose` | General development tasks | Ad-hoc tasks, simple implementations |
| `code-reviewer` | Review code quality | Code review, finding issues |
| `implementation-architect` | Design solutions | Planning, architecture, design documents |
| `expert-code-implementer` | Implement code | Writing production code, complex implementations |

### Agent Invocation Examples

**Simple exploration:**
```flow
Explore:"Find all React components in src/"
```

**Capture and reuse output:**
```flow
Explore:"Find database schema files":schema ->
implementation-architect:"Design migration based on {schema}"
```

**Multiple agents with different purposes:**
```flow
Explore:"Find test files":tests ||
Explore:"Find source files":source ->
code-reviewer:"Review {source} and {tests}"
```

---

## Conditions

### Standard Conditions

| Condition | Description | Use Case |
|-----------|-------------|----------|
| `(if passed)` | Agent completed successfully | Continue on success |
| `(if failed)` | Agent encountered errors | Handle failures |
| `(if no issues)` | Code review found no problems | Proceed after clean review |
| `(if issues)` | Code review found problems | Fix issues |
| `(if all success)` | All parallel agents succeeded | Proceed only if all passed |
| `(if any success)` | At least one parallel agent succeeded | Proceed if any passed |

### Negative Conditions

**Syntax:**
```flow
agent:"task":var ~> (if !var) next-agent:"handle empty result"
```

**Example:**
```flow
Explore:"Find configuration files":config ~>
(if !config) general-purpose:"Create default configuration"
```

**Behavior:**
- `(if !variable)` checks if variable is empty, null, or false
- Useful for handling missing data or failed searches

### Custom Conditions

While the standard conditions cover most cases, you can describe conditions in natural language:

```flow
agent:"task":result ~>
(if result contains errors) handler:"fix errors"
```

**Note:** Custom conditions are interpreted based on context and variable content.

### Condition Examples

**Handle success/failure:**
```flow
code-reviewer:"Review implementation":review ~>
(if no issues) general-purpose:"Deploy to staging" ~>
(if issues) expert-code-implementer:"Fix issues from {review}"
```

**Check variable content:**
```flow
Explore:"Find deprecated code":deprecated ~>
(if !deprecated) general-purpose:"No cleanup needed" ~>
(if deprecated) expert-code-implementer:"Refactor {deprecated}"
```

**Parallel execution with condition:**
```flow
[
  expert-code-implementer:"Implement feature A" ||
  expert-code-implementer:"Implement feature B" ||
  expert-code-implementer:"Implement feature C"
] ~>
(if all success) code-reviewer:"Review all features" ~>
(if any failed) general-purpose:"Report failed features"
```

---

## Variable Binding

### Capture Syntax

Capture agent output to a variable for later use.

**Syntax:**
```flow
agent:"instruction":variable_name
```

**Example:**
```flow
Explore:"Find all API routes":routes
```

**Rules:**
- Variable names must be alphanumeric with underscores
- Variables are scoped to the workflow
- Variables from parallel agents are all available after the parallel block completes

### Interpolation Syntax

Use captured variables in subsequent instructions.

**Syntax:**
```flow
agent:"instruction with {variable_name}"
```

**Example:**
```flow
Explore:"Find authentication files":auth_files ->
code-reviewer:"Review {auth_files} for security issues"
```

**Rules:**
- Use curly braces `{variable_name}` to interpolate
- Variables must be captured before use
- Can use multiple variables in one instruction

### Multiple Variables Example

```flow
Explore:"Find API routes":routes ->
Explore:"Find API tests":tests ->
code-reviewer:"Verify {routes} have corresponding {tests}":coverage ->
implementation-architect:"Design tests for uncovered routes in {coverage}"
```

### Variable Scope in Parallel Execution

```flow
[
  Explore:"Find frontend files":frontend ||
  Explore:"Find backend files":backend ||
  Explore:"Find config files":config
] ->
implementation-architect:"Design deployment strategy for {frontend}, {backend}, and {config}"
```

**Behavior:**
- All variables from parallel agents are available after the parallel block
- Variables are merged into the workflow context
- Can reference any variable in subsequent steps

---

## Temporary Agents

Temporary agents (temp agents) are custom, single-use agents defined inline for specific workflow needs.

### Definition Syntax

**Syntax:**
```flow
$agent-name := {
  base: "agent-type",
  prompt: "custom instructions",
  model: "model-name"
}
```

**Parameters:**

| Parameter | Required | Description | Options |
|-----------|----------|-------------|---------|
| `base` | Yes | Base agent type | `general-purpose`, `code-reviewer`, `implementation-architect`, `expert-code-implementer` |
| `prompt` | Yes | Custom system prompt | Any text defining agent behavior |
| `model` | No | Claude model to use | `sonnet` (default), `opus`, `haiku` |

### Basic Temp Agent Example

```flow
$security-auditor := {
  base: "code-reviewer",
  prompt: "You are a security specialist. Focus only on security vulnerabilities, authentication issues, and data exposure risks.",
  model: "sonnet"
}

Explore:"Find authentication code":auth ->
$security-auditor:"Audit {auth} for security vulnerabilities"
```

### Temp Agent Invocation

Once defined, temp agents are used like built-in agents:

**Syntax:**
```flow
$agent-name:"instruction"
$agent-name:"instruction":output_variable
```

**Example:**
```flow
$api-designer := {
  base: "implementation-architect",
  prompt: "You specialize in RESTful API design. Follow OpenAPI 3.0 standards and focus on resource-oriented design."
}

$api-designer:"Design API for user management":api_spec ->
expert-code-implementer:"Implement {api_spec}"
```

### Multiple Temp Agents Example

```flow
# Define specialized agents
$frontend-reviewer := {
  base: "code-reviewer",
  prompt: "Focus on React best practices, accessibility, and performance"
}

$backend-reviewer := {
  base: "code-reviewer",
  prompt: "Focus on API design, database queries, and error handling"
}

$security-reviewer := {
  base: "code-reviewer",
  prompt: "Focus exclusively on security vulnerabilities and auth issues"
}

# Use in parallel
Explore:"Find React components":frontend ->
Explore:"Find API endpoints":backend ->
[
  $frontend-reviewer:"Review {frontend}" ||
  $backend-reviewer:"Review {backend}" ||
  $security-reviewer:"Review {frontend} and {backend}"
]
```

### Temp Agent Best Practices

1. **Specific Focus:** Define temp agents for specialized tasks that built-in agents don't cover
2. **Clear Prompts:** Write detailed prompts that clearly define the agent's expertise and constraints
3. **Appropriate Base:** Choose the base agent type that matches the task (reviewer for analysis, architect for design, implementer for coding)
4. **Model Selection:** Use `opus` for complex reasoning, `sonnet` for balanced tasks (default), `haiku` for simple/fast tasks

### Temp Agent with Model Selection

```flow
$quick-scanner := {
  base: "code-reviewer",
  prompt: "Quickly scan for obvious syntax errors and missing imports",
  model: "haiku"
}

$deep-analyzer := {
  base: "code-reviewer",
  prompt: "Perform deep analysis of architectural patterns and design decisions",
  model: "opus"
}

# Quick scan first, deep analysis if needed
$quick-scanner:"Scan codebase":quick_results ~>
(if issues) $deep-analyzer:"Deep analysis of issues in {quick_results}"
```

---

## Complete Examples

### Example 1: Feature Development Pipeline

```flow
# Plan the feature
implementation-architect:"Design user profile feature":design ->
@ design-complete ->

# Implement in parallel
[
  expert-code-implementer:"Implement backend for {design}" ||
  expert-code-implementer:"Implement frontend for {design}" ||
  expert-code-implementer:"Write tests for {design}"
] ->
@ implementation-complete ->

# Review
code-reviewer:"Review all implementation":review ~>
(if no issues) general-purpose:"Feature ready for deployment" ~>
(if issues) expert-code-implementer:"Fix issues: {review}"
```

### Example 2: Codebase Audit with Temp Agents

```flow
# Define specialized auditors
$security-auditor := {
  base: "code-reviewer",
  prompt: "Security specialist focusing on vulnerabilities, auth, and data exposure",
  model: "sonnet"
}

$performance-auditor := {
  base: "code-reviewer",
  prompt: "Performance specialist focusing on optimization, caching, and queries",
  model: "sonnet"
}

$accessibility-auditor := {
  base: "code-reviewer",
  prompt: "Accessibility specialist focusing on WCAG compliance and screen readers",
  model: "sonnet"
}

# Discover codebase
Explore:"Find all source files":source ->
@ discovery-complete ->

# Parallel audit
[
  $security-auditor:"Audit {source}":security_issues ||
  $performance-auditor:"Audit {source}":performance_issues ||
  $accessibility-auditor:"Audit {source}":a11y_issues
] ->
@ audit-complete ->

# Generate report
implementation-architect:"Create comprehensive audit report from {security_issues}, {performance_issues}, {a11y_issues}"
```

### Example 3: Conditional Migration

```flow
# Find existing code
Explore:"Find database schema":schema ->
Explore:"Find existing migrations":migrations ->

# Check if migration needed
code-reviewer:"Compare {schema} with {migrations}":analysis ~>
(if !analysis) general-purpose:"Schema is up to date" ~>
(if analysis) [
  implementation-architect:"Design migration for {analysis}":migration_plan ->
  expert-code-implementer:"Create migration: {migration_plan}":migration_file ->
  code-reviewer:"Verify {migration_file}":verification ~>
  (if no issues) general-purpose:"Migration ready to apply" ~>
  (if issues) expert-code-implementer:"Fix migration issues: {verification}"
]
```

### Example 4: Multi-Stage Refactoring

```flow
# Discovery phase
Explore:"Find deprecated patterns":deprecated ->
@ discovery-complete ->

# Analysis phase
implementation-architect:"Analyze {deprecated} and create refactoring strategy":strategy ->
@ analysis-complete ->

# Implementation phase
expert-code-implementer:"Refactor based on {strategy}":refactored_code ->
@ refactoring-complete ->

# Verification phase
[
  code-reviewer:"Review {refactored_code}":review ||
  general-purpose:"Run tests on {refactored_code}":test_results
] ->
@ verification-complete ->

# Decision phase
(if all success) general-purpose:"Refactoring complete and verified" ~>
(if any failed) [
  implementation-architect:"Analyze failures in {review} and {test_results}":fixes ->
  expert-code-implementer:"Apply fixes: {fixes}"
]
```

### Example 5: Parallel Feature Development

```flow
# Define specialized implementers
$db-expert := {
  base: "expert-code-implementer",
  prompt: "Database specialist. Expert in SQL, migrations, and query optimization.",
  model: "sonnet"
}

$api-expert := {
  base: "expert-code-implementer",
  prompt: "API specialist. Expert in REST, GraphQL, and API design patterns.",
  model: "sonnet"
}

$ui-expert := {
  base: "expert-code-implementer",
  prompt: "UI specialist. Expert in React, accessibility, and responsive design.",
  model: "sonnet"
}

# Plan feature
implementation-architect:"Design multi-tier feature with DB, API, and UI layers":plan ->

# Parallel implementation by specialists
[
  $db-expert:"Implement database layer from {plan}":db_code ||
  $api-expert:"Implement API layer from {plan}":api_code ||
  $ui-expert:"Implement UI layer from {plan}":ui_code
] ->

# Integration review
code-reviewer:"Review integration of {db_code}, {api_code}, and {ui_code}":integration ~>
(if no issues) general-purpose:"Feature complete" ~>
(if issues) implementation-architect:"Create fix plan for {integration}":fix_plan ->
expert-code-implementer:"Apply fixes: {fix_plan}"
```

---

## Syntax Quick Reference

| Element | Syntax | Example |
|---------|--------|---------|
| Sequential | `->` | `agent1:"task" -> agent2:"task"` |
| Parallel | `\|\|` | `agent1:"task" \|\| agent2:"task"` |
| Conditional | `~>` | `agent:"task" ~> (if passed) next:"task"` |
| Checkpoint | `@` | `@ checkpoint-name` |
| Grouping | `[...]` | `[agent1:"task" -> agent2:"task"]` |
| Agent call | `agent:"instruction"` | `Explore:"Find files"` |
| Capture output | `:variable` | `agent:"task":result` |
| Use variable | `{variable}` | `agent:"Use {result}"` |
| Temp agent definition | `$name := {...}` | `$agent := {base: "type", prompt: "text"}` |
| Temp agent call | `$name:"instruction"` | `$agent:"Do task"` |
| Standard condition | `(if condition)` | `(if no issues)`, `(if passed)` |
| Negative condition | `(if !var)` | `(if !result)` |

---

## Additional Notes

### Workflow Execution Order

1. **Definition Phase:** Temp agents are defined but not executed
2. **Sequential Execution:** Agents execute left-to-right following `->`
3. **Parallel Execution:** All agents in `||` block start simultaneously
4. **Condition Evaluation:** Conditions evaluate after agent completes
5. **Variable Availability:** Variables available immediately after capture

### Error Handling

- If an agent fails without a conditional, workflow stops
- Use `~> (if failed)` to handle errors explicitly
- Checkpoints help identify where failures occur
- Parallel failures can be handled with `(if all success)` or `(if any success)`

### Best Practices

1. **Use checkpoints** for complex workflows to track progress
2. **Capture variables** when output will be reused
3. **Use parallel execution** for independent tasks
4. **Define temp agents** for specialized, repeated tasks
5. **Use conditionals** to handle different execution paths
6. **Group related agents** with `[...]` for clarity
7. **Choose appropriate base agents** for temp agents
8. **Write clear instructions** that specify exact requirements

---

## See Also

- Main skill documentation: `skills/executing-workflows/README.md`
- Examples: `/commands/examples.md`
- Workflow designer: `agents/workflow-socratic-designer.md`
