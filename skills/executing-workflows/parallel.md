# Parallel Execution Guide

Progressive disclosure guide for parallel execution with the `||` operator in workflow orchestration.

## Overview

Parallel execution allows multiple tasks to run simultaneously, significantly improving workflow performance when tasks are independent.

**Benefits:**
- **Speed**: Multiple agents execute concurrently instead of waiting sequentially
- **Independence**: Tasks run without blocking each other
- **Efficiency**: Optimal resource utilization for independent operations
- **Scalability**: Handle multiple validations, tests, or analyses at once

**Key Principle:** Parallel tasks must be independent - they cannot depend on each other's results or modify shared state.

---

## Basic Parallel Syntax

### Simple Parallel Execution

Execute multiple tasks simultaneously using the `||` operator:

```flow
[task1 || task2 || task3]
```

**Important:** Square brackets `[...]` are required to group parallel operations into a subgraph.

### With Agents

Use specific agents for parallel tasks:

```flow
[
  Explore:"Find authentication bugs" ||
  general-purpose:"Run test suite" ||
  code-reviewer:"Review security practices"
]
```

### Parallel Merge

All parallel branches complete before workflow continues:

```flow
start -> [analyze || validate || test] -> merge-results -> deploy
```

**Execution flow:**
1. `start` completes
2. All three tasks (`analyze`, `validate`, `test`) launch simultaneously
3. Workflow waits for all parallel tasks to complete
4. `merge-results` executes with combined context
5. `deploy` executes

---

## Variable Capture in Parallel

### Individual Variable Capture

Each parallel branch can capture its own output variable:

```flow
[
  Explore:"Find routes":routes ||
  Explore:"Find middleware":middleware ||
  Explore:"Find controllers":controllers
] ->
general-purpose:"Analyze architecture using {routes}, {middleware}, {controllers}"
```

**How it works:**
1. Three parallel explorations execute simultaneously
2. Each captures output to its own variable (`routes`, `middleware`, `controllers`)
3. After all complete, the next step can reference all three variables
4. Variables are interpolated into the instruction text

### Using Captured Variables After Merge

Variables from parallel branches are available in subsequent steps:

```flow
[
  general-purpose:"Run unit tests":unit_results ||
  general-purpose:"Run integration tests":integration_results ||
  general-purpose:"Run e2e tests":e2e_results
] ->
general-purpose:"Generate test report combining {unit_results}, {integration_results}, {e2e_results}" ->
@review-test-results
```

### Referencing Parallel Results

Access individual results or combine them:

```flow
[
  general-purpose:"Security scan":security_status ||
  general-purpose:"Performance benchmark":performance_status ||
  general-purpose:"Code quality check":quality_status
] ->
(if security_status)~> deploy ->
(if !security_status)~> general-purpose:"Address security issues from: {security_status}"
```

---

## Parallel Conditions

### All Success Condition

Require all parallel branches to succeed:

```flow
[test || lint || security] (all success)~> deploy
```

**Semantics:**
- All three tasks must complete successfully
- If any task fails, the condition is false
- Workflow continues to `deploy` only if all succeeded

**Use case:** Quality gates where every check must pass

### Any Success Condition

Proceed if at least one branch succeeds:

```flow
[primary-api || backup-api || fallback-api] (any success)~> process-data
```

**Semantics:**
- At least one task must succeed
- If all tasks fail, the condition is false
- Workflow continues if any one succeeded

**Use case:** Redundant data sources or fallback mechanisms

### Specific Conditions After Parallel

Apply custom conditions to parallel results:

```flow
[
  security-scan:"Check vulnerabilities":security ||
  performance-test:"Load testing":performance
] ->
(if "no critical issues")~> deploy ->
(if "found critical issues")~> @emergency-review
```

### Combining Parallel with Conditional Variables

```flow
[
  test:"Run tests" (if passed):tests_ok ||
  lint:"Run linter" (if passed):lint_ok ||
  security:"Security scan" (if passed):security_ok
]~>
  (if tests_ok)~> (if lint_ok)~> (if security_ok)~> deploy ->
  (if !tests_ok)~> debug-tests ->
  (if !lint_ok)~> fix-lint ->
  (if !security_ok)~> fix-security
```

