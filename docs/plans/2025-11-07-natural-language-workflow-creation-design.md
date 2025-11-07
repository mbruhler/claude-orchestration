# Natural Language Workflow Creation Design

**Date:** 2025-11-07
**Status:** Approved
**Author:** Design Session with User

## Overview

Add natural language workflow creation to the orchestration plugin, allowing users to describe workflows in plain language and have the system guide them through Socratic questioning to create precise orchestration syntax. The system can also create custom syntax elements when needed to better express workflow intent.

## Goals

1. Lower the barrier to entry for orchestration workflows
2. Help users discover optimal workflow patterns through guided questioning
3. Support creating reusable templates from natural language
4. Enable custom syntax creation for domain-specific needs
5. Maintain explicit, traceable workflow definitions with variable binding

## Architecture

### Component Overview

Five main components working together:

**1. Socratic Refinement Engine** (`workflow-socratic-designer` subagent)
- Core questioning system using `AskUserQuestion`
- Hybrid approach: adapts to request specificity
- Builds `WorkflowRequirements` object through progressive refinement
- Supports single-select and multi-select questions

**2. Pattern Knowledge Base**
- Analyzes existing templates and examples
- Learns common workflow patterns (TDD, deployment, security audit, bug fix)
- Identifies pattern categories and decision points
- Sources: `~/.claude/workflows/`, `docs/reference/examples.md`, global syntax library

**3. Syntax Designer** (`workflow-syntax-designer` subagent)
- Creates custom syntax elements when existing syntax insufficient
- **Reuse-first**: Always searches existing syntax before creating new
- Designs operators, actions, checkpoints, loops, conditions, aggregators, guards, tools, MCPs
- Follows principles: intuitive, composable, self-documenting, minimal

**4. Workflow Generator**
- Takes `WorkflowRequirements` and produces valid syntax
- Handles sequential/parallel/conditional structures
- Implements variable binding system
- Supports negative conditions with `!` operator
- Validates generated syntax

**5. Template Builder**
- Packages workflow into `.flow` template file
- Extracts parameters from workflow
- Builds frontmatter (name, description, params)
- Creates Definitions section for custom syntax
- Handles user interaction for template details

### Integration Points

**Entry Point 1: Slash Command**
- `/orchestration:create` - New command
- `/orchestration:create <description>` - With initial context
- Launches `workflow-socratic-designer` subagent

**Entry Point 2: Menu Option**
- Updated `/orchestration:menu` with "Create from description"
- Also adds "Manage syntax" for global syntax library

**Entry Point 3: Proactive Skill**
- `creating-workflows-from-description` skill
- Claude suggests orchestration when user describes multi-step tasks
- Triggers on patterns: multiple steps, "then", "after", "if that works", "in parallel"

## Variable Binding System

### Syntax

`operation (condition):variable_name~>`

### Semantics

- Evaluates `condition` on result of `operation`
- Binds boolean result to `variable_name`
- Later conditions reference `variable_name` with `(if variable_name)` or `(if !variable_name)`

### Example

```
[tool:npm:test || code-reviewer:"security"] (all success):tests-passed~>
  (if tests-passed)~> deploy ->
  (if !tests-passed)~> fix -> retry
```

### Benefits

- Clear variable provenance
- Explicit condition checking
- Easy tracing
- Self-documenting workflows

### Naming Conventions

- Use kebab-case: `tests-passed`, `is-critical`, `has-issues`
- Be descriptive: `validation-passed` not `valid`
- Boolean-friendly: `tests-passing`, `is-approved`, `has-errors`

## Negative Conditions

### Syntax

`(if !variable)~>` or `(if !condition)~>`

### Usage

```
analyze (if !security-critical)~> fast-deploy ->
analyze (if security-critical)~> @security-gate -> careful-deploy
```

### Condition Pairing

Generator can create both paths for complete decision trees:
```
operation (condition):var~>
  (if var)~> handle-true ->
  (if !var)~> handle-false
```

## Custom Syntax System

### Component Types

Nine types of custom syntax elements:

#### 1. Operators (`syntax/operators/<name>.md`)
```markdown
---
symbol: =>
description: Merge with deduplication
---

# Merge Operator (=>)

Executes left then right, deduplicating outputs.

## Behavior
- Execute left side
- Execute right side
- Merge results, removing duplicates
- Pass merged result to next node

## Example
explore => implement => test
```

#### 2. Actions (`syntax/actions/<name>.md`)
```markdown
---
name: @deep-review
type: action
description: Multi-stage code review
---

# Deep Review Action

Parallel security and style review with merge.

## Expansion
[code-reviewer:"security" || code-reviewer:"style"] -> merge

## Usage
explore -> @deep-review -> implement
```

