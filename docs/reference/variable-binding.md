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