---

## Common Parallel Patterns

### Multi-Platform Testing

Test across different platforms simultaneously:

```flow
[
  general-purpose:"Run tests on Linux":linux_test ||
  general-purpose:"Run tests on macOS":mac_test ||
  general-purpose:"Run tests on Windows":windows_test
] (all success)~>
  general-purpose:"Generate cross-platform test report"
```

### Parallel Validation

Run multiple validation checks:

```flow
build ->
[
  general-purpose:"Run unit tests" ||
  general-purpose:"Run linter" ||
  general-purpose:"Security vulnerability scan" ||
  general-purpose:"Check documentation coverage"
] (all success)~> deploy
```

### Multi-Source Data Collection

Gather data from multiple sources in parallel:

```flow
[
  Explore:"Scan src/ for components":components ||
  Explore:"Scan tests/ for test files":tests ||
  Explore:"Scan docs/ for documentation":docs ||
  general-purpose:"Read package.json dependencies":deps
] ->
implementation-architect:"Create project architecture report using {components}, {tests}, {docs}, {deps}"
```

### Parallel Investigation Paths

Investigate different aspects simultaneously:

```flow
[
  Explore:"Check recent commits for changes":git_history ||
  Explore:"Search logs for error patterns":log_analysis ||
  Explore:"Analyze configuration files":config_review ||
  general-purpose:"Check environment variables":env_check
] ->
general-purpose:"Synthesize findings from {git_history}, {log_analysis}, {config_review}, {env_check} to identify root cause"
```

### Parallel Implementation with Review

Implement multiple features, then review together:

```flow
[
  expert-code-implementer:"Implement authentication module":auth_code ||
  expert-code-implementer:"Implement authorization module":authz_code ||
  expert-code-implementer:"Implement session management":session_code
] ->
@review-all-implementations ->
code-reviewer:"Review {auth_code}, {authz_code}, {session_code} for security and consistency"
```

### Parallel Refactoring

Refactor multiple modules independently:

```flow
[
  expert-code-implementer:"Refactor user service" ||
  expert-code-implementer:"Refactor auth service" ||
  expert-code-implementer:"Refactor data service"
] ->
general-purpose:"Run full integration test suite" (if passed)~> commit
```

---

## Requirements for Parallel Tasks

### Tasks Must Be Independent

**✓ Good - Independent operations:**
```flow
[
  Explore:"Find all TODO comments" ||
  Explore:"Find all FIXME comments" ||
  Explore:"Find all deprecated code"
]
```

**✗ Bad - Sequential dependency:**
```flow
[
  general-purpose:"Create user" ||
  general-purpose:"Assign permissions to user"  # Needs user from previous task!
]
```

### No Dependencies Between Parallel Branches

Each branch must be self-contained:

**✓ Good - Fully independent:**
```flow
[
  general-purpose:"Test authentication module" ||
  general-purpose:"Test payment module" ||
  general-purpose:"Test reporting module"
]
```

**✗ Bad - Branch dependency:**
```flow
[
  general-purpose:"Create test database":db ||
  general-purpose:"Run tests using {db}"  # Can't reference db from parallel branch!
]
```

### Read-Only Operations Are Safe

Parallel tasks can safely read the same files:

**✓ Safe - Multiple reads:**
```flow
[
  Explore:"Count lines in src/" ||
  Explore:"Find patterns in src/" ||
  code-reviewer:"Review code quality in src/"
]
```

### Avoid File Write Conflicts

Don't write to the same files in parallel:

**✗ Dangerous - Write conflicts:**
```flow
[
  general-purpose:"Update config.json with feature A" ||
  general-purpose:"Update config.json with feature B"  # Race condition!
]
```

**✓ Safe - Different files:**
```flow
[
  general-purpose:"Update auth-config.json" ||
  general-purpose:"Update db-config.json" ||
  general-purpose:"Update api-config.json"
]
```

