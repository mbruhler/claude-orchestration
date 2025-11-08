# Common Workflow Patterns

This document catalogs proven workflow patterns for common scenarios. Use these as starting points for your workflows.

## Sequential Patterns

### Basic Sequential Flow

**When to use**: Steps must happen in order, each depends on previous.

```flow
step1:"First task" ->
step2:"Second task" ->
step3:"Third task"
```

**Example - Feature Implementation**:
```flow
implementation-architect:"Plan feature":plan ->
expert-code-implementer:"Implement {plan}":code ->
general-purpose:"Run tests":results ->
code-reviewer:"Review {code} and {results}"
```

### Sequential with Error Handling

**When to use**: Each step must succeed or workflow should stop.

```flow
step1:"Try operation" ->
(if failed)~> rollback:"Undo changes" ~>
(if passed)~> step2:"Continue"
```

**Example - Deployment with Rollback**:
```flow
general-purpose:"Deploy new version":deployment ->
general-purpose:"Run smoke tests":tests ->
(if tests.failed)~> general-purpose:"Rollback to previous version" ~>
(if tests.passed)~> general-purpose:"Update monitoring dashboards"
```

### Sequential with Retry

**When to use**: Operations might fail temporarily but should retry.

```flow
@attempt ->
operation:"Try task" ->
(if failed)~> wait:"Wait 5 seconds" -> @attempt ~>
(if passed)~> next:"Continue"
```

**Example - API Call with Retry**:
```flow
@try-api ->
general-purpose:"Call external API":response ->
(if response.timeout)~> general-purpose:"Wait 10 seconds" -> @try-api ~>
(if response.success)~> general-purpose:"Process {response}"
```

## Parallel Patterns

### Basic Parallel Execution

**When to use**: Multiple independent tasks can run simultaneously.

```flow
[task1 || task2 || task3] ->
consolidate:"Merge results"
```

**Example - Multi-Source Analysis**:
```flow
[
  Explore:"Analyze code structure":structure ||
  general-purpose:"Check git history":history ||
  general-purpose:"Review documentation":docs
] ->
general-purpose:"Consolidate findings into comprehensive report"
```

### Parallel with Individual Error Handling

**When to use**: Some parallel tasks can fail without stopping others.

```flow
[
  task1:"First (continue on error)" ||
  task2:"Second (continue on error)" ||
  task3:"Third (continue on error)"
] ->
general-purpose:"Process successful results, skip failed"
```

**Example - Multi-Platform Testing**:
```flow
[
  general-purpose:"Run tests on Linux (continue on fail)":linux_results ||
  general-purpose:"Run tests on macOS (continue on fail)":mac_results ||
  general-purpose:"Run tests on Windows (continue on fail)":win_results
] ->
general-purpose:"Generate cross-platform test report from {linux_results}, {mac_results}, {win_results}"
```

### Parallel with Race Condition

**When to use**: Multiple approaches, use first one that succeeds.

```flow
[approach1 || approach2 || approach3] ->
general-purpose:"Use first successful result"
```

**Example - Data Fetching Fallbacks**:
```flow
[
  general-purpose:"Try primary API":primary ||
  general-purpose:"Try backup API":backup ||
  general-purpose:"Try cache":cached
] ->
general-purpose:"Use first available data source"
```

## Conditional Patterns

### If-Then-Else

**When to use**: Different paths based on condition.

```flow
check:"Evaluate condition":result ->
(if result.true)~> path-a:"Do this" ~>
(if result.false)~> path-b:"Do that"
```

**Example - Security Check**:
```flow
$security-scanner:"Scan for vulnerabilities":findings ->
(if findings.critical)~> @emergency-review:"Critical issues found! Manual review required" ->
                         general-purpose:"Stop deployment" ~>
(if findings.clean)~> general-purpose:"Proceed with deployment"
```

### Switch/Case Pattern

**When to use**: Multiple mutually exclusive paths.

```flow
classify:"Determine type":type ->
(if type.A)~> handle-a:"Process type A" ~>
(if type.B)~> handle-b:"Process type B" ~>
(if type.C)~> handle-c:"Process type C"
```

**Example - Issue Triage**:
```flow
Explore:"Analyze issue type":issue_type ->
(if issue_type.bug)~> $bug-fixer:"Fix bug systematically" ~>
(if issue_type.feature)~> implementation-architect:"Plan feature implementation" ~>
(if issue_type.docs)~> expert-code-implementer:"Update documentation" ~>
(if issue_type.refactor)~> code-optimizer:"Optimize code"
```

## Review & Approval Patterns

### Manual Checkpoint

