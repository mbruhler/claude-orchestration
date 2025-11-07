# Natural Language Workflow Creation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to create orchestration workflows from natural language descriptions using Socratic questioning, with support for custom syntax creation and variable binding.

**Architecture:** Five-component system: (1) Socratic Refinement Engine guides users through questioning using AskUserQuestion, (2) Pattern Knowledge Base learns from existing templates/examples, (3) Syntax Designer creates custom syntax elements with reuse-first approach, (4) Workflow Generator produces valid syntax with variable binding and negative conditions, (5) Template Builder packages workflows into .flow files with optional global syntax promotion.

**Tech Stack:** Claude Code plugin system, slash commands, skills, subagents, markdown documentation, YAML frontmatter

---

## Phase 1: Core Infrastructure

### Task 1: Create Global Syntax Library Structure

**Files:**
- Create: `~/.claude/orchestration/syntax/operators/README.md`
- Create: `~/.claude/orchestration/syntax/actions/README.md`
- Create: `~/.claude/orchestration/syntax/checkpoints/README.md`
- Create: `~/.claude/orchestration/syntax/loops/README.md`
- Create: `~/.claude/orchestration/syntax/conditions/README.md`
- Create: `~/.claude/orchestration/syntax/aggregators/README.md`
- Create: `~/.claude/orchestration/syntax/guards/README.md`
- Create: `~/.claude/orchestration/syntax/tools/README.md`
- Create: `~/.claude/orchestration/syntax/mcps/README.md`

**Step 1: Create directory structure**

```bash
mkdir -p ~/.claude/orchestration/syntax/{operators,actions,checkpoints,loops,conditions,aggregators,guards,tools,mcps}
```

**Step 2: Create README for operators**

Create `~/.claude/orchestration/syntax/operators/README.md`:

```markdown
# Custom Operators

Custom operators extend the orchestration syntax with new flow control mechanisms.

## Format

```markdown
---
symbol: =>
description: Brief description of what this operator does
---

# Operator Name

Detailed explanation of the operator behavior.

## Behavior
- Step 1 of what it does
- Step 2 of what it does

## Example
example-usage => another-node
```

## Built-in Operators

- `->` Sequential flow
- `||` Parallel execution
- `~>` Conditional flow

Add custom operators here only when built-in operators don't express your workflow intent.
```

**Step 3: Create README for actions**

Create `~/.claude/orchestration/syntax/actions/README.md`:

```markdown
# Custom Actions

Custom actions are reusable workflow fragments that expand to full workflow syntax.

## Format

```markdown
---
name: @action-name
type: action
description: What this action does
---

# Action Name

Detailed explanation.

## Expansion
[actual workflow syntax this expands to]

## Usage
node -> @action-name -> next-node
```

## Examples

See `deep-review.md` for a multi-stage review action example.
```

**Step 4: Create READMEs for remaining types**

Create similar READMEs for:
- `checkpoints/README.md` - Explain checkpoint format with prompt field
- `loops/README.md` - Explain loop format with pattern and {flow} placeholder
- `conditions/README.md` - Explain condition format with evaluation field
- `aggregators/README.md` - Explain aggregator format with behavior field
- `guards/README.md` - Explain guard format with check and error fields
- `tools/README.md` - Explain tool format with command and output fields
- `mcps/README.md` - Explain MCP format with server, tool, and params fields

**Step 5: Create example syntax files**

Create `~/.claude/orchestration/syntax/checkpoints/security-gate.md`:

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

Create `~/.claude/orchestration/syntax/guards/require-clean-working-tree.md`:

```markdown
---
name: require-clean-working-tree
type: guard
description: Ensure no uncommitted changes before workflow
---

# Require Clean Working Tree

Checks that git working tree is clean before proceeding.

## Check
```bash
git status --porcelain
```
Returns empty output

## Error
Uncommitted changes detected. Commit or stash changes before running this workflow.

## Usage
require-clean-working-tree -> build -> test -> deploy
```

**Step 6: Verify structure**

```bash
ls -R ~/.claude/orchestration/syntax/
```

Expected: All 9 directories with README.md files and example files

**Step 7: Commit**

```bash
git add ~/.claude/orchestration/
git commit -m "feat: create global syntax library structure"
```

---

### Task 2: Add Variable Binding Documentation

**Files:**
- Create: `docs/reference/variable-binding.md`
- Modify: `docs/topics/syntax.md` (add variable binding section)

**Step 1: Create variable binding reference**

Create `docs/reference/variable-binding.md`:

```markdown
# Variable Binding Reference

Variable binding makes conditions explicit and traceable in workflows.

## Syntax

```
operation (condition):variable_name~>
```

## Semantics

1. Evaluate `condition` on result of `operation`
2. Bind boolean result to `variable_name`
3. Later conditions reference `variable_name`

## Example

```
[tool:npm:test || code-reviewer:"security"] (all success):tests-passed~>
  (if tests-passed)~> deploy ->
  (if !tests-passed)~> fix -> retry
```

## Negative Conditions

Use `!` to negate a variable:

```
analyze (if security-critical):is-critical~>
  (if !is-critical)~> fast-deploy ->
  (if is-critical)~> @security-gate -> careful-deploy
```

## Variable Naming

**Conventions:**
- Use kebab-case: `tests-passed`, `is-critical`, `has-issues`
- Be descriptive: `validation-passed` not `valid`
- Boolean-friendly: `tests-passing`, `is-approved`, `has-errors`

**Valid characters:** alphanumeric, hyphens, underscores

## Complete Example

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

## Benefits

1. **Clear provenance**: See exactly where variables come from
2. **Explicit checking**: No ambiguity about what conditions test
3. **Easy tracing**: Follow variable usage through workflow
4. **Self-documenting**: Variable names explain intent

## Validation Rules

1. All variables must be defined before use
2. No undefined variable references allowed
3. Variable names must be valid (alphanumeric, hyphens, underscores)
4. Cannot redefine variables (each name used once)
```

**Step 2: Update syntax documentation**

Modify `docs/topics/syntax.md`, add after the Conditions section:

```markdown
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
```

**Step 3: Verify documentation renders correctly**

Read both files to ensure markdown is valid.

**Step 4: Commit**

```bash
git add docs/reference/variable-binding.md docs/topics/syntax.md
git commit -m "docs: add variable binding documentation"
```

---

### Task 3: Create Subagent Definitions

**Files:**
- Create: `subagents/workflow-socratic-designer.md`
- Create: `subagents/workflow-syntax-designer.md`

**Step 1: Create Socratic designer subagent**

Create `subagents/workflow-socratic-designer.md`:

```markdown
---
name: workflow-socratic-designer
description: Guide users through Socratic questioning to refine workflow requirements
tools: [AskUserQuestion, Read, Grep, Task]
---

# Workflow Socratic Designer

Specialized agent for guiding users through workflow creation via Socratic questioning.

## Purpose

Transform natural language descriptions into structured workflow requirements through strategic questioning.

## Process

1. **Understand initial request**
   - Assess specificity: vague, specific, or medium
   - Read existing templates/examples for pattern matching
   - Identify potential workflow patterns

2. **Ask strategic questions**
   - Use hybrid approach based on specificity
   - Vague: problem → scope → constraints → pattern
   - Specific: pattern → customization → validation
   - Medium: scope → details → connection
   - Use AskUserQuestion with single/multi-select

3. **Build WorkflowRequirements**
   ```javascript
   {
     intent: "description",
     pattern: "identified-pattern",
     agents: ["agent1", "agent2"],
     structure: "sequential|parallel|conditional|hybrid",
     errorHandling: ["retry", "rollback"],
     checkpoints: ["@review", "@approve"],
     conditions: ["if passed", "if security-critical"],
     guards: ["require-clean-working-tree"],
     tools: ["npm:build", "npm:test"],
     mcps: [],
     customSyntaxNeeded: ["@custom-checkpoint"]
   }
   ```

4. **Call syntax designer if needed**
   - If customSyntaxNeeded has elements
   - Use Task tool with subagent_type: "workflow-syntax-designer"

5. **Generate workflow syntax**
   - Map requirements to syntax
   - Add variable bindings
   - Include negative conditions
   - Format for readability

6. **Explain to user**
   - Plain language workflow explanation
   - Show generated syntax
   - Explain any custom syntax

7. **Save as template**
   - Prompt for template details
   - Save to ~/.claude/workflows/
   - Offer global syntax promotion

## Question Patterns

### Problem Identification (single-select)
```javascript
AskUserQuestion({
  questions: [{
    question: "What problem are you solving?",
    header: "Problem",
    multiSelect: false,
    options: [
      {label: "Consistency", description: "Ensure consistent process"},
      {label: "Quality gates", description: "Add validation checkpoints"},
      {label: "Speed", description: "Parallelize independent tasks"},
      {label: "Collaboration", description: "Add review/approval steps"}
    ]
  }]
})
```

### Feature Selection (multi-select)
```javascript
AskUserQuestion({
  questions: [{
    question: "What should this workflow include?",
    header: "Features",
    multiSelect: true,
    options: [
      {label: "Retry logic", description: "Retry failed operations"},
      {label: "Checkpoints", description: "Manual approval points"},
      {label: "Parallel tests", description: "Run tests simultaneously"},
      {label: "Error rollback", description: "Rollback on failure"}
    ]
  }]
})
```

### Pattern Confirmation (single-select)
```javascript
AskUserQuestion({
  questions: [{
    question: "This sounds like [pattern]. Does that fit?",
    header: "Pattern",
    multiSelect: false,
    options: [
      {label: "Yes", description: "Use this pattern"},
      {label: "Similar but different", description: "Customize it"},
      {label: "No", description: "Different pattern"}
    ]
  }]
})
```

## Context Sources

- Templates: ~/.claude/workflows/*.flow
- Examples: ~/.claude/plugins/repos/orchestration/docs/reference/examples.md
- Global syntax: ~/.claude/orchestration/syntax/**/*.md
- Best practices: docs/reference/best-practices.md

## Tools Usage

- **AskUserQuestion**: All user interaction
- **Read**: Load templates, examples, patterns
- **Grep**: Search for patterns in existing workflows
- **Task**: Call workflow-syntax-designer when needed
```

