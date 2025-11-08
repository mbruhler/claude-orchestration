# Custom Definitions

Extend orchestration syntax with domain-specific elements: custom actions, operators, checkpoints, loops, guards, tools, and MCPs.

## Overview

Custom definitions allow you to create reusable, domain-specific syntax elements that make workflows more expressive and maintainable. They can be defined:

1. **Globally** in `library/syntax/` - Available across all workflows
2. **In templates** - Scoped to specific workflow templates
3. **Inline** - For one-time use in a workflow

## Definition Types

### Custom Actions

Reusable workflow fragments that can be invoked by name.

**Syntax:**
```yaml
@action-name: action
description: What this does
workflow: actual-workflow-syntax
```

**Example:**
```yaml
@deep-review: action
description: Multi-stage code review
workflow: [code-reviewer:"security" || code-reviewer:"style" || code-reviewer:"performance"] -> merge
```

**Usage:**
```
explore -> @deep-review -> implement
```

**Expansion:**
```
explore -> [code-reviewer:"security" || code-reviewer:"style" || code-reviewer:"performance"] -> merge -> implement
```

### Custom Operators

Define new operators with specific behavior.

**Syntax:**
```yaml
operator-symbol: operator
description: What this does
behavior: How it behaves
```

**Example:**
```yaml
=>: operator
description: Merge with conflict resolution
behavior: Execute left, then right, with automatic deduplication
```

**Usage:**
```
[analyze-a || analyze-b] => merge-results
```

### Custom Checkpoints

Named checkpoints with specific prompts and validation logic.

**Syntax:**
```yaml
@checkpoint-name: checkpoint
description: What to check
prompt: Message shown at checkpoint
validation: Optional validation logic
```

**Example:**
```yaml
@security-gate: checkpoint
description: Security approval required
prompt: Verify no security vulnerabilities before proceeding
validation: Check for critical/high severity issues
```

**Usage:**
```
test -> @security-gate -> deploy
```

### Custom Loops

Reusable loop patterns with parameters.

**Syntax:**
```yaml
loop-name(params): loop
description: What this does
pattern: loop-syntax-with-{flow}-placeholder
```

**Example:**
```yaml
retry-with-backoff(N): loop
description: Retry N times with exponential backoff
pattern: @try -> {flow} (if failed)~> @try
```

**Usage:**
```
retry-with-backoff(3) { deploy-to-production }
```

### Custom Guards

Pre-execution validation checks.

**Syntax:**
```yaml
guard-name: guard
description: What to validate
check: Validation logic
error: Error message if check fails
```

**Example:**
```yaml
require-clean-working-tree: guard
description: Ensure no uncommitted changes
check: git status is clean
error: Cannot proceed with uncommitted changes. Please commit or stash changes first.
```

**Usage:**
```
require-clean-working-tree -> deploy
```

### Custom Tools

External tool integrations (npm scripts, bash commands).

**Syntax:**
```yaml
tool-name: tool
description: What the tool does
command: Command to execute
type: npm|bash|make
```

**Example:**
```yaml
npm:test: tool
description: Run all tests
command: npm test
type: npm
```

**Usage:**
```
implement -> npm:test -> deploy
```

### Custom MCPs

Model Context Protocol server integrations.

**Syntax:**
```yaml
mcp-name: mcp
description: What the MCP provides
server: Server identifier
operation: Operation to invoke
```

**Example:**
```yaml
supabase:migrate: mcp
description: Run database migrations
server: supabase
operation: apply_migration
```

**Usage:**
```
test -> supabase:migrate -> verify
```

## Global Definitions (Library)

Global definitions are stored in `library/syntax/` and organized by type:

```
library/syntax/
├── actions/
│   ├── README.md
│   └── security-scan.md
├── operators/
│   ├── README.md
│   └── merge-with-dedup.md
├── checkpoints/
│   ├── README.md
│   └── security-gate.md
├── guards/
│   ├── README.md
│   └── require-clean-tree.md
├── loops/
│   ├── README.md
│   └── retry-n-times.md
├── tools/
│   ├── README.md
│   └── npm-test.md
└── mcps/
    ├── README.md
    └── supabase-migrate.md
```

### Creating Global Definitions

1. Create file in appropriate `library/syntax/<type>/` directory
2. Follow the syntax format for that type
3. Include clear description and examples
4. Test with sample workflows
5. Update the category README.md

**Example file: `library/syntax/actions/security-scan.md`**
```yaml
---
@security-scan: action
description: Comprehensive security analysis
workflow: |
  [
    Explore:"Check for SQL injection vulnerabilities" ||
    Explore:"Check for XSS vulnerabilities" ||
    Explore:"Check for CSRF vulnerabilities" ||
    Explore:"Check dependency vulnerabilities"
  ] -> general-purpose:"Aggregate and prioritize findings"
---

# Security Scan Action

Performs parallel security checks across multiple vulnerability categories.

## Usage

```
implement -> @security-scan -> review
```

## What It Checks

- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Dependency vulnerabilities

## Output

Aggregated security findings prioritized by severity.
```

## Template-Scoped Definitions

Definitions can be scoped to specific templates using the `Definitions:` section:

```yaml
---
name: secure-deploy
description: Deployment with security validation
---

Workflow:
build -> @security-gate -> deploy

---

Definitions:
@security-gate: checkpoint
description: Security approval required
prompt: Review security scan results before deploying
```

Template definitions:
- Only available within that template
- Override global definitions with same name
- Useful for template-specific customization