**When to use**: Human decision needed before proceeding.

```flow
prepare:"Do work" ->
@review-checkpoint:"Review and approve" ->
continue:"Proceed after approval"
```

**Example - PR Creation**:
```flow
expert-code-implementer:"Implement changes":code ->
general-purpose:"Run tests":tests ->
@review-changes:"Review {code} and {tests}. Approve to create PR?" ->
general-purpose:"Create pull request with summary"
```

### Multi-Stage Review

**When to use**: Multiple approval stages required.

```flow
work:"Complete work" ->
@technical-review:"Technical approval" ->
@security-review:"Security approval" ->
@business-review:"Business approval" ->
deploy:"Deploy"
```

**Example - Production Deployment**:
```flow
general-purpose:"Build production artifacts":build ->
[general-purpose:"Run integration tests":tests || $security-scanner:"Security scan":scan] ->
@tech-review:"Review {build}, {tests}, {scan}. Technical approval?" ->
@product-review:"Product approval for release?" ->
general-purpose:"Deploy to production"
```

## Test-Driven Development Pattern

**When to use**: Implementing new features with TDD methodology.

```flow
# RED
write-test:"Write failing test":test ->
verify-fails:"Run test, verify it fails":status ->

# GREEN
implement:"Write minimal code":code ->
verify-passes:"Run test, verify it passes":status ->

# REFACTOR
refactor:"Improve code quality":improved ->
verify-still-passes:"Ensure tests still pass"
```

**Complete TDD Example**:
```flow
implementation-architect:"Analyze requirements and plan testable units":spec ->

expert-code-implementer:"Write comprehensive test suite (must fail)":tests ->
general-purpose:"Run tests, verify they fail as expected":test_status ->

@review-test-coverage ->

expert-code-implementer:"Write minimal code to pass tests":implementation ->
general-purpose:"Run tests, verify they now pass":validation ->

@review-implementation ->

[
  code-optimizer:"Refactor for quality":refactored ||
  expert-code-implementer:"Add documentation":docs
] ->

general-purpose:"Final test run, ensure nothing broke":final_validation ->
general-purpose:"Commit changes with both tests and implementation"
```

## Investigation & Debugging Pattern

**When to use**: Diagnosing and fixing issues systematically.

```flow
# Reproduce
reproduce:"Document issue" ->

# Investigate (parallel)
[investigate-code || analyze-logs || check-environment] ->

# Diagnose
diagnose:"Identify root cause" ->
@review-root-cause ->

# Fix
write-regression-test:"Test that reproduces bug" ->
implement-fix:"Apply fix" ->

# Verify (parallel)
[test-regression || test-suite || manual-test] ->

# Complete
@review-fix ->
document:"Update docs and commit"
```

**Complete Debug Example**:
```flow
general-purpose:"Reproduce issue, capture error details":issue_details ->

[
  Explore:"Search for error in codebase":code_analysis ||
  general-purpose:"Analyze logs and stack traces":log_analysis ||
  general-purpose:"Check configs and environment":env_analysis
] ->

general-purpose:"Synthesize findings, identify root cause":root_cause ->

@review-root-cause ->

expert-code-implementer:"Write regression test (should fail)":regression_test ->
expert-code-implementer:"Implement targeted fix":fix ->

[
  general-purpose:"Run regression test (should pass)":regression_passed ||
  general-purpose:"Run full test suite (all should pass)":suite_passed ||
  general-purpose:"Manual verification of fix":manual_verified
] ->

@review-fix ->

expert-code-implementer:"Update docs, add fix notes":docs_updated ->
general-purpose:"Commit fix and test with descriptive message"
```

## Data Processing Pattern

**When to use**: Multi-stage data transformation.

```flow
fetch:"Get data" ->
validate:"Check data quality" ->
transform:"Process data" ->
analyze:"Extract insights" ->
report:"Generate report"
```

**Example - News Aggregation**:
```flow
[
  $rss-fetcher:"Fetch from RSS feeds":rss_articles ||
  $web-scraper:"Scrape news sites":scraped_articles
] ->

general-purpose:"Merge and deduplicate {rss_articles} and {scraped_articles}":all_articles ->

$news-deduplicator:"Remove duplicate articles from {all_articles}":unique_articles ->

$topic-clusterer:"Group {unique_articles} by topic":clustered ->

$graph-builder:"Create visualization of {clustered}":graph ->

general-purpose:"Generate summary report with {graph}"
```

## Composite Patterns

### Sequential with Parallel Sections

**When to use**: Some stages must be sequential, but within stages tasks can be parallel.