#### 3. Checkpoints (`syntax/checkpoints/<name>.md`)
```markdown
---
name: @security-gate
type: checkpoint
description: Security approval checkpoint
---

# Security Gate

Pauses workflow for security review approval.

## Prompt
Review security findings. Verify no critical vulnerabilities before proceeding.

## Usage
scan -> @security-gate -> deploy
```

#### 4. Loops (`syntax/loops/<name>.md`)
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
description: Retry with exponential backoff
---

# Retry with Backoff

Retries operation N times with increasing delays.

## Pattern
@try -> {flow} (if failed)~> wait -> @try

## Usage
retry-with-backoff(3): deploy -> verify
```

#### 5. Conditions (`syntax/conditions/<name>.md`)
```markdown
---
name: if security-critical
description: Check if changes affect security-critical code
evaluation: Check if modified files in: auth/, crypto/, permissions/
---
```

#### 6. Aggregators (`syntax/aggregators/<name>.md`)
```markdown
---
name: merge-with-vote
description: Combine parallel results using majority vote
behavior: Take most common result from parallel branches
---
```

#### 7. Guards (`syntax/guards/<name>.md`)
```markdown
---
name: require-clean-working-tree
description: Ensure no uncommitted changes
check: git status --porcelain returns empty
error: Uncommitted changes detected. Commit or stash first.
---
```

#### 8. Tools (`syntax/tools/<name>.md`)
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---
```

#### 9. MCPs (`syntax/mcps/<name>.md`)
```markdown
---
name: mcp:supabase:execute_sql
type: mcp
description: Execute SQL on Supabase
server: supabase
tool: execute_sql
params: [query]
---
```

### Syntax Scoping

**Template-Local (Default):**
- Custom syntax defined in template's Definitions section
- Available only within that template
- Good for template-specific needs

**Global (User Choice):**
- After template save, user chooses which syntax to promote
- Promoted syntax copied to `~/.claude/orchestration/syntax/<type>/<name>.md`
- Available to all workflows and templates

### Reuse-First Process

Before creating new syntax, `workflow-syntax-designer` checks:

1. Built-in syntax (core operators, conditions, etc.)
2. Global syntax library (`~/.claude/orchestration/syntax/`)
3. Loaded template Definitions sections
4. Fuzzy matching for similar syntax
5. Only create new if no match or adaptation doesn't fit

Uses Grep/Read tools to search existing syntax.

## Socratic Refinement Process

### Hybrid Questioning Strategy

**For Vague Requests** ("help me deploy", "fix bugs"):
1. Problem identification (single-select): "What problem are you solving?"
   - Options: consistency, quality gates, speed, collaboration
2. Scope clarification (multi-select): "Which parts matter?"
3. Constraints (multi-select): "What constraints apply?"
   - Options: must pass tests, needs approval, automated rollback
4. Pattern suggestion (single-select): "Which pattern fits best?"

**For Specific Requests** ("implement auth with TDD"):
1. Pattern recognition: Identify the pattern automatically
2. Customization (multi-select): "What aspects should this handle?"
   - Options: error retry, logging, validation
3. Validation (single-select): Confirm or modify

**For Medium-Specificity** ("review and deploy code"):
1. Start with scope (multi-select): "What kind of review?"
2. Drill into details: "How should deployment work?"
3. Connect the dots: "Should review block deployment?"

### Question Types

- **Pattern matching** (single-select): Best pattern identification
- **Feature selection** (multi-select): Workflow features (retries, checkpoints, parallel tests)
- **Constraint gathering** (multi-select): Requirements (tests, approvals, rollbacks)
- **Agent selection** (multi-select): Validations (test, lint, security, type-check)
- **Boolean choices** (single-select): Yes/no decisions
- **Validation** (single-select): Confirm/modify

### WorkflowRequirements Object

```javascript
{
  intent: "deploy with validation",
  pattern: "deployment-pipeline",
  agents: ["build", "test", "lint", "security"],  // multi-select result
  structure: "sequential-with-parallel-tests",
  errorHandling: ["rollback-on-failure", "notify-team"],  // multi-select result
  checkpoints: ["@pre-deploy"],
  conditions: ["if security-critical"],
  guards: ["require-clean-working-tree"],
  tools: ["npm:build", "npm:test"],
  mcps: [],
  customSyntaxNeeded: ["@security-gate"]
}
```

## Workflow Generation

### Generation Process