**Step 2: Create syntax designer subagent**

Create `subagents/workflow-syntax-designer.md`:

```markdown
---
name: workflow-syntax-designer
description: Design custom syntax elements with reuse-first approach
tools: [Read, Write, Grep, Glob]
---

# Workflow Syntax Designer

Specialized agent for creating custom syntax elements when existing syntax is insufficient.

## Purpose

Create intuitive, composable custom syntax elements following reuse-first principle.

## Reuse-First Process

**Before creating new syntax:**

1. **Check built-in syntax**
   - Core operators: `->`, `||`, `~>`
   - Built-in conditions: `(if passed)`, `(all success)`, etc.
   - Built-in agents: explore, general-purpose, code-reviewer

2. **Check global syntax library**
   ```bash
   grep -r "description" ~/.claude/orchestration/syntax/
   ```

3. **Check loaded templates**
   - Search Definitions sections
   - Use Grep to find similar patterns

4. **Fuzzy matching**
   - Find similar syntax that could be adapted
   - Consider slight modifications

5. **Only create new if no match**

## Creation Process

When creating new syntax:

1. **Choose intuitive name/symbol**
   - Operators: symbols that suggest behavior (`=>` for merge)
   - Actions: `@descriptive-name` format
   - Checkpoints: `@purpose-gate` format
   - Others: clear, descriptive names

2. **Define behavior clearly**
   - Step-by-step behavior description
   - Clear semantics
   - Edge cases documented

3. **Create examples**
   - Minimal working example
   - Common use case example
   - Integration with other syntax

4. **Write definition file**
   - Follow format for syntax type
   - Include all required fields
   - Add comprehensive documentation

## Syntax Types

### Operators
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

### Actions
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

### Checkpoints
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

### Loops
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

### Conditions
```markdown
---
name: if security-critical
description: Check if changes affect security-critical code
evaluation: Check if modified files in: auth/, crypto/, permissions/
---
```

### Aggregators
```markdown
---
name: merge-with-vote
description: Combine parallel results using majority vote
behavior: Take most common result from parallel branches
---
```

### Guards
```markdown
---
name: require-clean-working-tree
description: Ensure no uncommitted changes
check: git status --porcelain returns empty
error: Uncommitted changes detected. Commit or stash first.
---
```

### Tools
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---
```

### MCPs
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

## Design Principles

1. **Intuitive**: Names/symbols hint at behavior
2. **Composable**: Works with existing syntax
3. **Self-documenting**: Clear from context
4. **Minimal**: Only when truly needed

## Output

Return to Socratic designer:
```javascript
{
  type: "action|operator|checkpoint|loop|condition|aggregator|guard|tool|mcp",
  name: "syntax-element-name",
  definition: "complete markdown content",
  path: "syntax/<type>/<name>.md"
}
```
```

**Step 3: Verify subagent files**

Read both files to ensure they're complete and valid.

**Step 4: Commit**

```bash
git add subagents/workflow-socratic-designer.md subagents/workflow-syntax-designer.md
git commit -m "feat: add workflow designer subagents"
```

---

## Phase 2: Natural Language Creation Feature

### Task 4: Create `/orchestration:create` Command

**Files:**
- Create: `commands/create.md`

**Step 1: Create command file**

Create `commands/create.md`:

```markdown
---
description: Create workflow from natural language description
---

# Create Workflow from Description

Launch the Socratic workflow designer to create workflows from natural language.

## Usage

- `/orchestration:create` - Start with no context, ask what to build
- `/orchestration:create <description>` - Start with initial description

## Examples

```
/orchestration:create
/orchestration:create deploy with security validation
/orchestration:create implement auth feature with TDD
```

## Action

Parse arguments:
```javascript
const description = args.trim() || null;
```

Launch the workflow-socratic-designer subagent:

```javascript
Task({
  subagent_type: "workflow-socratic-designer",
  description: "Create workflow from description",
  prompt: `Create an orchestration workflow from natural language description.

Initial description: ${description || "Ask user what they want to build"}

Follow this process:

1. **Understand Request**
   ${description ?
     "- Assess specificity of provided description\n   - Identify workflow pattern hints" :
     "- Ask user what they want to build\n   - Gather initial context"}
   - Read existing templates for pattern matching: ~/.claude/workflows/*.flow
   - Read examples: ~/.claude/plugins/repos/orchestration/docs/reference/examples.md

2. **Socratic Questioning**
   Use AskUserQuestion with single-select or multi-select based on question type.

   For vague requests:
   - Problem identification (single-select)
   - Scope clarification (multi-select)
   - Constraints (multi-select)
   - Pattern suggestion (single-select)

   For specific requests:
   - Pattern recognition
   - Customization (multi-select)
   - Validation (single-select)

   For medium requests:
   - Scope first (multi-select)
   - Details drilling
   - Connection logic

3. **Build WorkflowRequirements**
   Create structured object:
   {
     intent: "user's goal",
     pattern: "identified-pattern",
     agents: ["list", "of", "agents"],
     structure: "sequential|parallel|conditional|hybrid",
     errorHandling: ["retry", "rollback"],
     checkpoints: ["@review"],
     conditions: ["if passed"],
     guards: ["require-clean-working-tree"],
     tools: ["npm:test"],
     mcps: [],
     customSyntaxNeeded: []
   }

4. **Custom Syntax (if needed)**
   If customSyntaxNeeded has elements:
   - Call workflow-syntax-designer for each
   - Use Task tool with subagent_type: "workflow-syntax-designer"

5. **Generate Workflow**
   - Map requirements to orchestration syntax
   - Add variable bindings: operation (condition):var~>
   - Use negative conditions: (if !var)~>
   - Format for readability

6. **Explain to User**
   - Plain language explanation of workflow
   - Show generated syntax with highlighting
   - Explain any custom syntax created

7. **Save as Template**
   Use AskUserQuestion to:
   - Ask if user wants to save as template
   - Collect template name (suggest based on pattern)
   - Confirm description
   - Confirm parameters
   - Save to ~/.claude/workflows/<name>.flow
   - Ask which custom syntax to promote to global library
   - Copy promoted syntax to ~/.claude/orchestration/syntax/<type>/<name>.md

Context files:
- Templates: ~/.claude/workflows/
- Examples: ~/.claude/plugins/repos/orchestration/docs/reference/examples.md
- Global syntax: ~/.claude/orchestration/syntax/
- Best practices: docs/reference/best-practices.md

Remember:
- Use variable binding for explicit conditions
- Support negative conditions with !
- Follow reuse-first for custom syntax
- Make workflow self-documenting with clear variable names
`
})
```

## Notes

This command is the primary entry point for natural language workflow creation. It delegates all the work to the workflow-socratic-designer subagent.
```

**Step 2: Verify command file**

Read the file to ensure it's complete and valid.

**Step 3: Test command (manual)**

After implementation, test with:
```
/orchestration:create
/orchestration:create deploy with tests
```

**Step 4: Commit**

```bash
git add commands/create.md
git commit -m "feat: add /orchestration:create command"
```

---

### Task 5: Update `/orchestration:menu` Command

**Files:**
- Modify: `commands/menu.md`

**Step 1: Read current menu file**

Read `commands/menu.md` to understand current structure.

**Step 2: Update menu options**

Modify the AskUserQuestion call in `commands/menu.md`:

```markdown
**Action:** Call AskUserQuestion with the following configuration:
```javascript
AskUserQuestion({
  questions: [{
    question: "What would you like to do?",
    header: "Menu",
    multiSelect: false,
    options: [
      {label: "Create from description", description: "Natural language workflow creation"},
      {label: "New workflow", description: "Create workflow from syntax"},
      {label: "Load template", description: "Execute saved flow"},
      {label: "List templates", description: "Show all templates"},
      {label: "Manage syntax", description: "View/edit global syntax library"},
      {label: "View docs", description: "Help, examples, or topic guides"}
    ]
  }]
})
```
```

**Step 3: Add handler for new options**

Add after the existing handlers:

```markdown
**Create from description:**
- Execute `/orchestration:create`
- This launches the natural language workflow creation flow

**Manage syntax:**
- Present submenu for global syntax management
- Use AskUserQuestion:
  ```javascript
  AskUserQuestion({
    questions: [{
      question: "Manage global syntax library:",
      header: "Syntax",
      multiSelect: false,
      options: [
        {label: "List all syntax", description: "Show all global syntax elements"},
        {label: "View by type", description: "Browse operators, actions, etc."},
        {label: "Search syntax", description: "Find specific syntax elements"},
        {label: "Back to menu", description: "Return to main menu"}
      ]
    }]
  })
  ```

**List all syntax:**
- Use Glob to find all syntax files: `~/.claude/orchestration/syntax/**/*.md`
- Read frontmatter from each file
- Display table: Type | Name | Description
- Return to syntax submenu

**View by type:**
- Ask which type to view (operators, actions, checkpoints, etc.)
- List files in that directory
- Show name and description for each
- Allow viewing full content
- Return to syntax submenu

**Search syntax:**
- Ask for search term
- Use Grep to search descriptions and content
- Display matching syntax elements
- Allow viewing full content
- Return to syntax submenu
```