```flow
setup:"Initial setup" ->

[parallel-work-1 || parallel-work-2 || parallel-work-3] ->

integration:"Integrate results" ->

[parallel-validation-1 || parallel-validation-2] ->

finalize:"Complete"
```

**Example - Full CI/CD Pipeline**:
```flow
general-purpose:"Checkout code and install dependencies":setup ->

[
  general-purpose:"Run linter":lint_results ||
  general-purpose:"Run type checker":type_results ||
  general-purpose:"Run unit tests":unit_results
] ->

general-purpose:"Build application if all checks pass":build ->

[
  general-purpose:"Run integration tests":integration_results ||
  $security-scanner:"Security audit":security_results ||
  general-purpose:"Performance benchmarks":perf_results
] ->

@deployment-approval:"Review all results. Approve deployment?" ->

general-purpose:"Deploy to staging":staging ->
general-purpose:"Run smoke tests on staging":smoke_results ->

@production-approval:"Approve production deployment?" ->

general-purpose:"Deploy to production"
```

### Conditional Parallel Execution

**When to use**: Parallel execution depends on condition.

```flow
check:"Evaluate" ->
(if condition)~> [parallel-a || parallel-b] -> merge ~>
(if !condition)~> sequential:"Do this"
```

**Example - Adaptive Testing**:
```flow
Explore:"Analyze changes":changes ->

(if changes.affects_api)~> [
  general-purpose:"Run API tests":api_tests ||
  general-purpose:"Run integration tests":integration_tests ||
  general-purpose:"Update API docs":api_docs
] -> general-purpose:"Consolidate API test results" ~>

(if changes.affects_ui)~> [
  general-purpose:"Run UI tests":ui_tests ||
  general-purpose:"Visual regression tests":visual_tests ||
  general-purpose:"Accessibility tests":a11y_tests
] -> general-purpose:"Consolidate UI test results" ~>

(if changes.affects_database)~> general-purpose:"Run database migration tests":db_tests ->

general-purpose:"Create comprehensive test report"
```

## Anti-Patterns to Avoid

### ❌ Too Linear When Parallelization Possible

**Don't do this**:
```flow
task1 -> task2 -> task3 -> task4
# When task1-4 are independent
```

**Do this instead**:
```flow
[task1 || task2 || task3 || task4] ->
consolidate:"Merge results"
```

### ❌ No Error Handling

**Don't do this**:
```flow
deploy:"Deploy" -> test:"Test"
# What if deployment fails?
```

**Do this instead**:
```flow
deploy:"Deploy":result ->
(if result.failed)~> rollback:"Rollback" ~>
(if result.success)~> test:"Test"
```

### ❌ Missing Review Checkpoints

**Don't do this**:
```flow
implement -> deploy
# No human verification
```

**Do this instead**:
```flow
implement ->
@review:"Review changes" ->
deploy
```

### ❌ Overly Complex Single-Step

**Don't do this**:
```flow
general-purpose:"Analyze code, find bugs, fix them, test fixes, deploy"
# Too much in one step
```

**Do this instead**:
```flow
Explore:"Analyze code":bugs ->
implement:"Fix {bugs}":fixes ->
general-purpose:"Test {fixes}":results ->
(if results.passed)~> deploy:"Deploy"
```

## Pattern Selection Guide

| Goal | Pattern | Example |
|------|---------|---------|
| Steps depend on each other | Sequential | plan → implement → test |
| Independent tasks | Parallel | [test-linux \|\| test-mac \|\| test-win] |
| Need human decision | Checkpoint | work → @review → continue |
| Handle failures | Conditional | try → (if failed)~> retry |
| Prevent bugs | TDD | write-test → implement → refactor |
| Fix issues | Debug | reproduce → investigate → fix → verify |
| Quality assurance | Multi-stage review | work → @tech-review → @security-review |
| Data pipeline | Sequential transform | fetch → validate → transform → analyze |
| Fast feedback | Parallel validation | [lint \|\| test \|\| type-check] |
| Adaptive behavior | Conditional parallel | if(api-change)~> [api-tests \|\| docs] |

## Combining Patterns

You can nest and combine patterns:

```flow
# TDD + Parallel Testing + Review
write-test ->
implement ->
[unit-tests || integration-tests || e2e-tests] ->
@review ->
refactor ->
[unit-tests || integration-tests] ->
commit
```

```flow
# Investigation + Conditional + Parallel
reproduce ->
[investigate-code || analyze-logs] ->
diagnose ->
(if simple-fix)~> quick-fix ->
(if complex-fix)~> [plan || write-test || implement] -> verify
```

---

**Not finding the right pattern? Describe your use case and I'll help design a custom workflow!**
