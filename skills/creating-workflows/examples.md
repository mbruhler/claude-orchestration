# Workflow Examples

Real-world workflow examples to inspire your automation.

## Complete Examples

### 1. TDD Feature Implementation

**Use case**: Implement new feature using Test-Driven Development.

**Workflow**: [examples/tdd-implementation.flow](../../../examples/tdd-implementation.flow)

```flow
# RED phase
implementation-architect:"Analyze requirements, plan testable units":spec ->
expert-code-implementer:"Write comprehensive test suite (must fail)":tests ->
general-purpose:"Run tests, verify failures":test_status ->

@review-test-coverage ->

# GREEN phase
expert-code-implementer:"Write minimal code to pass tests":implementation ->
general-purpose:"Run tests, verify passes":validation ->

@review-implementation ->

# REFACTOR phase
[
  code-optimizer:"Refactor for quality":refactored ||
  expert-code-implementer:"Add documentation":docs
] ->

general-purpose:"Final test run":final_validation ->
general-purpose:"Commit changes"
```

**Key features**:
- RED-GREEN-REFACTOR cycle
- Manual review checkpoints
- Parallel refactoring and documentation
- Comprehensive test validation

### 2. Bug Investigation and Fix

**Use case**: Systematic debugging of reported issues.

**Workflow**: [examples/debug-and-fix.flow](../../../examples/debug-and-fix.flow)

```flow
general-purpose:"Reproduce issue, capture details":issue_details ->

# Parallel investigation
[
  Explore:"Search codebase for error":code_analysis ||
  general-purpose:"Analyze logs and traces":log_analysis ||
  general-purpose:"Check environment and configs":env_analysis
] ->

general-purpose:"Synthesize findings, identify root cause":root_cause ->

@review-root-cause ->

expert-code-implementer:"Write regression test":regression_test ->
expert-code-implementer:"Implement fix":fix ->

# Parallel validation
[
  general-purpose:"Run regression test":regression_passed ||
  general-purpose:"Run full test suite":suite_passed ||
  general-purpose:"Manual verification":manual_verified
] ->

@review-fix ->

expert-code-implementer:"Update docs, commit"
```

**Key features**:
- Parallel investigation paths
- Regression test creation
- Multi-level validation
- Documentation updates

### 3. Polish News Aggregation

**Use case**: Aggregate and analyze Polish news from multiple sources.

**Workflow**: [examples/polish-news-aggregation.flow](../../../examples/polish-news-aggregation.flow)

```flow
# Parallel data collection
[
  $rss-fetcher:"Fetch RSS from Polish news sources":rss ||
  $web-scraper:"Scrape fallback sites":scraped
] ->

general-purpose:"Merge results":all_articles ->
$news-deduplicator:"Remove duplicates":unique ->
$topic-clusterer:"Group by topic":clustered ->
$graph-builder:"Create visualization":graph
```

**Key features**:
- Multiple data sources
- Custom temp agents for specialized tasks
- Data deduplication
- Visualization generation

### 4. Security Audit Pipeline

**Use case**: Comprehensive security scanning before deployment.

```flow
[
  $security-scanner:"OWASP Top 10 scan":owasp ||
  general-purpose:"Dependency vulnerability check":deps ||
  $code-analyzer:"Static analysis":static
] ->

general-purpose:"Consolidate findings":report ->

@security-review:"Review {report}. Critical issues?" ->

(if critical_issues)~> @emergency-halt:"Stop deployment!" ~>
(if no_critical)~> general-purpose:"Generate audit report" ->
                   general-purpose:"Proceed with deployment"
```

**Key features**:
- Parallel security scans
- Consolidated reporting
- Manual security review gate
- Conditional deployment stop

### 5. CI/CD Pipeline

**Use case**: Full continuous integration and deployment.

```flow
general-purpose:"Checkout code, install deps":setup ->

# Parallel quality checks
[
  general-purpose:"Run linter":lint ||
  general-purpose:"Run type checker":types ||
  general-purpose:"Run unit tests":units
] ->

general-purpose:"Build application":build ->

# Parallel integration checks
[
  general-purpose:"Integration tests":integration ||
  $security-scanner:"Security scan":security ||
  general-purpose:"Performance benchmarks":perf
] ->

@deployment-approval:"Review results. Deploy?" ->

general-purpose:"Deploy to staging":staging ->
general-purpose:"Smoke tests on staging":smoke ->

@production-approval:"Deploy to production?" ->

general-purpose:"Deploy to production"
```

**Key features**:
- Multi-stage validation
- Parallel test execution
- Manual approval gates
- Staged deployment

## Quick Patterns

### Sequential Task Chain

```flow
step1:"First" -> step2:"Second" -> step3:"Third"
```

### Parallel with Merge

```flow
[task1 || task2 || task3] -> general-purpose:"Consolidate"
```

### Conditional Branching

```flow
check:"Evaluate" ->
(if condition)~> path-a:"Do this" ~>
(if !condition)~> path-b:"Do that"
```

### Retry Loop

```flow
@attempt ->
operation:"Try task" ->
(if failed)~> wait:"Wait" -> @attempt ~>
(if passed)~> next:"Continue"
```

### Review Checkpoint

```flow
work:"Do work" ->
@review:"Review and approve" ->
continue:"Proceed"
```

## More Examples

See the [examples/](../../../examples/) directory for:
- i18n-fix-hardcoded-strings.flow - Internationalization workflow
- ui-component-refinement.flow - UI component improvement
- plugin-testing.flow - Plugin testing workflow
- agent-system-demo.flow - Agent system demonstration

---

**Want to see how a specific pattern works? Ask me to explain any workflow!**