**Step 4: Verify updated menu**

Read the modified file to ensure changes are correct.

**Step 5: Commit**

```bash
git add commands/menu.md
git commit -m "feat: add natural language creation and syntax management to menu"
```

---

### Task 6: Create Proactive Skill

**Files:**
- Create: `skills/creating-workflows-from-description/SKILL.md`

**Step 1: Create skill directory**

```bash
mkdir -p skills/creating-workflows-from-description
```

**Step 2: Create skill file**

Create `skills/creating-workflows-from-description/SKILL.md`:

```markdown
---
name: creating-workflows-from-description
description: Use when user describes complex multi-step tasks that could benefit from orchestration - guides natural language workflow creation
---

# Creating Workflows from Description

## When to Use

Proactively suggest orchestration when user describes tasks involving:

- **Multiple sequential steps** with dependencies
- **Parallel operations** that could run simultaneously
- **Conditional logic** or branching (if/then scenarios)
- **Error handling** or retry requirements
- **Testing, review, and deployment** phases
- **Complex multi-agent coordination**
- **Quality gates** or approval checkpoints

## Trigger Patterns

Watch for these patterns in user messages:

**Explicit workflow requests:**
- "I need to [multi-step task]"
- "Help me build a pipeline for [process]"
- "Create a workflow that [description]"
- "Automate [complex task]"

**Implicit workflow descriptions:**
- User describes 3+ sequential steps
- User mentions temporal ordering: "then", "after that", "once that's done"
- User mentions conditionals: "if that works", "if tests pass"
- User mentions parallel work: "at the same time", "in parallel", "simultaneously"
- User mentions reviews/approvals: "needs review", "after approval"
- User mentions retry/error handling: "if it fails", "retry", "rollback"

**Example phrases:**
- "run tests, then if they pass..."
- "deploy to production after security review"
- "implement with TDD workflow"
- "check code quality before merging"
- "parallel test execution"

## Action

When triggers detected, suggest orchestration:

```
This sounds like a perfect use case for orchestration! I can help you create a workflow that handles:

[List 2-4 key aspects identified from description, e.g.:]
- Sequential testing and deployment steps
- Parallel validation (tests + security scan)
- Conditional deployment based on test results
- Automatic rollback on failure

Would you like me to guide you through creating this workflow?
```

**If user says yes:**

Execute the create command with their description:
```
/orchestration:create [initial description from user message]
```

**If user says no or wants to see example first:**

Show relevant example from docs/reference/examples.md that matches their pattern.

## Examples

### Example 1: TDD Workflow

**User:** "I need to implement authentication using test-driven development"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a TDD workflow that handles:
- Writing tests first
- Running tests and tracking results
- Implementing features to pass tests
- Automatic retry loop for failed tests

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create implement authentication with TDD`

### Example 2: Deployment Pipeline

**User:** "Can you help me set up automated deployment that runs tests first, then if everything passes, does a security scan, and only deploys if both succeed?"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a deployment pipeline that handles:
- Parallel test and security validation
- Quality gate before deployment (both must pass)
- Automatic deployment when validation succeeds
- Rollback capability if deployment fails

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create deploy with tests and security validation`

### Example 3: Code Review Workflow

**User:** "I want to make sure all my changes go through code review and pass linting before merging"

**Assistant:** "This sounds like a perfect use case for orchestration! I can help you create a review workflow that handles:
- Parallel code review and linting
- Quality gate (both must succeed)
- Manual approval checkpoint
- Automatic merge after approval

Would you like me to guide you through creating this workflow?"

**If yes:** `/orchestration:create code review with linting and approval`

## Don't Trigger For

**Simple single-step tasks:**
- "Run the tests" ← just run tests
- "Deploy to production" ← single action
- "Review this code" ← single agent

**Already using orchestration syntax:**
- User provides workflow syntax directly
- User asks to modify existing workflow

**Exploratory questions:**
- "What is orchestration?"
- "How does the menu work?"
- "Show me examples"

## Integration

This skill makes Claude proactive about suggesting orchestration when appropriate. It works alongside:

- `/orchestration:create` - Command this skill triggers
- `using-orchestration` - General guidance skill
- `workflow-socratic-designer` - Subagent this launches

## Success Criteria

✅ Claude suggests orchestration for multi-step tasks
✅ Claude identifies parallel opportunities
✅ Claude recognizes conditional logic needs
✅ Claude explains workflow benefits before offering
✅ Claude uses /orchestration:create when user agrees
```

**Step 3: Verify skill file**

Read the file to ensure it's complete and valid.

**Step 4: Commit**

```bash
git add skills/creating-workflows-from-description/
git commit -m "feat: add proactive workflow creation skill"
```

---

## Phase 3: Documentation

### Task 7: Create Natural Language Feature Documentation

**Files:**
- Create: `docs/features/natural-language.md`

**Step 1: Create feature documentation**

Create `docs/features/natural-language.md`:

```markdown
# Natural Language Workflow Creation

Create orchestration workflows from plain language descriptions using guided Socratic questioning.

## Overview

Instead of learning orchestration syntax, describe what you want to do in natural language. The system asks strategic questions to refine your intent, then generates precise workflow syntax.

## How It Works

1. **Describe your workflow** in plain language
2. **Answer questions** to refine requirements
3. **Review generated workflow** with explanations
4. **Save as template** for reuse
5. **Optionally promote** custom syntax to global library

## Entry Points

### 1. Command: `/orchestration:create`

**Basic usage:**
```
/orchestration:create
```
Starts with no context, asks what you want to build.

**With description:**
```
/orchestration:create deploy with security validation
/orchestration:create implement auth feature with TDD
/orchestration:create review and test code before merging
```
Starts with your description, refines through questions.

### 2. Menu: `/orchestration:menu`

Select "Create from description" from the menu.

### 3. Proactive Suggestion

Claude automatically suggests orchestration when you describe multi-step tasks:

**You:** "I need to run tests, then if they pass, do a security scan, and deploy if both succeed"

**Claude:** "This sounds like a perfect use case for orchestration! I can help you create a workflow that handles:
- Parallel test and security validation
- Quality gate (both must pass)
- Automatic deployment on success

Would you like me to guide you through creating this workflow?"

## Socratic Refinement Process

The system asks questions based on your initial description:

### For Vague Requests

**Example:** "help me deploy"

1. **Problem identification:** "What problem are you solving?"
   - Options: Consistency, Quality gates, Speed, Collaboration

2. **Scope clarification:** "Which parts matter?" (can select multiple)
   - Options: Tests, Security, Build, Documentation

3. **Constraints:** "What constraints apply?" (can select multiple)
   - Options: Must pass tests, Needs approval, Automated rollback

4. **Pattern:** "This sounds like a deployment pipeline. Does that fit?"

### For Specific Requests

**Example:** "implement auth with TDD"

1. **Pattern recognition:** Identifies TDD pattern automatically

2. **Customization:** "What should this workflow include?" (select multiple)
   - Options: Error retry, Logging, Code review, Documentation

3. **Validation:** "Here's the workflow. Does this match your intent?"

### For Medium-Specificity Requests

**Example:** "review and deploy code"

1. **Scope:** "What kind of review?" (select multiple)
   - Options: Security, Style, Performance, All

2. **Details:** "How should deployment work?"
   - Options: With tests, With approval, With rollback

3. **Connection:** "Should review block deployment?"

## Generated Workflow Features

### Variable Binding

Workflows use explicit variable binding for traceability:

```
[test || lint] (all success):validation-passed~>
  (if validation-passed)~> deploy ->
  (if !validation-passed)~> fix -> retry