**Step 1: Structure Selection**
- Sequential: `A -> B -> C`
- Parallel: `[A || B || C]`
- Conditional with binding: `A (condition):var~> (if var)~> B`
- Negative conditional: `(if !var)~> B`
- Retry loop: `@try -> A (if failed)~> @try`
- Hybrid: Complex combinations

**Step 2: Agent Mapping**
- Map requirements to agent invocations
- `explore:"instruction"`, `general-purpose:"instruction"`, `code-reviewer:"instruction"`
- `tool:npm:test`, `mcp:supabase:execute_sql`

**Step 3: Operator Selection**
- `->` for sequential dependencies
- `||` for parallel operations
- `~>` for conditional flow
- Custom operators if needed

**Step 4: Add Control Flow**
- Variable bindings: Bind condition results
- Checkpoints: `@review`, `@approve`, custom
- Conditions: `(if var)`, `(if !var)`
- Guards: Pre-conditions
- Aggregators: Combine parallel results

**Step 5: Error Handling**
- Retry loops for transient failures
- Fallback paths with variable tracking
- Rollback on deployment failures

**Step 6: Validate Syntax**
- All variables defined before use
- No undefined variable references
- Valid variable names (alphanumeric, hyphens, underscores)
- Balanced brackets
- Valid operators

### Example Generation

**Input:**
```javascript
{
  intent: "deploy with security validation",
  pattern: "deployment-pipeline",
  agents: ["build", "test", "security-scan"],
  structure: "sequential-with-parallel-validation",
  errorHandling: ["rollback-on-failure"],
  checkpoints: ["@pre-deploy"],
  conditions: ["if security-critical"],
  guards: ["require-clean-working-tree"],
  tools: ["npm:build", "npm:test"],
  customSyntaxNeeded: ["@security-gate"]
}
```

**Output:**
```
require-clean-working-tree ->
tool:npm:build ->
[tool:npm:test || code-reviewer:"security"] (all success):validation-passed~>
(if !validation-passed)~> fix -> @retry ->
(if validation-passed)~> analyze (if security-critical):is-critical~>
  (if !is-critical)~> deploy ->
  (if is-critical)~> @security-gate -> @pre-deploy -> deploy ->
smoke-test (if failed):deployment-failed~>
  (if deployment-failed)~> rollback -> notify-failure ->
  (if !deployment-failed)~> notify-success
```

## Template Building

### Process

1. **Identify Parameters**: Scan workflow for parameterizable values
2. **Extract Custom Definitions**: Collect custom syntax elements used
3. **Build Frontmatter**: Create YAML header with name, description, params
4. **Substitute Parameters**: Replace values with `{{placeholder}}`
5. **Build Definitions Section**: Add custom syntax definitions
6. **Write Template File**: Combine into `.flow` file

### Output Flow (Using AskUserQuestion)

**1. Explain workflow** (plain language)

**2. Show generated syntax** (complete workflow)

**3. Explain custom syntax** (if any)

**4. Prompt to save:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Would you like to save this as a template?",
    header: "Save",
    multiSelect: false,
    options: [
      {label: "Yes", description: "Save as reusable template"},
      {label: "No", description: "Use once without saving"}
    ]
  }]
})
```

**5. If Yes, collect details:**

- Template name (suggest based on pattern, allow custom via "Other")
- Description (confirm or edit via "Other")
- Parameters (confirm or modify via "Other")

**6. Save to `~/.claude/workflows/<name>.flow`**

**7. Prompt for global syntax promotion:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Promote custom syntax to global library?",
    header: "Promote",
    multiSelect: true,  // Select multiple
    options: [
      {label: "@security-review", description: "Security review checkpoint"},
      {label: "retry-with-backoff", description: "Retry loop"},
      // One per custom syntax created
    ]
  }]
})
```

**8. Copy promoted syntax to `~/.claude/orchestration/syntax/<type>/<name>.md`**

**9. Final action:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Template saved! What next?",
    header: "Next Step",
    multiSelect: false,
    options: [
      {label: "Execute now", description: "Run this workflow immediately"},
      {label: "Return to menu", description: "Go back to orchestration menu"},
      {label: "Create another", description: "Create another workflow"},
      {label: "Done", description: "Finish workflow creation"}
    ]
  }]
})
```

## File Structure

```
~/.claude/plugins/repos/orchestration/
├── commands/
│   ├── create.md                          # NEW
│   ├── menu.md                            # UPDATED
│   ├── help.md
│   ├── examples.md
│   ├── explain.md
│   └── run.md
├── skills/
│   ├── using-orchestration/
│   │   └── SKILL.md
│   └── creating-workflows-from-description/  # NEW
│       └── SKILL.md
├── subagents/
│   ├── workflow-socratic-designer.md      # NEW
│   └── workflow-syntax-designer.md        # NEW
├── docs/
│   ├── reference/
│   │   ├── examples.md
│   │   ├── best-practices.md
│   │   └── variable-binding.md            # NEW
│   ├── features/
│   │   ├── templates.md                   # UPDATED
│   │   ├── error-handling.md
│   │   └── natural-language.md            # NEW
│   ├── topics/
│   │   ├── syntax.md                      # UPDATED
│   │   └── custom-syntax.md               # NEW
│   └── plans/
│       └── 2025-11-07-natural-language-workflow-creation-design.md  # THIS FILE
└── README.md                              # UPDATED