---

## Error Handling in Parallel

### Continue on Individual Failures

By default, parallel execution continues even if some branches fail:

```flow
[
  general-purpose:"Optional performance optimization" ||
  general-purpose:"Optional documentation update" ||
  general-purpose:"Optional style improvements"
] ->
general-purpose:"Proceed with available improvements"
```

**Behavior:**
- All branches attempt to execute
- Failures are logged but don't stop other branches
- Next step receives context from all branches (including failures)

### All-or-Nothing with `(all success)~>`

Require all branches to succeed:

```flow
[
  general-purpose:"Critical security validation" ||
  general-purpose:"Critical data integrity check" ||
  general-purpose:"Critical dependency verification"
] (all success)~> deploy ->
(if failed)~> @rollback
```

**Behavior:**
- All branches must complete successfully
- If any fails, condition is false
- Can route to error handling path

### Partial Results Handling

Handle mixed success/failure scenarios:

```flow
[
  general-purpose:"Primary data source":primary ||
  general-purpose:"Secondary data source":secondary ||
  general-purpose:"Tertiary data source":tertiary
] ->
general-purpose:"Merge available data from: {primary} {secondary} {tertiary}" ->
(if "sufficient data")~> process ->
(if "insufficient data")~> @data-collection-failed
```

### Retry Failed Branches

```flow
@parallel-attempt ->
[
  general-purpose:"Flaky test suite" ||
  general-purpose:"External API call" ||
  general-purpose:"Network-dependent operation"
] (all success)~> continue ->
(if failed)~> general-purpose:"Wait 30 seconds" -> @parallel-attempt
```

---

## Best Practices

### When to Use Parallel Execution

**✓ Use parallel when:**
- Tasks are truly independent
- No shared state or file modifications
- Tasks can execute in any order
- Read-only operations on same data
- Speed improvement is valuable

**Examples:**
- Running different test suites
- Scanning different directories
- Validating different aspects
- Gathering data from multiple sources
- Multi-platform builds or tests

### When NOT to Use Parallel

**✗ Avoid parallel when:**
- Tasks have sequential dependencies
- Tasks modify shared state
- One task needs results from another
- Tasks write to same files
- Order of execution matters

**Use sequential instead:**
```flow
# Bad (parallel with dependencies)
[create-user || assign-permissions]

# Good (sequential)
create-user -> assign-permissions
```

### Optimal Number of Parallel Branches

**Recommended:** 3-5 parallel branches per subgraph

**✓ Good - Manageable parallelism:**
```flow
[test || lint || security || docs]
```

**✗ Problematic - Too many branches:**
```flow
[task1 || task2 || task3 || task4 || task5 || task6 || task7 || task8 || task9 || task10]
```

**Why limit branches:**
- Easier to track and debug
- Clearer visualization
- Better resource management
- More readable workflows

**For many tasks, nest parallel groups:**
```flow
[
  [frontend-test || backend-test] ||
  [api-test || integration-test] ||
  [security-scan || performance-test]
] -> consolidate-results
```

### Design for Independence

Structure tasks to be truly independent:

**✓ Good design:**
```flow
# Parallel data collection
[
  Explore:"Scan authentication code":auth_findings ||
  Explore:"Scan database code":db_findings ||
  Explore:"Scan API code":api_findings
] ->
# Sequential synthesis
general-purpose:"Analyze {auth_findings}, {db_findings}, {api_findings}"
```

### Use Descriptive Variable Names

Clear variable names help track parallel results:

**✓ Clear:**
```flow
[
  scan:"Frontend security":frontend_security ||
  scan:"Backend security":backend_security ||
  scan:"API security":api_security
]
```

**✗ Unclear:**
```flow
[
  scan:"Frontend security":s1 ||
  scan:"Backend security":s2 ||
  scan:"API security":s3
]
```

### Add Checkpoints After Parallel

Review parallel results before proceeding:

```flow
[
  implement:"Feature A":feature_a ||
  implement:"Feature B":feature_b ||
  implement:"Feature C":feature_c
] ->
@review-implementations ->
general-purpose:"Integration test all features"
```