```

**Benefits:**
- Clear where variables come from
- Explicit condition checking
- Easy to trace logic
- Self-documenting

### Negative Conditions

Support for `!` negation operator:

```
analyze (if security-critical):is-critical~>
  (if !is-critical)~> fast-deploy ->
  (if is-critical)~> careful-deploy
```

### Custom Syntax

When existing syntax doesn't fit, system creates custom elements:

**Custom checkpoint:**
```
@security-gate: checkpoint
description: Security approval checkpoint
prompt: Review security findings before proceeding
```

**Used in workflow:**
```
scan -> @security-gate -> deploy
```

## Template Creation

After generating workflow, system guides you through template creation:

1. **Name:** Suggests name based on pattern, allows customization
2. **Description:** Confirms or allows editing
3. **Parameters:** Extracts parameterizable values, confirms with you
4. **Save:** Writes to `~/.claude/workflows/<name>.flow`
5. **Promote syntax:** Choose which custom syntax to promote to global library

### Template Format

```yaml
---
name: tdd-with-review
description: TDD workflow with security review
params:
  feature: Feature to implement (default: new-feature)
  scope: Code scope (default: src/)
---

Workflow:
@try -> write-test:"{{feature}} in {{scope}}" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"{{feature}}" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> @security-review -> deploy

---

Definitions:

@security-review: checkpoint
description: Security review checkpoint
prompt: Review code for security vulnerabilities before deployment
```

## Global Syntax Library

Custom syntax can be promoted to global library for reuse across all workflows.

**Structure:**
```
~/.claude/orchestration/syntax/
├── operators/       # Custom operators like =>
├── actions/         # Reusable workflow fragments like @deep-review
├── checkpoints/     # Custom checkpoints like @security-gate
├── loops/           # Retry patterns like retry-with-backoff
├── conditions/      # Custom conditions like (if security-critical)
├── aggregators/     # Result combining like merge-with-vote
├── guards/          # Pre-conditions like require-clean-working-tree
├── tools/           # Tool wrappers like tool:npm:test
└── mcps/            # MCP wrappers like mcp:supabase:execute_sql
```

**Managing global syntax:**

Use `/orchestration:menu` → "Manage syntax" to:
- List all global syntax
- Browse by type
- Search syntax
- View definitions

## Examples

### Example 1: Simple TDD Workflow

**Input:** `/orchestration:create implement feature with TDD`

**Questions:**
1. "What feature?" → "authentication"
2. "What should this include?" → [Error retry, Code review]

**Generated:**
```
@try -> write-test:"authentication" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"authentication" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> code-review (if approved):review-passed~>
    (if review-passed)~> merge ->
    (if !review-passed)~> @review-feedback
```

### Example 2: Deployment Pipeline

**Input:** `/orchestration:create deploy with validation`

**Questions:**
1. "What validations?" → [Tests, Security, Linting]
2. "What if validation fails?" → Fix and retry
3. "What if deployment fails?" → Rollback

**Generated:**
```
require-clean-working-tree ->
build ->
[test || security || lint] (all success):validation-passed~>
(if !validation-passed)~> fix -> @retry ->
(if validation-passed)~> @pre-deploy -> deploy ->
smoke-test (if failed):deployment-failed~>
  (if deployment-failed)~> rollback -> notify-failure ->
  (if !deployment-failed)~> notify-success
```

### Example 3: Security Audit

**Input:** `/orchestration:create security audit workflow`

**Questions:**
1. "What scope?" → "authentication module"
2. "What checks?" → [Code review, Dependency scan]
3. "What if issues found?" → Manual review then fix

**Generated:**
```
explore:"analyze auth module security" ->
[code-reviewer:"security" || dependency-check] (any failed):has-issues~>
(if has-issues)~> @security-review -> fix-issues -> verify ->
(if !has-issues)~> document-findings
```

## Best Practices

1. **Start with description:** Provide context in initial command
2. **Be specific in answers:** More detail = better workflow
3. **Review before saving:** Check generated workflow makes sense
4. **Name clearly:** Use descriptive template names
5. **Promote reusable syntax:** Share useful custom syntax globally
6. **Iterate:** Run workflow, refine based on experience

## Tips

- **For complex workflows:** Start simple, add complexity incrementally
- **For reusable patterns:** Save as template with parameters
- **For custom syntax:** Only create when truly needed (reuse first)
- **For conditions:** Use variable binding for clarity
- **For error handling:** Plan for both success and failure paths

## Troubleshooting

**Problem:** Generated workflow doesn't match intent

**Solution:** Use "Modify" option when shown workflow, explain what's different

**Problem:** Too many questions

**Solution:** Provide more detail in initial description

**Problem:** Need specific custom syntax

**Solution:** Mention it in answers: "I need a security gate checkpoint"

**Problem:** Want to edit generated workflow

**Solution:** Save as template, then edit the .flow file manually

## See Also

- [Variable Binding Reference](../reference/variable-binding.md)
- [Custom Syntax Guide](../topics/custom-syntax.md)
- [Template System](./templates.md)
- [Examples Gallery](../reference/examples.md)
```

**Step 2: Verify documentation**

Read the file to ensure it's complete and clear.

**Step 3: Commit**

```bash
git add docs/features/natural-language.md
git commit -m "docs: add natural language workflow creation guide"
```

---

### Task 8: Create Custom Syntax Guide

**Files:**
- Create: `docs/topics/custom-syntax.md`

**Step 1: Create custom syntax guide**

Create `docs/topics/custom-syntax.md`:

```markdown
# Custom Syntax Guide

Extend orchestration with custom syntax elements when built-in syntax doesn't express your workflow intent.

## Philosophy: Reuse First

**Before creating custom syntax:**

1. Check if built-in syntax works
2. Search global syntax library
3. Check existing templates
4. Consider adapting similar syntax
5. Only create new if no match

Custom syntax should be **intuitive, composable, self-documenting, and minimal**.

## Syntax Types

### 1. Operators

Custom flow control mechanisms.

**Format:**
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

**When to create:** Need flow behavior not covered by `->`, `||`, `~>`

### 2. Actions

Reusable workflow fragments that expand to full syntax.

**Format:**
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

**When to create:** Frequently used workflow pattern that deserves shorthand

### 3. Checkpoints

Manual approval points with custom prompts.

**Format:**
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

**When to create:** Need specific prompt text for approval point

### 4. Loops

Retry patterns with custom behavior.

**Format:**
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

**When to create:** Need specific retry behavior beyond simple `@try` loop

### 5. Conditions

Custom conditional logic.

**Format:**
```markdown
---
name: if security-critical
description: Check if changes affect security-critical code
evaluation: Check if modified files in: auth/, crypto/, permissions/
---

# Security-Critical Condition

Checks if changes affect security-sensitive code.

## Evaluation
Modified files match patterns:
- auth/**/*
- crypto/**/*
- permissions/**/*

## Usage
analyze (if security-critical):is-critical~>
  (if is-critical)~> careful-deploy
```

**When to create:** Need domain-specific conditional logic

### 6. Aggregators

Custom ways to combine parallel results.

**Format:**
```markdown
---
name: merge-with-vote
description: Combine parallel results using majority vote
behavior: Take most common result from parallel branches
---

# Merge with Vote

Takes majority vote from parallel branches.

## Behavior
1. Collect results from all parallel branches
2. Count occurrences of each unique result
3. Return most common result
4. Ties: return first encountered