~/.claude/orchestration/syntax/              # NEW: Global syntax library
├── operators/
│   └── merge-with-dedupe.md
├── actions/
│   └── deep-review.md
├── checkpoints/
│   └── security-gate.md
├── loops/
│   └── retry-with-backoff.md
├── conditions/
│   └── security-critical.md
├── aggregators/
│   └── merge-with-vote.md
├── guards/
│   └── require-clean-working-tree.md
├── tools/
│   ├── npm-test.md
│   └── docker-build.md
└── mcps/
    └── supabase-execute-sql.md

~/.claude/workflows/                         # User templates
├── tdd-feature.flow
├── security-audit.flow
└── deploy-safe.flow
```

## Subagent Definitions

### workflow-socratic-designer

**Purpose:** Guide users through Socratic questioning to refine workflow requirements

**Tools:** AskUserQuestion, Read, Grep, Task

**Process:**
1. Understand initial request (vague/specific/medium)
2. Ask strategic questions using hybrid approach
3. Read existing templates/examples for pattern matching
4. Build WorkflowRequirements object
5. Call workflow-syntax-designer if custom syntax needed
6. Generate workflow syntax
7. Explain workflow to user
8. Save as template with user input
9. Offer global syntax promotion

### workflow-syntax-designer

**Purpose:** Create custom syntax elements when needed

**Tools:** Read, Write, Grep, Glob

**Process:**
1. Receive syntax need from Socratic designer
2. Search existing syntax (reuse-first):
   - Built-in syntax
   - Global library
   - Template definitions
   - Fuzzy matches
3. If no reusable match, design new syntax:
   - Choose intuitive name/symbol
   - Define behavior clearly
   - Create examples
   - Write definition file
4. Return definition to Socratic designer

## Implementation Phases

### Phase 1: Core Infrastructure
- Create subagent definitions
- Set up global syntax library structure (`~/.claude/orchestration/syntax/`)
- Add variable binding syntax support to parser
- Add negative condition (`!`) parsing

### Phase 2: Socratic Designer
- Implement question flow logic (hybrid approach)
- Build pattern matching from templates/examples
- Create WorkflowRequirements builder
- Integrate AskUserQuestion with single/multi-select

### Phase 3: Syntax Designer
- Implement reuse-first search logic
- Create custom syntax generation for all 9 types
- Build definition file writer
- Add global library management

### Phase 4: Workflow Generator
- Implement structure selection logic
- Add variable binding generation
- Create syntax validator
- Add readability formatting

### Phase 5: Template Builder
- Build parameter extraction
- Create frontmatter generator
- Implement user interaction flows with AskUserQuestion
- Add global syntax promotion flow

### Phase 6: Integration
- Create `/orchestration:create` command
- Update `/orchestration:menu` with new options
- Create `creating-workflows-from-description` skill
- Write documentation:
  - `docs/features/natural-language.md`
  - `docs/reference/variable-binding.md`
  - `docs/topics/custom-syntax.md`
  - Update `README.md`, `docs/topics/syntax.md`

## Success Criteria

1. ✅ Users can create workflows from natural language descriptions
2. ✅ Socratic questioning guides users through refinement
3. ✅ System reuses existing syntax before creating new
4. ✅ Variable binding makes workflows explicit and traceable
5. ✅ Negative conditions support complete decision trees
6. ✅ Custom syntax can be template-local or promoted to global
7. ✅ Tool and MCP wrappers integrate external systems
8. ✅ Multiple entry points (command, menu, skill) available
9. ✅ Generated workflows are readable and maintainable
10. ✅ Templates are properly structured with frontmatter and definitions

## Future Enhancements

- AI-powered pattern recognition from workflow descriptions
- Workflow diff/merge for combining patterns
- Visual workflow editor integration
- Workflow testing framework
- Performance profiling for complex workflows
- Workflow versioning and rollback
- Shared workflow registry
- Workflow analytics and optimization suggestions