---

## Performance Considerations

### Actual Parallelism vs Sequential with Merge

**How it works:**
- Parallel branches execute simultaneously via separate agent invocations
- Each branch runs in its own context
- After all complete, results merge into shared context
- Next step has access to all parallel outputs

**Time savings example:**

Sequential:
```flow
task1 (5 min) -> task2 (5 min) -> task3 (5 min)  # Total: 15 minutes
```

Parallel:
```flow
[task1 (5 min) || task2 (5 min) || task3 (5 min)]  # Total: ~5 minutes
```

### Token Usage in Parallel Execution

**Context passing:**
- Each parallel branch receives the same input context
- Each branch consumes tokens independently
- Results combine for next step's context

**Token efficiency:**
```flow
# Less efficient - sequential context growth
step1:output1 ->
step2:"Process {output1}":output2 ->
step3:"Process {output1} {output2}":output3
# Context grows: output1 → output1+output2 → output1+output2+output3

# More efficient - parallel then merge
[
  step1:output1 ||
  step2:output2 ||
  step3:output3
] ->
merge:"Process {output1}, {output2}, {output3}"
# Each branch independent, merge once at end
```

### Optimization Tips

**Group related parallel tasks:**
```flow
# Optimization: group by stage
build ->
[unit-test || lint || type-check] ->
[integration-test || e2e-test] ->
deploy
```

**Balance parallel branch complexity:**
- Avoid one very slow branch with many fast branches
- Try to keep parallel tasks similar in duration
- Consider splitting slow tasks into parallel sub-tasks

**Use parallel for I/O-bound tasks:**
- File scanning across directories
- External API calls
- Database queries
- Test execution

---

## Complete Examples

### Example 1: Comprehensive Code Review

```flow
# Multi-aspect code review with parallel analysis
Explore:"Identify all modified files in last commit":changed_files ->

[
  code-reviewer:"Security review of {changed_files}":security_review ||
  code-reviewer:"Performance analysis of {changed_files}":performance_review ||
  code-reviewer:"Code style check of {changed_files}":style_review ||
  general-purpose:"Check test coverage for {changed_files}":coverage_review
] ->

@review-all-findings ->

general-purpose:"Consolidate findings: {security_review}, {performance_review}, {style_review}, {coverage_review}":consolidated_report (if "critical issues")~>
  @block-merge ->
  general-purpose:"Create fix plan for critical issues" ->
(if "no critical issues")~>
  general-purpose:"Create optional improvement suggestions"
```

### Example 2: Multi-Environment Deployment

```flow
# Build once, deploy to multiple environments in parallel
implementation-architect:"Plan deployment strategy":deploy_plan ->
expert-code-implementer:"Build production artifacts":artifacts ->
general-purpose:"Run pre-deployment validation on {artifacts}" (if passed)~>

[
  general-purpose:"Deploy {artifacts} to staging":staging_result ||
  general-purpose:"Deploy {artifacts} to qa":qa_result ||
  general-purpose:"Deploy {artifacts} to demo":demo_result
] (all success)~>

[
  general-purpose:"Run smoke tests on staging" ||
  general-purpose:"Run smoke tests on qa" ||
  general-purpose:"Run smoke tests on demo"
] (all success)~>

@approve-production-deployment ->
general-purpose:"Deploy {artifacts} to production"
```

### Example 3: Parallel Bug Investigation

```flow
# Investigate bug from multiple angles simultaneously
general-purpose:"Reproduce the reported bug":reproduction_steps ->

[
  Explore:"Search codebase for error message and related code":code_investigation ||
  general-purpose:"Analyze error logs and stack traces":log_analysis ||
  general-purpose:"Check configuration files and environment":env_investigation ||
  Explore:"Review git history for recent changes to affected areas":git_investigation
] ->

general-purpose:"Synthesize findings from {code_investigation}, {log_analysis}, {env_investigation}, {git_investigation} to identify root cause":root_cause ->

@review-root-cause ->

[
  expert-code-implementer:"Write regression test for bug":regression_test ||
  expert-code-implementer:"Implement fix based on {root_cause}":bug_fix
] ->

general-purpose:"Verify {regression_test} fails with current code, passes with {bug_fix}" (if passed)~>
  @approve-fix ->
  general-purpose:"Commit fix and test together"
```