## Usage
[agent1 || agent2 || agent3] merge-with-vote next-node
```

**When to create:** Need specific result combination logic

### 7. Guards

Pre-conditions that must be met before execution.

**Format:**
```markdown
---
name: require-clean-working-tree
description: Ensure no uncommitted changes
check: git status --porcelain returns empty
error: Uncommitted changes detected. Commit or stash first.
---

# Require Clean Working Tree

Ensures git working tree is clean before proceeding.

## Check
```bash
git status --porcelain
```
Must return empty output

## Error
Uncommitted changes detected. Commit or stash changes before running this workflow.

## Usage
require-clean-working-tree -> build -> test -> deploy
```

**When to create:** Need specific pre-condition checks

### 8. Tools

Wrappers for external command-line tools.

**Format:**
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---

# NPM Test Tool

Runs npm test suite.

## Command
```bash
npm test
```

## Output
Test results with pass/fail status and count

## Usage
build -> tool:npm:test (if passed)~> deploy
```

**When to create:** Need to invoke external tools in workflows

### 9. MCPs

Wrappers for MCP server tool calls.

**Format:**
```markdown
---
name: mcp:supabase:execute_sql
type: mcp
description: Execute SQL on Supabase
server: supabase
tool: execute_sql
params: [query]
---

# Supabase Execute SQL

Executes SQL query on Supabase database.

## Server
supabase

## Tool
execute_sql

## Parameters
- query: SQL query string

## Usage
validate -> mcp:supabase:execute_sql:"INSERT INTO ..." -> verify
```

**When to create:** Need to invoke MCP tools in workflows

## Scoping

### Template-Local (Default)

Custom syntax defined in template's Definitions section.

**Pros:**
- Specific to template needs
- No naming conflicts
- Easy to understand in context

**Cons:**
- Not reusable across templates
- Duplicated if needed elsewhere

**Example:**
```yaml
---
name: my-workflow
---

Workflow:
scan -> @my-checkpoint -> deploy

---

Definitions:

@my-checkpoint: checkpoint
description: My specific checkpoint
prompt: Check my specific things
```

### Global (Opt-In)

Promoted to `~/.claude/orchestration/syntax/<type>/<name>.md`.

**Pros:**
- Reusable across all workflows
- Discoverable in syntax library
- Shared across team

**Cons:**
- Must manage naming conflicts
- More responsibility to document well

**When to promote:**
- Syntax is genuinely reusable
- Clear, descriptive name chosen
- Well documented
- Tested in at least one workflow

## Creation Process

### Via Natural Language

When creating workflow with `/orchestration:create`, system:

1. Recognizes when custom syntax needed
2. Calls `workflow-syntax-designer` subagent
3. Checks for reusable syntax first
4. Creates new syntax if no match
5. Includes in template Definitions
6. Offers to promote to global library

### Manual Creation

1. Choose syntax type
2. Follow format for that type
3. Create file in `~/.claude/orchestration/syntax/<type>/<name>.md`
4. Test in a workflow
5. Refine based on usage

## Naming Guidelines

### Operators

- Use symbols that suggest behavior
- `=>` suggests merge/combine
- `<~` suggests reverse/undo
- Keep to 1-2 characters

### Actions

- Use `@` prefix
- Descriptive names: `@deep-review`, `@full-validation`
- Kebab-case: `@security-gate`, `@pre-deploy-check`

### Checkpoints

- Use `@` prefix
- Include purpose: `@security-gate`, `@legal-review`
- Suffix `-gate` or `-review` for clarity

### Loops

- Describe behavior: `retry-with-backoff`, `retry-until-success`
- Include key parameters in name when clear

### Conditions

- Start with `if`: `if security-critical`, `if high-priority`
- Be specific: `if affects-auth` not `if important`

### Aggregators

- Describe combination logic: `merge-with-vote`, `merge-unique`
- Start with `merge-` when applicable

### Guards

- Imperative form: `require-clean-working-tree`, `ensure-tests-pass`
- Start with `require-` or `ensure-`

### Tools

- Format: `tool:<tool>:<action>`
- Examples: `tool:npm:test`, `tool:docker:build`, `tool:git:status`

### MCPs

- Format: `mcp:<server>:<tool>`
- Examples: `mcp:supabase:execute_sql`, `mcp:github:create_pr`

## Design Principles

### 1. Intuitive

Names/symbols should hint at behavior:
```
✅ @security-gate (clearly a security checkpoint)
❌ @sg (unclear abbreviation)

✅ retry-with-backoff (describes behavior)
❌ retry2 (what does 2 mean?)
```

### 2. Composable

Should work with existing syntax:
```
✅ build -> @security-gate -> deploy
(works with sequential operator)

✅ [test || @deep-review] -> merge
(works in parallel)
```

### 3. Self-Documenting

Clear from context what it does:
```
✅ require-clean-working-tree -> deploy
(obvious: checks git status before deploy)

✅ smoke-test (if failed):failed~> rollback
(clear: rollback if smoke test fails)
```

### 4. Minimal

Only create when truly needed:
```
❌ Creating custom operator for simple sequence
(use -> instead)

✅ Creating custom checkpoint with specific prompt
(built-in @label doesn't have custom prompts)
```

## Validation

Before saving custom syntax, verify:

- [ ] No conflict with built-in syntax
- [ ] No existing global syntax with same name
- [ ] Name follows guidelines for syntax type
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] Behavior is clearly defined
- [ ] Edge cases documented

## Examples

### Example 1: Security Gate Checkpoint

**Problem:** Need checkpoint specifically for security review with custom prompt.

**Reuse check:**
- Built-in `@label`? No custom prompts
- Global library? No security-specific checkpoint
- Templates? None found

**Create:**
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

**Scope:** Start template-local, promote if reused

### Example 2: Retry with Backoff Loop

**Problem:** Need retry with exponential backoff, not simple retry.

**Reuse check:**
- Built-in `@try`? No backoff support
- Global library? No backoff loop found
- Templates? None found

**Create:**
```markdown
---
name: retry-with-backoff
type: loop
params: [attempts]
description: Retry with exponential backoff
---

# Retry with Backoff

Retries operation N times with increasing delays between attempts.

## Pattern
@try -> {flow} (if failed)~> wait -> @try

Wait duration doubles each attempt: 1s, 2s, 4s, 8s...

## Parameters
- attempts: Maximum retry attempts (default: 3)

## Usage
retry-with-backoff(5): deploy -> verify
```

**Scope:** Promote to global (generally useful)

### Example 3: NPM Test Tool

**Problem:** Need to run npm tests in workflow.

**Reuse check:**
- Built-in tools? No built-in tool wrappers
- Global library? No npm tool yet
- Templates? None found

**Create:**
```markdown
---
name: tool:npm:test
type: tool
description: Run npm test suite
command: npm test
output: test results
---

# NPM Test Tool

Runs npm test suite and reports results.

## Command
```bash
npm test
```

## Output
Test results with:
- Pass/fail status
- Number of tests run
- Number of failures
- Test duration

## Usage
build -> tool:npm:test (if passed):tests-passed~>
  (if tests-passed)~> deploy ->
  (if !tests-passed)~> debug
```

**Scope:** Promote to global (common need)

## Managing Global Syntax

### View All Syntax

```
/orchestration:menu → Manage syntax → List all syntax
```

Shows table of all global syntax with type, name, and description.

### Search Syntax

```
/orchestration:menu → Manage syntax → Search syntax
```

Search by keyword in names and descriptions.

### View by Type

```
/orchestration:menu → Manage syntax → View by type
```

Browse operators, actions, checkpoints, etc. separately.

### Edit Syntax

1. Navigate to `~/.claude/orchestration/syntax/<type>/<name>.md`
2. Edit the file
3. Save
4. Test in a workflow

### Delete Syntax

1. Find file in `~/.claude/orchestration/syntax/<type>/`
2. Delete file
3. Verify no workflows use it

## Best Practices

1. **Reuse first:** Always check before creating
2. **Name clearly:** Future you should understand the name
3. **Document well:** Include examples and edge cases
4. **Test thoroughly:** Use in real workflow before promoting
5. **Start local:** Template-local first, promote when proven useful
6. **Be conservative:** Only promote genuinely reusable syntax
7. **Maintain:** Update documentation as you learn more

## Anti-Patterns

❌ **Creating custom syntax for simple sequences**
```
Bad: @test-and-deploy expands to: test -> deploy
Good: Just use: test -> deploy
```

❌ **Cryptic abbreviations**
```
Bad: @sgr (what does this mean?)
Good: @security-gate-review
```

