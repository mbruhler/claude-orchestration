# Variables Guide

Progressive disclosure guide to variable binding and interpolation in orchestration workflows.

## Overview

Variables in workflows serve two key purposes:

1. **Capture outputs** from agents and operations for later use
2. **Pass data** between different parts of your workflow

Variables make workflows dynamic and data-driven, allowing agents to build on each other's work and make decisions based on previous results.

**When to use variables:**
- Passing data between sequential steps
- Conditional branching based on agent outputs
- Accumulating results from parallel operations
- Making workflows self-documenting and traceable

---

## Capturing Output

### Basic Capture Syntax

Capture an agent's output by appending `:variable_name` after the instruction:

```
agent:"instruction":variable_name
```

**Example:**
```
Explore:"Find all authentication files":auth_files
```

The variable `auth_files` now contains the output from the Explore agent.

### Temporary Agent Outputs

Temporary agents can also capture output:

```
$scanner:"Analyze security vulnerabilities":vulnerabilities
```

### What Gets Captured

When you capture output, you get:
- **Text output** from the agent's response
- **Findings, analysis, and recommendations** the agent provides
- **Any data** the agent generates or discovers

The captured content is the agent's final response text, which you can then reference in later steps.

### Naming Conventions

**Use snake_case for variable names:**
- `auth_files` ✓
- `security_issues` ✓
- `test_results` ✓
- `AuthFiles` ✗ (use lowercase)
- `security-issues` ✗ (use underscores, not hyphens)

**Be descriptive:**
- `scan_results` ✓ (clear what it contains)
- `results` ✗ (too vague)
- `user_validation_status` ✓ (specific)
- `status` ✗ (not specific enough)

**Use noun phrases:**
- `error_report` ✓
- `fixed_code` ✓
- `test_coverage_summary` ✓

---

## Variable Interpolation

### Using Variables in Instructions

Reference captured variables in later instructions using curly braces `{variable_name}`:

```
Explore:"Find authentication bugs":bugs ->
expert-code-implementer:"Fix these issues: {bugs}"
```

The `{bugs}` placeholder gets replaced with the actual content from the first agent's output.

### Multiple Variables

Use multiple variables in a single instruction:

```
Explore:"Analyze authentication":auth_analysis ->
Explore:"Analyze authorization":authz_analysis ->
expert-code-implementer:"Compare {auth_analysis} with {authz_analysis} and identify gaps"
```

### Nested Workflows

Variables work across workflow phases:

```
# Phase 1: Analysis
$analyzer:"Scan codebase":findings ->

# Phase 2: Planning
implementation-architect:"Create fix plan for {findings}":plan ->

# Phase 3: Implementation
expert-code-implementer:"Execute this plan: {plan}":implementation ->

# Phase 4: Verification
code-reviewer:"Verify {implementation} addresses {findings}"
```

### Interpolation in Temporary Agent Definitions

You can also interpolate variables within temporary agent prompts:

```
$custom_reviewer := {
  base: "code-reviewer",
  prompt: "Focus review on issues found: {initial_scan}",
  model: "sonnet"
}
```

**Note:** The variable must exist before the temporary agent is invoked.

---

## Variable Scope

### Workflow-Wide Availability

Once a variable is captured, it's available throughout the entire workflow:

```
Explore:"Find issues":issues ->
@checkpoint ->
expert-code-implementer:"Fix {issues}":fixes ->
@review ->
code-reviewer:"Verify {fixes} address {issues}"
```

Both `issues` and `fixes` remain accessible across checkpoints.

### Variable Lifetime

Variables persist for the entire workflow execution:
- Created when the capturing node completes
- Available to all subsequent nodes
- Remain accessible even after checkpoints
- Cleared only when workflow completes

### Sequential Definition

Variables must be defined before use:

```
# ✓ Correct - bugs defined before use
Explore:"Find bugs":bugs ->
general-purpose:"Fix {bugs}"

# ✗ Wrong - bugs used before definition
general-purpose:"Fix {bugs}" ->
Explore:"Find bugs":bugs
```

### Parallel Branch Variables

Variables captured in parallel branches are all available after the parallel block completes:

```
[
  Explore:"Find security issues":security ||
  Explore:"Find performance issues":performance ||
  Explore:"Find style issues":style
] ->
general-purpose:"Address all issues: {security}, {performance}, {style}"
```

**Important:** You cannot use a variable from one parallel branch in another parallel branch executing at the same time.

```
# ✗ Wrong - parallel branches can't access each other's variables
[
  Explore:"Find config":config ||
  general-purpose:"Use {config}"  # Error: config not yet available
]

# ✓ Correct - use variables after parallel block
[
  Explore:"Find config":config ||
  Explore:"Find schema":schema
] ->
general-purpose:"Compare {config} with {schema}"
```