### Example 4: Parallel Feature Implementation

```flow
# Implement multiple independent features in parallel
implementation-architect:"Break down feature request into independent modules":architecture ->

[
  expert-code-implementer:"Implement user authentication module":auth_impl ||
  expert-code-implementer:"Implement data validation module":validation_impl ||
  expert-code-implementer:"Implement logging module":logging_impl
] ->

[
  general-purpose:"Write tests for authentication: {auth_impl}":auth_tests ||
  general-purpose:"Write tests for validation: {validation_impl}":validation_tests ||
  general-purpose:"Write tests for logging: {logging_impl}":logging_tests
] ->

general-purpose:"Run all tests: {auth_tests}, {validation_tests}, {logging_tests}" (all success)~>
  general-purpose:"Integration test all modules together" (if passed)~>
    @final-review ->
    general-purpose:"Create commit with all modules and tests"
```

### Example 5: Comprehensive Security Audit

```flow
# Multi-layered security audit with parallel scans
[
  Explore:"Scan for authentication vulnerabilities":auth_vulns ||
  Explore:"Scan for SQL injection risks":sql_risks ||
  Explore:"Scan for XSS vulnerabilities":xss_vulns ||
  Explore:"Check for exposed secrets and API keys":exposed_secrets ||
  general-purpose:"Analyze dependency vulnerabilities":dep_vulns
] ->

general-purpose:"Consolidate security findings: {auth_vulns}, {sql_risks}, {xss_vulns}, {exposed_secrets}, {dep_vulns}":security_report ->

(if "critical vulnerabilities")~>
  @security-emergency ->
  [
    expert-code-implementer:"Fix critical authentication issues from {security_report}" ||
    expert-code-implementer:"Fix critical SQL injection issues from {security_report}" ||
    expert-code-implementer:"Remove exposed secrets from {security_report}"
  ] (all success)~>
    general-purpose:"Re-run security audit to verify fixes" ->

(if "no critical vulnerabilities")~>
  general-purpose:"Create security improvement backlog from {security_report}"
```

### Example 6: Data Migration with Validation

```flow
# Migrate data with parallel validation checks
general-purpose:"Backup current production data":backup_created ->

general-purpose:"Run data migration script":migration_complete ->

[
  general-purpose:"Validate record counts match":count_validation ||
  general-purpose:"Validate data integrity with checksums":integrity_validation ||
  general-purpose:"Validate foreign key relationships":relationship_validation ||
  general-purpose:"Validate business rules on sample data":business_validation ||
  general-purpose:"Run performance tests on new schema":performance_validation
] (all success)~>
  @approve-migration ->
  general-purpose:"Commit migration and remove backup" ->

(if failed)~>
  @migration-failed ->
  general-purpose:"Rollback to {backup_created}" ->
  general-purpose:"Analyze validation failures for migration fix"
```

### Example 7: TDD with Parallel Test Categories

```flow
# Test-driven development with parallel test execution
implementation-architect:"Analyze feature requirements":requirements ->

[
  expert-code-implementer:"Write unit tests for {requirements}":unit_tests ||
  expert-code-implementer:"Write integration tests for {requirements}":integration_tests ||
  expert-code-implementer:"Write e2e tests for {requirements}":e2e_tests
] ->

general-purpose:"Verify all tests fail (RED phase)" (if failed)~>

  expert-code-implementer:"Implement minimal code to pass tests":implementation ->

  [
    general-purpose:"Run unit tests":unit_results ||
    general-purpose:"Run integration tests":integration_results ||
    general-purpose:"Run e2e tests":e2e_results
  ] (all success)~>
    @review-green-phase ->

    [
      code-reviewer:"Refactor {implementation} for better design" ||
      expert-code-implementer:"Add comprehensive documentation for {implementation}"
    ] ->

    general-purpose:"Run all tests again to ensure refactoring didn't break anything" (if passed)~>
      general-purpose:"Commit implementation and tests together"
```