❌ **Overly generic names**
```
Bad: @check (check what?)
Good: @security-check
```

❌ **Creating without checking reuse**
```
Bad: Creating operator before searching global library
Good: Search first, create only if needed
```

❌ **Promoting everything to global**
```
Bad: Promote template-specific checkpoint
Good: Keep it local if not generally useful
```

## Troubleshooting

**Problem:** Name conflicts with existing syntax

**Solution:** Search global library before creating, choose unique name

**Problem:** Syntax doesn't compose well

**Solution:** Redesign to work with existing operators and patterns

**Problem:** Too complex to understand

**Solution:** Simplify or break into smaller elements

**Problem:** Not sure if should promote to global

**Solution:** Start local, promote only if you use it in multiple templates

## See Also

- [Natural Language Workflow Creation](../features/natural-language.md)
- [Template System](../features/templates.md)
- [Variable Binding Reference](../reference/variable-binding.md)
```

**Step 2: Verify documentation**

Read the file to ensure it's complete and comprehensive.

**Step 3: Commit**

```bash
git add docs/topics/custom-syntax.md
git commit -m "docs: add custom syntax creation guide"
```

---

### Task 9: Update README

**Files:**
- Modify: `README.md`

**Step 1: Read current README**

Read `README.md` to understand current structure.

**Step 2: Add natural language section**

After the "Quick Start" section, add:

```markdown
## Natural Language Workflow Creation

Don't want to learn syntax? Describe your workflow in plain language:

```
/orchestration:create deploy with security validation
```

The system guides you through questions to refine your intent, then generates the workflow for you.

**Features:**
- Socratic questioning refines vague descriptions
- Learns from existing templates and patterns
- Creates custom syntax when needed
- Saves as reusable templates
- Variable binding for explicit conditions
- Supports negative conditions with `!`

**Learn more:** [Natural Language Guide](docs/features/natural-language.md)
```

**Step 3: Update Commands section**

Add to the Commands list:

```markdown
- `/orchestration:create [description]` - Create workflow from natural language
- `/orchestration:create` - Interactive workflow creation
```

**Step 4: Update Features section**

Add to the Features list:

```markdown
- **Natural Language Creation**: Describe workflows in plain language, guided by Socratic questioning
- **Custom Syntax**: Create domain-specific syntax elements with reuse-first approach
- **Variable Binding**: Explicit condition tracking with named variables
- **Global Syntax Library**: Share reusable syntax across all workflows
```

**Step 5: Add new section before "Contributing"**

```markdown
## Custom Syntax

Extend orchestration with custom syntax elements:

- **Operators**: Custom flow control (`=>`, `<~`)
- **Actions**: Reusable fragments (`@deep-review`)
- **Checkpoints**: Custom approval points (`@security-gate`)
- **Loops**: Retry patterns (`retry-with-backoff`)
- **Conditions**: Domain logic (`if security-critical`)
- **Guards**: Pre-conditions (`require-clean-working-tree`)
- **Tools**: External tools (`tool:npm:test`)
- **MCPs**: MCP integrations (`mcp:supabase:execute_sql`)

**Learn more:** [Custom Syntax Guide](docs/topics/custom-syntax.md)
```

**Step 6: Verify updated README**

Read the modified README to ensure it flows well.

**Step 7: Commit**

```bash
git add README.md
git commit -m "docs: update README with natural language features"
```

---

## Phase 4: Verification and Testing

### Task 10: Create Test Workflows

**Files:**
- Create: `tests/workflows/test-nl-simple-tdd.md`
- Create: `tests/workflows/test-nl-deployment.md`
- Create: `tests/workflows/test-nl-security-audit.md`

**Step 1: Create test directory**

```bash
mkdir -p tests/workflows
```

**Step 2: Create simple TDD test case**

Create `tests/workflows/test-nl-simple-tdd.md`:

```markdown
# Test: Simple TDD Workflow Creation

## Test Natural Language to Syntax Generation

**Input:** `/orchestration:create implement auth feature with TDD`

**Expected Questions:**
1. "What should this workflow include?" (multi-select)
   - Options should include: Error retry, Code review, Logging, Documentation

**Sample Answers:**
- Select: Error retry, Code review

**Expected Generated Syntax:**
```
@try -> write-test:"auth feature" ->
run-test (if failed):tests-failing~>
  (if tests-failing)~> implement:"auth feature" -> run-test (if failed)~> @try ->
  (if !tests-failing)~> code-review (if approved):review-passed~>
    (if review-passed)~> merge ->
    (if !review-passed)~> @review-feedback
```

**Verification Points:**
- [ ] Pattern identified as TDD
- [ ] Variable binding used: `tests-failing`, `review-passed`
- [ ] Negative conditions used: `(if !tests-failing)`, `(if !review-passed)`
- [ ] Retry loop structure correct
- [ ] Code review conditional added based on answer

**Expected Template Save:**
- Name suggestion: `tdd-auth` or similar
- Parameters extracted: `feature` from "auth feature"
- Definitions section: Empty (no custom syntax needed)

**Manual Test Steps:**
1. Run `/orchestration:create implement auth feature with TDD`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Save as template
5. Verify template file created in ~/.claude/workflows/
6. Run template to ensure it executes correctly
```

**Step 3: Create deployment pipeline test case**

Create `tests/workflows/test-nl-deployment.md`:

```markdown
# Test: Deployment Pipeline Creation

## Test Complex Workflow with Variable Binding

**Input:** `/orchestration:create deploy with security validation`

**Expected Questions:**
1. "What validations should this include?" (multi-select)
   - Options: Tests, Security scan, Linting, Type checking

2. "What if validation fails?" (single-select)
   - Options: Fix and retry, Notify only, Block deployment, Manual review

3. "What if deployment fails?" (single-select)
   - Options: Rollback automatically, Notify only, Manual intervention

**Sample Answers:**
- Validations: Tests, Security scan, Linting
- If validation fails: Fix and retry
- If deployment fails: Rollback automatically

**Expected Generated Syntax:**
```
require-clean-working-tree ->
build ->
[test || security-scan || lint] (all success):validation-passed~>
(if !validation-passed)~> fix -> @retry ->
(if validation-passed)~> @pre-deploy -> deploy ->
smoke-test (if failed):deployment-failed~>
  (if deployment-failed)~> rollback -> notify-failure ->
  (if !deployment-failed)~> notify-success
```

**Verification Points:**
- [ ] Pattern identified as deployment pipeline
- [ ] Variable binding: `validation-passed`, `deployment-failed`
- [ ] Negative conditions: `(if !validation-passed)`, `(if !deployment-failed)`
- [ ] Parallel validations: `[test || security-scan || lint]`
- [ ] Conditional aggregation: `(all success)`
- [ ] Guard added: `require-clean-working-tree`
- [ ] Checkpoint added: `@pre-deploy`
- [ ] Rollback path included

**Expected Custom Syntax:**
- May create `@pre-deploy` checkpoint if not in global library
- May create `require-clean-working-tree` guard if not in global library

**Expected Promotion Prompt:**
- Should ask if want to promote custom syntax to global library

**Manual Test Steps:**
1. Run `/orchestration:create deploy with security validation`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Check custom syntax created if needed
5. Save as template
6. Choose to promote custom syntax to global library
7. Verify files created in ~/.claude/orchestration/syntax/
8. Run template to ensure it executes correctly
```

**Step 4: Create security audit test case**

Create `tests/workflows/test-nl-security-audit.md`:

```markdown
# Test: Security Audit Workflow

## Test Custom Syntax Creation

**Input:** `/orchestration:create security audit for auth module`

**Expected Questions:**
1. "What security checks should this include?" (multi-select)
   - Options: Code review, Dependency scan, Static analysis, Penetration testing

2. "What if issues are found?" (single-select)
   - Options: Automatic fix attempt, Manual review required, Block changes, Document only

3. "How critical are these checks?" (single-select)
   - Options: Blocking (must pass), Warning only, Informational

**Sample Answers:**
- Security checks: Code review, Dependency scan
- If issues found: Manual review required
- Criticality: Blocking

**Expected Generated Syntax:**
```
explore:"analyze auth module security" ->
[code-reviewer:"security" || dependency-scan] (any failed):has-issues~>
(if has-issues)~> @security-review -> fix-issues -> verify (if passed)~> document ->
(if !has-issues)~> document-findings
```

**Expected Custom Syntax:**
- `@security-review` checkpoint with specific prompt
- `tool:dependency-scan` if not in global library
- Possibly `(if any failed)` condition