## Inline Definitions

For one-time use, definitions can be included inline in workflows:

```
# Define inline
@quick-check := [test || lint] ->

# Use immediately
implement -> @quick-check -> deploy
```

## Definition Parsing

When loading workflow:

1. **Scan for Definitions** - Find all definition blocks
2. **Parse Each Definition** - Extract name, type, properties
3. **Validate** - Check syntax and no conflicts with built-ins
4. **Register** - Add to parser's symbol table
5. **Expand During Execution** - Substitute definitions during workflow execution

## Validation Rules

Custom definitions must:
- Not conflict with built-in syntax (`->`, `||`, `@`, etc.)
- Have unique names within their type
- Include required fields (description, workflow/pattern/check)
- Have valid workflow syntax in expansions
- Not create circular references

**Valid:**
```yaml
@my-action: action
description: Custom action
workflow: step1 -> step2
```

**Invalid:**
```yaml
@->: action                          # Conflicts with built-in
description: Bad name
workflow: step1 -> step2

@my-action: action                   # Missing description
workflow: step1 -> step2

@circular: action                    # Circular reference
description: Calls itself
workflow: @circular
```

## Best Practices

### Design Principles

1. **Reuse First** - Check library before creating new definitions
2. **Single Responsibility** - Each definition does one thing well
3. **Clear Naming** - Use descriptive, unambiguous names
4. **Document Well** - Include description, examples, and edge cases
5. **Test Thoroughly** - Verify definitions work in various contexts

### Naming Conventions

**Actions:** Verb-noun format
```
@security-scan
@deep-review
@validate-changes
```

**Operators:** Symbol or mnemonic
```
=>     # Merge with dedup
~>>    # Conditional parallel
```

**Checkpoints:** Noun phrases
```
@security-gate
@pre-deployment-check
@approval-required
```

**Guards:** Requirement statements
```
require-clean-tree
ensure-tests-pass
verify-credentials
```

**Tools:** Namespace:action format
```
npm:test
npm:build
git:push
```

**MCPs:** Server:operation format
```
supabase:migrate
github:create-pr
slack:notify
```

### Complexity Management

**Good - Simple and focused:**
```yaml
@test-and-lint: action
description: Run tests and linting
workflow: [npm:test || npm:lint]
```

**Bad - Too complex:**
```yaml
@everything: action
description: Does everything
workflow: [[[a -> b] || [c -> d]] -> [[e || f] || [g -> h]]] -> i
```

**Solution - Break into smaller pieces:**
```yaml
@validate: action
description: Validation checks
workflow: [npm:test || npm:lint]

@security: action
description: Security checks
workflow: [security-scan || dependency-check]

@full-check: action
description: Complete validation
workflow: @validate -> @security
```

## Examples

### Example 1: Security Pipeline

**Global definitions in library:**

`library/syntax/guards/require-clean-tree.md`:
```yaml
require-clean-working-tree: guard
description: Ensure no uncommitted changes
check: git status --porcelain is empty
error: Cannot proceed with uncommitted changes
```

`library/syntax/actions/security-scan.md`:
```yaml
@security-scan: action
description: Security analysis
workflow: [static-analysis || dependency-scan || secret-scan]
```

`library/syntax/checkpoints/security-review.md`:
```yaml
@security-review: checkpoint
description: Security team approval
prompt: Review security findings and approve for deployment
```

**Workflow using definitions:**
```
require-clean-working-tree ->
implement ->
@security-scan ->
@security-review ->
deploy
```

### Example 2: Testing Pipeline

**Template with scoped definitions:**

```yaml
---
name: tdd-workflow
description: Test-driven development workflow
---

Workflow:
@write-test -> npm:test -> @verify-test-fails -> implement -> npm:test (if passed)~> deploy

---

Definitions:
@write-test: checkpoint
description: Write failing test first
prompt: Write a test that fails for the feature you want to implement

@verify-test-fails: checkpoint
description: Confirm test fails before implementing
prompt: Verify the test fails as expected (red phase)

npm:test: tool
description: Run test suite
command: npm test
type: npm
```

### Example 3: Custom Operator

**Merge operator with deduplication:**

```yaml
=>: operator
description: Merge results with automatic deduplication
behavior: Collects outputs from left side, deduplicates, passes to right side
```

**Usage:**
```
[analyze-code || analyze-deps || analyze-config] => generate-report
```

## Troubleshooting

### Definition Not Found

```
Error: Unknown action '@my-action'
```

**Fixes:**
1. Check definition is in `library/syntax/actions/`
2. Verify syntax in definition file
3. Ensure workflow has been reloaded
4. Check for typos in name

### Circular Reference

```
Error: Circular definition detected: @a -> @b -> @a
```

**Fix:** Remove circular references, use different approach

### Syntax Conflict

```
Error: Definition '||' conflicts with built-in operator
```

**Fix:** Choose different name that doesn't conflict with built-ins

### Invalid Workflow in Definition

```
Error: Invalid workflow syntax in action '@my-action'
Expected operator, found: [
```

**Fix:** Validate workflow syntax in definition matches orchestration syntax rules

## See Also

- [Template System](./templates.md) - Template file format and parameter substitution
- [Syntax Reference](../reference/syntax.md) - Core orchestration syntax
- [Best Practices](../reference/best-practices.md) - Guidelines for workflow design
- [Custom Syntax Topic](../topics/custom-syntax.md) - Designing custom syntax elements