---

## Conditional Variables

### Binding from Conditions

Capture boolean results from conditions:

```
operation (condition):variable_name~>
```

This evaluates the condition and stores true/false in the variable.

**Example:**
```
general-purpose:"Run tests" (if passed):tests_passing~>
  (if tests_passing)~> deploy
```

### Using in Conditionals

Reference boolean variables in conditional branches:

```
build ->
test (if passed):build_success~>
  (if build_success)~> deploy ->
  (if !build_success)~> notify_failure
```

### Negative Checks

Use `!` prefix to check if a variable is false:

```
analyze (if security-critical):is_critical~>
  (if !is_critical)~> fast_deploy ->
  (if is_critical)~> security_review -> careful_deploy
```

### Complex Conditional Flows

Combine multiple conditional variables:

```
[test || lint] (all success):validation_passed~>
  (if !validation_passed)~> fix -> @retry ->
  (if validation_passed)~> analyze (if production-ready):ready~>
    (if ready)~> deploy ->
    (if !ready)~> @review -> manual_approval -> deploy
```

---

## Common Patterns

### Pattern 1: Data Passing Pipeline

Pass data through a series of transformations:

```
Explore:"Extract user data from database":raw_data ->
general-purpose:"Clean and validate {raw_data}":clean_data ->
general-purpose:"Transform {clean_data} to new format":transformed_data ->
general-purpose:"Generate report from {transformed_data}":final_report
```

### Pattern 2: Conditional Branching Based on Results

Make decisions based on agent outputs:

```
$security_scanner:"Scan for vulnerabilities":issues ->
general-purpose:"Count severity levels in {issues}":severity_count ->
analyze (if critical-issues-found):has_critical~>
  (if has_critical)~> @emergency_review -> priority_fix ->
  (if !has_critical)~> standard_review -> scheduled_fix
```

### Pattern 3: Accumulating Results from Parallel Branches

Gather outputs from parallel operations:

```
[
  Explore:"Find TODO comments":todos ||
  Explore:"Find FIXME comments":fixmes ||
  Explore:"Find XXX comments":xxx_notes ||
  code-reviewer:"Find undocumented public APIs":missing_docs
] ->
general-purpose:"Create issue tracker entries for:
  - TODOs: {todos}
  - FIXMEs: {fixmes}
  - XXX notes: {xxx_notes}
  - Missing docs: {missing_docs}
":issue_tracker_report
```

### Pattern 4: Iterative Refinement

Use outputs to refine subsequent steps:

```
implementation-architect:"Create initial plan":plan ->
code-reviewer:"Review {plan} for issues":review ->
implementation-architect:"Refine {plan} based on {review}":refined_plan ->
expert-code-implementer:"Implement {refined_plan}":implementation
```

### Pattern 5: Analysis and Summary

Collect detailed analysis and create summaries:

```
$analyzer:"Deep analysis of authentication system":auth_details ->
$analyzer:"Deep analysis of authorization system":authz_details ->
$analyzer:"Deep analysis of session management":session_details ->
general-purpose:"Create executive summary of:
  Authentication: {auth_details}
  Authorization: {authz_details}
  Sessions: {session_details}
":security_summary ->
@review
```

### Pattern 6: Validation Gates

Validate outputs before proceeding:

```
expert-code-implementer:"Implement feature X":implementation ->
code-reviewer:"Review {implementation}":review_results ->
analyze (if approved):is_approved~>
  (if !is_approved)~>
    expert-code-implementer:"Address issues: {review_results}":fixes ->
    @retry ->
  (if is_approved)~> merge_to_main
```

### Pattern 7: Multi-Agent Collaboration

Have specialized agents work together:

```
$backend_expert:"Analyze API endpoints":api_analysis ->
$frontend_expert:"Analyze UI components":ui_analysis ->
$integration_expert:"Identify integration issues between {api_analysis} and {ui_analysis}":integration_issues ->
[
  $backend_expert:"Fix backend issues: {integration_issues}":backend_fixes ||
  $frontend_expert:"Fix frontend issues: {integration_issues}":frontend_fixes
] ->
general-purpose:"Verify {backend_fixes} and {frontend_fixes} work together":verification
```

---

## Best Practices

### 1. Use Descriptive Names

**Good:**
```
Explore:"Find authentication vulnerabilities":auth_vulnerabilities
```

**Bad:**
```
Explore:"Find authentication vulnerabilities":v
```

Descriptive names make workflows self-documenting and easier to maintain.

### 2. Follow snake_case Convention