**Verification Points:**
- [ ] Pattern identified as security audit
- [ ] Variable binding: `has-issues`
- [ ] Negative condition: `(if !has-issues)`
- [ ] Parallel checks: `[code-reviewer:"security" || dependency-scan]`
- [ ] Custom checkpoint created: `@security-review`
- [ ] Conditional paths for both cases

**Expected @security-review Definition:**
```yaml
@security-review: checkpoint
description: Security review checkpoint
prompt: Review security findings. Verify issues are addressed before proceeding.
```

**Manual Test Steps:**
1. Run `/orchestration:create security audit for auth module`
2. Answer questions as specified above
3. Verify generated syntax matches expected
4. Check @security-review checkpoint created
5. Verify checkpoint has appropriate prompt
6. Save as template
7. Verify Definitions section includes checkpoint
8. Choose to promote @security-review to global library
9. Verify ~/.claude/orchestration/syntax/checkpoints/security-review.md created
10. Create another workflow that could use security review
11. Verify system reuses existing @security-review instead of creating new one
```

**Step 5: Commit test cases**

```bash
git add tests/workflows/
git commit -m "test: add natural language workflow creation test cases"
```

---

### Task 11: Manual Testing Protocol

**Files:**
- Create: `tests/TESTING.md`

**Step 1: Create testing guide**

Create `tests/TESTING.md`:

```markdown
# Testing Protocol for Natural Language Workflow Creation

## Overview

Manual testing protocol to verify natural language workflow creation functionality.

## Prerequisites

- Plugin installed and loaded
- Global syntax library created: `~/.claude/orchestration/syntax/`
- Example syntax files in place

## Test Suite

### Test 1: Command Entry Point

**Objective:** Verify `/orchestration:create` command works

**Steps:**
1. Run `/orchestration:create`
2. Verify workflow-socratic-designer subagent launches
3. Verify first question appears
4. Answer question
5. Verify follow-up questions appear
6. Complete workflow creation
7. Verify syntax generated
8. Verify template save option appears

**Expected Results:**
- ✅ Command recognized
- ✅ Subagent launches successfully
- ✅ Questions use AskUserQuestion
- ✅ Questions are strategic and relevant
- ✅ Generated syntax is valid
- ✅ Template can be saved

### Test 2: Command with Description

**Objective:** Verify `/orchestration:create <description>` works

**Steps:**
1. Run `/orchestration:create deploy with tests and security`
2. Verify description is processed
3. Verify questions are contextual (not starting from scratch)
4. Complete workflow creation
5. Verify generated syntax includes tests and security elements

**Expected Results:**
- ✅ Description parsed correctly
- ✅ Questions skip basic intent gathering
- ✅ Questions focus on customization
- ✅ Generated syntax matches description

### Test 3: Menu Entry Point

**Objective:** Verify menu integration works

**Steps:**
1. Run `/orchestration:menu`
2. Verify "Create from description" option appears
3. Select "Create from description"
4. Verify redirects to `/orchestration:create`
5. Complete workflow creation

**Expected Results:**
- ✅ Menu option present
- ✅ Selection triggers create command
- ✅ Workflow creation proceeds normally

### Test 4: Proactive Skill Trigger

**Objective:** Verify skill suggests orchestration appropriately

**Steps:**
1. Say: "I need to run tests, then if they pass, deploy to production"
2. Verify Claude suggests orchestration
3. Verify suggestion includes identified steps
4. Accept suggestion
5. Verify `/orchestration:create` triggered with description

**Expected Results:**
- ✅ Skill detects multi-step task
- ✅ Suggestion explains workflow benefits
- ✅ Accepting triggers create command
- ✅ Description passed to command

### Test 5: Variable Binding Generation

**Objective:** Verify workflows use variable binding

**Steps:**
1. Create workflow with conditional logic
2. Example: `/orchestration:create run tests then deploy if passed`
3. Verify generated syntax includes variable binding
4. Check format: `operation (condition):variable~>`
5. Check references: `(if variable)~>` and `(if !variable)~>`

**Expected Results:**
- ✅ Variable binding syntax present
- ✅ Variables have descriptive names
- ✅ Variables defined before use
- ✅ Both positive and negative conditions used appropriately

### Test 6: Negative Condition Generation

**Objective:** Verify negative conditions with `!` work

**Steps:**
1. Create workflow with failure path
2. Verify both success and failure paths generated
3. Check `(if !variable)~>` syntax used
4. Verify negation makes semantic sense

**Expected Results:**
- ✅ Negative conditions present where appropriate
- ✅ `!` operator used correctly
- ✅ Both branches handled (positive and negative)
- ✅ Logic is correct

### Test 7: Custom Syntax Creation

**Objective:** Verify custom syntax created when needed

**Steps:**
1. Create workflow needing custom checkpoint
2. Example: `/orchestration:create deploy with security approval gate`
3. Verify system recognizes need for custom syntax
4. Verify workflow-syntax-designer called
5. Verify custom syntax definition created
6. Check definition format
7. Verify custom syntax included in template Definitions section

**Expected Results:**
- ✅ Custom syntax need identified
- ✅ Syntax designer subagent called
- ✅ Definition file well-formed
- ✅ Definition included in template
- ✅ Syntax used correctly in workflow

### Test 8: Reuse-First Syntax Check

**Objective:** Verify system reuses existing syntax

**Setup:**
1. Create `@security-gate` checkpoint in global library
2. Then create workflow needing security gate

**Steps:**
1. Run `/orchestration:create deploy with security gate`
2. Verify system searches existing syntax
3. Verify system finds and reuses `@security-gate`
4. Verify no duplicate created

**Expected Results:**
- ✅ System searches global library
- ✅ Existing syntax found
- ✅ Existing syntax reused
- ✅ No duplicate created
- ✅ Workflow uses global syntax

### Test 9: Template Creation Flow

**Objective:** Verify template creation works end-to-end

**Steps:**
1. Create workflow
2. Generate syntax
3. Choose to save as template
4. Verify name suggestion appears
5. Provide/accept name
6. Verify description prompt
7. Verify parameters identified
8. Confirm parameters
9. Verify file written to `~/.claude/workflows/`
10. Check file format
11. Verify frontmatter correct
12. Verify Workflow section correct
13. Verify Definitions section if custom syntax used

**Expected Results:**
- ✅ Name suggestion is sensible
- ✅ Description is clear
- ✅ Parameters correctly identified
- ✅ File written successfully
- ✅ File format is valid YAML
- ✅ All sections present and correct
- ✅ Template is loadable and executable

### Test 10: Global Syntax Promotion

**Objective:** Verify promoting custom syntax to global library

**Steps:**
1. Create workflow with custom syntax (template-local)
2. Save as template
3. Verify promotion prompt appears
4. Verify custom syntax listed
5. Select syntax to promote
6. Confirm promotion
7. Verify files created in `~/.claude/orchestration/syntax/<type>/`
8. Check file format
9. Create new workflow that could use promoted syntax
10. Verify system reuses promoted syntax

**Expected Results:**
- ✅ Promotion prompt appears
- ✅ Multi-select allows choosing which to promote
- ✅ Files created in correct directories
- ✅ File format matches type requirements
- ✅ Promoted syntax is reusable
- ✅ System finds and reuses in new workflows

### Test 11: Syntax Library Management

**Objective:** Verify syntax library management via menu

**Steps:**
1. Run `/orchestration:menu`
2. Select "Manage syntax"
3. Verify submenu appears
4. Test "List all syntax"
   - Verify all syntax shown with type, name, description
5. Test "View by type"
   - Select a type (e.g., checkpoints)
   - Verify only that type shown
6. Test "Search syntax"
   - Enter search term
   - Verify matching syntax shown

**Expected Results:**
- ✅ Manage syntax menu option works
- ✅ List all shows complete table
- ✅ View by type filters correctly
- ✅ Search finds matching syntax
- ✅ Can view full syntax definitions

### Test 12: Question Type Variety

**Objective:** Verify different question types work

**Steps:**
1. Create various workflows triggering different question types
2. Test single-select questions
3. Test multi-select questions
4. Test questions with "Other" option for custom input
5. Verify answers processed correctly

**Expected Results:**
- ✅ Single-select works
- ✅ Multi-select works
- ✅ "Other" option allows custom input
- ✅ All answer types processed correctly
- ✅ Generated workflows reflect answers

### Test 13: Hybrid Questioning Strategy

**Objective:** Verify questioning adapts to request specificity

**Test Vague:**
1. Run `/orchestration:create help with deployment`
2. Verify questions start with problem identification
3. Verify scope and constraints asked