### Example 8: Multi-Source Data Aggregation

```flow
# Collect and merge data from multiple sources
[
  general-purpose:"Fetch data from primary API":primary_data ||
  general-purpose:"Fetch data from secondary API":secondary_data ||
  general-purpose:"Read data from local cache":cached_data ||
  general-purpose:"Query database for historical data":historical_data
] (any success)~>

general-purpose:"Merge and deduplicate: {primary_data}, {secondary_data}, {cached_data}, {historical_data}":merged_data ->

[
  general-purpose:"Validate data schema for {merged_data}":schema_valid ||
  general-purpose:"Check data completeness of {merged_data}":completeness_valid ||
  general-purpose:"Verify data freshness of {merged_data}":freshness_valid
] (all success)~>

general-purpose:"Process and store {merged_data}" ->

@data-processing-complete
```

### Example 9: Parallel Refactoring with Safety Checks

```flow
# Refactor multiple modules with continuous validation
Explore:"Identify modules needing refactoring":modules_to_refactor ->

@approve-refactoring-plan ->

[
  expert-code-implementer:"Refactor authentication module":auth_refactored ||
  expert-code-implementer:"Refactor data access module":data_refactored ||
  expert-code-implementer:"Refactor business logic module":logic_refactored
] ->

# Parallel testing of refactored modules
[
  general-purpose:"Test {auth_refactored} module" ||
  general-purpose:"Test {data_refactored} module" ||
  general-purpose:"Test {logic_refactored} module"
] (all success)~>

# Integration testing
general-purpose:"Run full integration test suite" (if passed)~>

# Parallel quality checks
[
  code-reviewer:"Review code quality of refactored modules" ||
  general-purpose:"Check performance metrics vs baseline" ||
  general-purpose:"Verify no security regressions"
] (all success)~>

@approve-refactoring-completion ->
general-purpose:"Commit all refactored modules"
```

### Example 10: Comprehensive Project Health Check

```flow
# Complete project audit with parallel analysis
[
  Explore:"Analyze code quality metrics":code_quality ||
  Explore:"Check test coverage and test health":test_health ||
  general-purpose:"Audit dependencies for updates and vulnerabilities":dependency_audit ||
  general-purpose:"Review documentation completeness":docs_review ||
  general-purpose:"Analyze git commit patterns and velocity":git_metrics ||
  general-purpose:"Check CI/CD pipeline health":pipeline_health
] ->

general-purpose:"Generate comprehensive health report: {code_quality}, {test_health}, {dependency_audit}, {docs_review}, {git_metrics}, {pipeline_health}":health_report ->

@review-health-report ->

(if "critical issues")~>
  implementation-architect:"Create improvement roadmap for critical issues from {health_report}":improvement_plan ->
  @prioritize-improvements ->

(if "no critical issues")~>
  general-purpose:"Document project health status and optional improvements"
```

---

## Summary

Parallel execution with `||` is powerful for independent tasks:

**Key Takeaways:**
1. Use `[task1 || task2 || task3]` with square brackets
2. Capture individual outputs with `:variable` syntax
3. Apply conditions with `(all success)~>` or `(any success)~>`
4. Ensure tasks are truly independent (no shared state)
5. Optimize with 3-5 parallel branches per group
6. Add checkpoints after parallel sections for review
7. Handle errors gracefully with conditional routing

**When in doubt:** Start with sequential execution, convert to parallel when independence is verified.

---

## Related Documentation

- [Syntax Reference](syntax-reference.md) - Complete syntax guide
- [Variables Guide](variables.md) - Variable capture and interpolation
- [Conditional Execution](conditional.md) - Conditional flow patterns
- [Checkpoints Guide](checkpoints.md) - Review and steering points
- [Error Handling](error-handling.md) - Error recovery strategies