**Consistent naming:**
```
security_scan_results
test_coverage_report
user_validation_status
```

**Avoid:**
```
securityScanResults  # camelCase
security-scan-results  # kebab-case
SecurityScanResults  # PascalCase
```

### 3. When to Use Variables vs Direct Flow

**Use variables when:**
- You need to reference output multiple times
- The data flows to multiple branches
- You want to make dependencies explicit
- The output is important enough to name

```
Explore:"Find all test files":test_files ->
[
  general-purpose:"Run tests in {test_files}" ||
  general-purpose:"Check coverage for {test_files}" ||
  general-purpose:"Generate report for {test_files}"
]
```

**Don't use variables when:**
- Output flows to exactly one next step
- The relationship is obvious from context
- Variable wouldn't add clarity

```
# Direct flow is clearer here
build -> test -> deploy

# No need for:
build:build_output ->
test:"Test {build_output}":test_output ->
deploy:"Deploy {test_output}"
```

### 4. Avoid Variable Name Conflicts

Each variable should be defined only once:

```
# ✗ Wrong - reusing variable name
Explore:"Find bugs":issues ->
fix_bugs ->
Explore:"Find more bugs":issues  # Error: issues already defined

# ✓ Correct - unique names
Explore:"Find initial bugs":initial_issues ->
fix_bugs ->
Explore:"Find remaining bugs":remaining_issues
```

### 5. Group Related Variables

When capturing multiple related outputs, use consistent prefixes:

```
[
  Explore:"Analyze authentication":auth_analysis ||
  Explore:"Analyze authorization":auth_permissions ||
  Explore:"Analyze session handling":auth_sessions
] ->
general-purpose:"Create security report from {auth_analysis}, {auth_permissions}, {auth_sessions}"
```

### 6. Document Complex Interpolations

For workflows with many variables, add comments:

```
# Capture all analysis results
$scanner:"Security scan":security_results ->
$performance:"Performance analysis":perf_results ->
$quality:"Code quality check":quality_results ->

# Generate comprehensive report using all captured data
$reporter:"Create report including:
  Security: {security_results}
  Performance: {perf_results}
  Quality: {quality_results}
":final_report
```

### 7. Balance Granularity

**Too many variables (overly granular):**
```
build:b -> test:t -> lint:l -> format:f -> deploy:d
```

**Too few variables (missing important data):**
```
analyze -> fix -> verify  # Lost context between steps
```

**Just right:**
```
analyze:findings ->
fix:"Address {findings}":implementation ->
verify:"Check {implementation} fixes {findings}"
```

---

## Examples

### Example 1: Simple Data Pipeline

```
# Extract, transform, and report on database migration status

Explore:"Find all migration files and extract version numbers":migration_list ->
general-purpose:"Check which migrations in {migration_list} have been applied to production database":applied_migrations ->
general-purpose:"Compare {migration_list} with {applied_migrations} and identify pending migrations":pending_migrations ->
general-purpose:"Generate migration report showing {pending_migrations} with risk assessment":migration_report ->
@review
```

### Example 2: Conditional Code Analysis

```
# Analyze code with different paths for simple vs complex projects

Explore:"Count total lines of code and number of files":project_size ->
analyze (if large-codebase):is_large~>
  (if is_large)~>
    $deep_analyzer:"Perform comprehensive analysis of architecture, patterns, and dependencies":detailed_analysis ->
    @architect_review ->
  (if !is_large)~>
    general-purpose:"Perform standard code review focusing on common issues":standard_analysis ->

# Both paths converge here
general-purpose:"Create actionable recommendations based on analysis"
```

### Example 3: Parallel Investigation and Synthesis

```
# Investigate multiple aspects of a security incident in parallel

[
  $log_analyzer:"Analyze server logs for suspicious activity in last 24h":log_findings ||
  $code_scanner:"Scan codebase for recently introduced vulnerabilities":code_findings ||
  $network_analyzer:"Review network traffic patterns for anomalies":network_findings ||
  general-purpose:"Check third-party dependencies for known CVEs":dependency_findings
] ->

# Synthesize all findings
general-purpose:"Correlate findings from multiple sources:
  Logs: {log_findings}
  Code: {code_findings}
  Network: {network_findings}
  Dependencies: {dependency_findings}

  Identify root cause and attack vector":root_cause_analysis ->

# Create incident report
general-purpose:"Generate incident report including {root_cause_analysis} with timeline, impact assessment, and remediation steps":incident_report ->

@security_review
```

### Example 4: Test-Driven Development Flow