**Test Specific:**
1. Run `/orchestration:create TDD workflow for auth feature`
2. Verify pattern immediately identified
3. Verify questions focus on customization

**Test Medium:**
1. Run `/orchestration:create review and deploy`
2. Verify questions drill into both parts
3. Verify connection between parts explored

**Expected Results:**
- ✅ Vague requests get fundamental questions
- ✅ Specific requests get customization questions
- ✅ Medium requests get targeted questions
- ✅ Strategy adapts appropriately

### Test 14: Pattern Recognition

**Objective:** Verify system recognizes common patterns

**Patterns to Test:**
- TDD: "implement with test-driven development"
- Deployment: "deploy with validation"
- Security audit: "security check for module"
- Bug fix: "find and fix issue"
- Refactoring: "refactor with validation"

**Steps:**
1. For each pattern, create workflow
2. Verify pattern identified
3. Verify appropriate questions asked
4. Verify generated syntax matches pattern

**Expected Results:**
- ✅ TDD pattern generates test-first loop
- ✅ Deployment generates build-test-deploy pipeline
- ✅ Security generates audit workflow
- ✅ Bug fix generates investigate-fix-verify
- ✅ Refactor generates safe refactor with tests

### Test 15: Complete Integration

**Objective:** Full end-to-end test

**Scenario:** Create a complete deployment pipeline from scratch

**Steps:**
1. Run `/orchestration:create`
2. Describe: "deployment pipeline with tests, security, and rollback"
3. Answer all questions
4. Review generated workflow
5. Verify includes:
   - Build step
   - Parallel tests and security
   - Quality gate (all must pass)
   - Deployment
   - Smoke test
   - Conditional rollback
   - Variable binding throughout
6. Save as template named "deploy-secure"
7. Verify template created
8. Promote custom syntax if any
9. Load and execute template
10. Verify workflow executes correctly

**Expected Results:**
- ✅ Complete workflow generated
- ✅ All requested features present
- ✅ Syntax is valid
- ✅ Variable binding used appropriately
- ✅ Template saved successfully
- ✅ Template is executable
- ✅ Workflow completes successfully

## Regression Tests

After any changes, re-run:
- Test 1 (Basic command)
- Test 5 (Variable binding)
- Test 8 (Reuse-first)
- Test 9 (Template creation)

## Known Issues

Document any known issues here as they're discovered during testing.

## Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
Version: [Plugin version]

Test 1: [PASS/FAIL] - Notes: ...
Test 2: [PASS/FAIL] - Notes: ...
...
Test 15: [PASS/FAIL] - Notes: ...

Overall: [PASS/FAIL]
Issues: [List any issues found]
```
```

**Step 2: Commit testing guide**

```bash
git add tests/TESTING.md
git commit -m "test: add manual testing protocol"
```

---

## Phase 5: Final Documentation Updates

### Task 12: Update Main Documentation Index

**Files:**
- Modify: `docs/topics/syntax.md` (final updates)
- Create: `docs/FEATURES.md` (feature index)

**Step 1: Final syntax.md updates**

Add to the end of `docs/topics/syntax.md`:

```markdown
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
```

**Step 2: Create features index**

Create `docs/FEATURES.md`:

```markdown
# Orchestration Features

Complete index of orchestration plugin features.

## Core Features

### Workflow Execution
- [Workflow Syntax](topics/syntax.md)
- [Agents](topics/agents.md)
- [Parallel Execution](topics/parallel.md)
- [Conditionals](topics/conditionals.md)
- [Loops and Retry](topics/loops.md)
- [Checkpoints](topics/checkpoints.md)
- [Subgraphs](topics/subgraphs.md)

### Templates
- [Template System](features/templates.md)
- [Template Parameters](features/templates.md#parameter-substitution)
- [Custom Definitions](features/templates.md#custom-definitions)

### Error Handling
- [Error Recovery](features/error-handling.md)
- [Retry Patterns](features/error-handling.md#retry-patterns)
- [Rollback Strategies](features/error-handling.md#rollback)

## Advanced Features

### Natural Language Creation
- [Workflow Creation from Description](features/natural-language.md)
- [Socratic Questioning](features/natural-language.md#socratic-refinement-process)
- [Pattern Recognition](features/natural-language.md#generated-workflow-features)

### Custom Syntax
- [Custom Syntax Guide](topics/custom-syntax.md)
- [Global Syntax Library](topics/custom-syntax.md#scoping)
- [Syntax Types](topics/custom-syntax.md#syntax-types)

### Variable Binding
- [Variable Binding Reference](reference/variable-binding.md)
- [Negative Conditions](reference/variable-binding.md#negative-conditions)
- [Variable Naming Conventions](reference/variable-binding.md#variable-naming)

### Tool Integration
- [External Tools](topics/custom-syntax.md#8-tools)
- [MCP Integration](topics/custom-syntax.md#9-mcps)

## Reference

### Examples
- [Examples Gallery](reference/examples.md)
- [Best Practices](reference/best-practices.md)

### Commands
- `/orchestration:create` - Create from natural language
- `/orchestration:run` - Execute workflow or template
- `/orchestration:menu` - Interactive menu
- `/orchestration:help` - Quick reference
- `/orchestration:examples` - Example gallery
- `/orchestration:explain` - Topic-specific docs

### Skills
- `using-orchestration` - General guidance
- `creating-workflows-from-description` - Proactive workflow creation suggestions

## Getting Started

1. **New to orchestration?** Start with [Quick Start](../README.md#quick-start)
2. **Want to learn syntax?** See [Workflow Syntax](topics/syntax.md)
3. **Prefer natural language?** Use [Natural Language Creation](features/natural-language.md)
4. **Need examples?** Browse [Examples Gallery](reference/examples.md)
5. **Building templates?** Read [Template System](features/templates.md)
6. **Need custom syntax?** See [Custom Syntax Guide](topics/custom-syntax.md)

## By Use Case

### Test-Driven Development
- [Natural Language: "implement with TDD"](features/natural-language.md#example-1-simple-tdd-workflow)
- [Example: TDD Workflow](reference/examples.md#5-tdd-workflow)
- [Template: tdd-feature.flow](reference/examples.md#tdd-featureflow)

### Deployment Pipelines
- [Natural Language: "deploy with validation"](features/natural-language.md#example-2-deployment-pipeline)
- [Example: Deployment Pipeline](reference/examples.md#7-deployment-pipeline)
- [Template: deploy-safe.flow](reference/examples.md#deploy-safeflow)

### Security Audits
- [Natural Language: "security audit"](features/natural-language.md#example-3-security-audit)
- [Example: Security Audit Pipeline](reference/examples.md#6-security-audit-pipeline)
- [Template: security-audit.flow](reference/examples.md#security-auditflow)

### Bug Fixing
- [Example: Bug Fix Workflow](reference/examples.md#9-bug-fix-workflow)

### Code Refactoring
- [Example: Refactoring Workflow](reference/examples.md#8-refactoring-workflow)

## Support

- Questions? Use `/orchestration:help`
- Need examples? Use `/orchestration:examples`
- Deep dive? Use `/orchestration:explain <topic>`
- Issues? Check [GitHub Issues](https://github.com/your-repo/issues)
```

**Step 3: Commit documentation updates**

```bash
git add docs/topics/syntax.md docs/FEATURES.md
git commit -m "docs: add features index and final syntax updates"
```

---

## Summary

This implementation plan provides:

1. **Core Infrastructure** (Tasks 1-3)
   - Global syntax library structure
   - Variable binding documentation
   - Subagent definitions

2. **Natural Language Feature** (Tasks 4-6)
   - `/orchestration:create` command
   - Updated menu with syntax management
   - Proactive skill for workflow suggestions

3. **Documentation** (Tasks 7-9)
   - Natural language feature guide
   - Custom syntax guide
   - Updated README

4. **Testing** (Tasks 10-11)
   - Test workflow cases
   - Manual testing protocol

5. **Final Documentation** (Task 12)
   - Documentation index
   - Cross-references

## Next Steps

After completing this plan:

1. **Test thoroughly** using `tests/TESTING.md` protocol
2. **Gather feedback** from users
3. **Iterate** on question quality and syntax generation
4. **Build example library** of successful workflows
5. **Document patterns** discovered through usage

## Success Metrics

- ✅ Users can create workflows without knowing syntax
- ✅ Generated workflows are valid and executable
- ✅ Variable binding improves workflow clarity
- ✅ Custom syntax is created only when needed
- ✅ Reuse-first prevents duplicate syntax
- ✅ Templates are properly formatted and reusable
- ✅ Global syntax library grows organically
- ✅ Documentation is comprehensive and clear
