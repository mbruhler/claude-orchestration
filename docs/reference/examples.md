# Orchestration Examples Gallery

Curated workflow examples organized by category.

## 1. Sequential Workflows

### Simple Sequential

**Description:** Linear flow through explore, review, implement

**Syntax:**
```
explore:"find authentication bugs" -> review -> implement
```

**Visualization:**
```
[explore:"find authentication bugs"] ○
              │
              ↓
         [review] ○
              │
              ↓
       [implement] ○
```

**When to use:** Straightforward tasks without branching

**Concepts:** Sequential flow (`->`), agent invocation

---

## 2. Parallel Execution

### Parallel Testing

**Description:** Run multiple test suites simultaneously

**Syntax:**
```
explore:"prepare tests" -> [test:unit || test:integration || lint] -> merge -> deploy
```

**Visualization:**
```
  [explore:"prepare tests"] ○
              │
          ┌───┴───┬───┐
          │       │   │
    [test:unit] [test:integration] [lint] ○ ○ ○
          │       │   │
          └───┬───┴───┘
              │
          [merge] ○
              │
              ↓
         [deploy] ○
```

**When to use:** Independent validations that can run concurrently

**Concepts:** Parallel (`||`), subgraphs (`[]`), merge points

---

## 3. Conditional Logic

### Conditional Retry Loop

**Description:** Implement with automatic retry on test failure

**Syntax:**
```
@try -> implement -> test (if failed)~> @try -> (if passed)~> deploy
```

**Visualization:**
```
      [@try] ○
         │
         ↓
   [implement] ○
         │
         ↓
      [test] ○
         │
    (if failed)─┐
         │      │
    (if passed) │
         │      │
         ↓      ↓
    [deploy] [@try]
```

**When to use:** Tasks that may need multiple attempts

**Concepts:** Labels (`@`), conditional flow (`~>`), loops

---

### Conditional Gates

**Description:** Deploy only if all checks pass

**Syntax:**
```
build -> [test || lint || security] (all success)~> deploy
```

**Visualization:**
```
      [build] ○
         │
     ┌───┴───┬───┐
     │       │   │
  [test]  [lint] [security] ○ ○ ○
     │       │   │
     └───┬───┴───┘
         │
   (all success)
         │
         ↓
     [deploy] ○
```

**When to use:** Strict quality gates before critical operations

**Concepts:** Conditional gates, parallel validation

---

## 4. Multi-Stage with Checkpoints

### Full Development Workflow

**Description:** Complete development workflow with review points

**Syntax:**
```
explore:"find auth bugs" -> @review ->
[code-reviewer:"security" || test-anti-patterns] (all success)~> @approve ->
@try -> general-purpose:"implement fixes" -> test (if failed)~> @try ->
@final -> deploy
```

**When to use:** Complex workflows requiring human oversight

**Concepts:** Checkpoints, parallel reviews, retry loops, gates

**Visualization:**
```
[explore:"find auth bugs"] ○
          │
          ↓
      [@review] ○
          │
      ┌───┴───┐
      │       │
[code-reviewer:"security"] [test-anti-patterns] ○ ○
      │       │
      └───┬───┘
          │
    (all success)
          │
          ↓
     [@approve] ○
          │
          ↓
      [@try] ○
          │
          ↓
[general-purpose:"implement fixes"] ○
          │
          ↓
      [test] ○
          │
     (if failed)─┐
          │      │
     (if passed) │
          │      │
          ↓      ↓
     [@final] [@try]
          │
          ↓
      [deploy] ○
```

---

## 5. TDD Workflow

### Test-Driven Development

**Description:** Write test first, implement until passing

**Syntax:**
```
@try -> write-test:"authentication" -> run-test (if failed)~> implement:"auth" -> run-test (if failed)~> @try
```

**When to use:** Implementing new features with TDD methodology

**Concepts:** Red-green-refactor cycle, retry loops

---

## 6. Security Audit Pipeline

### Comprehensive Security Check

**Syntax:**
```
explore:"analyze codebase" ->
[code-reviewer:"security" || security-scan || dependency-check] ->
(any failed)~> @security-review ->
fix-issues ->
verify (if failed)~> @security-review
```

**When to use:** Security-critical code reviews

**Concepts:** Parallel security checks, conditional review, fix loop

---

## 7. Deployment Pipeline

### Safe Deployment with Rollback

**Syntax:**
```
build ->
[unit-tests || integration-tests || e2e-tests] (all success)~>
@pre-deploy ->
deploy ->
smoke-test (if failed)~> rollback -> @failed
```

**When to use:** Production deployments requiring validation

**Concepts:** Quality gates, checkpoints, failure handling

---

## 8. Refactoring Workflow

### Safe Refactor with Validation

**Syntax:**
```
@analyze -> explore:"identify refactoring opportunities" ->
@plan ->
implement-refactor ->
[test || lint || type-check] (all success)~>
code-reviewer:"verify refactor" ->
@approve ->
commit
```

**When to use:** Large refactoring requiring validation

**Concepts:** Multiple checkpoints, comprehensive validation

---

## 9. Bug Fix Workflow

### Find and Fix Bug

**Syntax:**
```
explore:"reproduce bug" ->
explore:"find root cause" ->
@review-findings ->
implement-fix ->
test-fix ->
(if failed)~> @review-findings ->
@verify ->
deploy-fix
```

**When to use:** Systematic bug investigation and fix

**Concepts:** Exploration phases, review points, verification

---

## 10. Documentation Update

### Update Docs with Review

**Syntax:**
```
explore:"find outdated docs" ->
update-docs ->
[spell-check || link-check] (all success)~>
code-reviewer:"review docs" ->
@approve ->
commit:"update documentation"
```

**When to use:** Documentation updates requiring review

**Concepts:** Parallel validation, review gate

---

## Pattern Library

### Common Patterns

**Retry Pattern:**
```
@try -> action (if failed)~> @try
```

**Parallel with Gate:**
```
[action1 || action2] (all success)~> next
```

**Checkpoint Pattern:**
```
phase1 -> @review -> phase2
```

**Fallback Pattern:**
```
primary (if failed)~> fallback
```

**Quality Gate:**
```
build -> [test || lint || security] (all success)~> deploy
```

---

## Tips for Effective Workflows

1. **Start simple** - Begin with linear flow, add complexity as needed
2. **Use checkpoints** - Add `@review` before critical operations
3. **Parallelize wisely** - Only truly independent operations
4. **Plan for failure** - Add retry logic and fallbacks
5. **Name clearly** - Descriptive names help visualization
6. **Test incrementally** - Verify each phase works before adding more

---

## Example Templates

Save these as templates in `~/.claude/workflows/`:

### tdd-feature.flow
```yaml
---
name: tdd-feature
description: TDD workflow for new feature
params:
  feature: Feature to implement
---

Workflow:
@try -> write-test:"{{feature}}" ->
run-test (if failed)~>
implement:"{{feature}}" ->
run-test (if failed)~> @try
```

### security-audit.flow
```yaml
---
name: security-audit
description: Comprehensive security check
params:
  scope: Code scope to audit (default: all)
---

Workflow:
explore:"analyze {{scope}}" ->
[code-reviewer:"security" || dependency-check] ->
(any failed)~> fix-issues ->
verify
```

### deploy-safe.flow
```yaml
---
name: deploy-safe
description: Safe deployment with validation
params:
  environment: Deployment environment (default: production)
---

Workflow:
build ->
[test || lint || security] (all success)~>
@approve ->
deploy:"{{environment}}" ->
smoke-test (if failed)~> rollback
```