```
# Implement feature using TDD with variable tracking

implementation-architect:"Analyze requirements and create implementation plan":implementation_plan ->

# RED phase
expert-code-implementer:"Write failing tests based on {implementation_plan}":test_suite ->
general-purpose:"Run tests and confirm they fail as expected":test_results ->

# GREEN phase
expert-code-implementer:"Write minimal code to pass tests in {test_suite}":implementation ->
general-purpose:"Run tests again":updated_test_results ->

# Verify success
analyze (if all-tests-pass):tests_passing~>
  (if !tests_passing)~>
    @review ->
    expert-code-implementer:"Debug failing tests using {updated_test_results}":debug_fixes ->
    @retry ->
  (if tests_passing)~>
    # REFACTOR phase
    code-reviewer:"Refactor {implementation} while keeping {test_suite} passing":refactored_code ->
    general-purpose:"Final test run to verify {refactored_code}":final_test_results ->
    @complete
```

### Example 5: Progressive Enhancement

```
# Build feature with progressive complexity based on validation

# Stage 1: Minimal viable implementation
expert-code-implementer:"Create basic implementation of user authentication":basic_auth ->
general-purpose:"Test {basic_auth} functionality":basic_test_results ->

# Stage 2: Add security
analyze (if basic-functional):stage1_complete~>
  (if stage1_complete)~>
    $security_expert:"Add security hardening to {basic_auth}: rate limiting, password hashing, session management":secure_auth ->
    general-purpose:"Security test {secure_auth}":security_test_results ->

# Stage 3: Add advanced features
analyze (if security-passing):stage2_complete~>
  (if stage2_complete)~>
    expert-code-implementer:"Enhance {secure_auth} with: OAuth integration, 2FA, passwordless options":advanced_auth ->
    general-purpose:"Run full test suite on {advanced_auth}":final_test_results ->

@production_review
```

### Example 6: Multi-Language Codebase Analysis

```
# Analyze polyglot codebase with specialized agents

[
  $js_expert:"Analyze JavaScript/TypeScript code for issues":js_findings ||
  $python_expert:"Analyze Python code for issues":py_findings ||
  $rust_expert:"Analyze Rust code for issues":rust_findings ||
  general-purpose:"Analyze build configuration and CI/CD":build_findings
] ->

# Create per-language action items
[
  general-purpose:"Create JavaScript action items from {js_findings}":js_actions ||
  general-purpose:"Create Python action items from {py_findings}":py_actions ||
  general-purpose:"Create Rust action items from {rust_findings}":rust_actions
] ->

# Synthesize cross-language insights
general-purpose:"Identify patterns across languages:
  JavaScript: {js_findings}
  Python: {py_findings}
  Rust: {rust_findings}
  Build: {build_findings}

  Find architectural issues that span multiple languages":cross_cutting_concerns ->

# Generate comprehensive report
general-purpose:"Create master report with:
  - Per-language actions: {js_actions}, {py_actions}, {rust_actions}
  - Cross-cutting concerns: {cross_cutting_concerns}
  - Prioritized roadmap
":master_report
```

### Example 7: Iterative Code Review with Refinement

```
# Progressive code review with automated fixes

expert-code-implementer:"Implement new payment processing feature":initial_implementation ->

# First review round
code-reviewer:"Review {initial_implementation} for critical issues":critical_review ->
analyze (if has-critical-issues):has_critical~>
  (if has_critical)~>
    expert-code-implementer:"Fix critical issues: {critical_review}":fixed_critical ->
    @checkpoint ->
  (if !has_critical)~>
    fixed_critical := {initial_implementation} ->  # No critical issues, use original

# Second review round - style and best practices
code-reviewer:"Review {fixed_critical} for style and best practices":style_review ->
expert-code-implementer:"Apply style improvements: {style_review}":improved_code ->

# Security audit
$security_auditor:"Audit {improved_code} for security vulnerabilities":security_audit ->
analyze (if security-approved):security_ok~>
  (if !security_ok)~>
    expert-code-implementer:"Address security issues: {security_audit}":security_hardened ->
    final_code := {security_hardened} ->
  (if security_ok)~>
    final_code := {improved_code} ->

# Performance check
$performance_expert:"Analyze {final_code} for performance issues":perf_analysis ->
general-purpose:"Generate final documentation and change summary":documentation ->

@ready_for_merge
```

---

## Summary

Variables are essential for creating dynamic, data-driven workflows:

- **Capture outputs** with `:variable_name` syntax
- **Interpolate values** using `{variable_name}` in instructions
- **Use snake_case** for consistent naming
- **Make dependencies explicit** by passing data through variables
- **Leverage conditional variables** for dynamic branching
- **Follow best practices** for maintainable workflows

Variables transform static workflow graphs into intelligent, adaptive automation that builds on its own work.
