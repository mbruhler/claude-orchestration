# Checkpoints Guide

Manual approval gates that pause workflow execution for user review and decision-making.

## What Are Checkpoints

Checkpoints are explicit pause points in workflows where execution stops and waits for user approval before continuing. They serve as safety gates for critical operations, review points for quality assurance, and decision points for workflow branching.

**Use Cases**:
- Review generated code before committing
- Approve deployments before execution
- Verify test results before proceeding
- Make decisions at workflow branching points
- Confirm destructive operations
- Validate AI-generated content

## Basic Checkpoint Syntax

### Simple Checkpoint
```
@checkpoint-name
```
Uses the checkpoint name as the prompt text.

### Checkpoint with Custom Prompt
```
@checkpoint-name:"Custom prompt text for user"
```
Displays custom message to provide context about what's being reviewed.

### Positioning in Workflows

Checkpoints appear between workflow steps:

```
agent1~> "First task"
@review-output:"Review agent1 results before proceeding"
agent2~> "Second task based on agent1"
@approval:"Approve final changes"
(commit)~> "git commit"
```

## Checkpoint Behavior

### When Checkpoint is Reached

1. **Workflow Pauses**: Execution stops at the checkpoint
2. **Prompt Displayed**: User sees the checkpoint message
3. **Options Presented**: User chooses how to proceed

### User Options

- **Continue**: Proceed to next step (default action)
- **Retry**: Re-run the previous step before checkpoint
- **Modify**: Make changes to workflow or context
- **Abort**: Stop workflow execution entirely

### After User Choice

- **Continue**: Next step executes immediately
- **Retry**: Previous step re-executes, then returns to checkpoint
- **Modify**: Workflow pauses for user input, then resumes
- **Abort**: Workflow terminates with current state preserved

## Common Checkpoint Types

### Review Checkpoints

For examining outputs before proceeding:

```
@review:"Review generated code"
@review-code:"Check code quality and correctness"
@review-tests:"Verify test coverage and results"
@review-docs:"Review documentation for accuracy"
@review-changes:"Examine all changes before commit"
```

### Approval Gates

For authorizing critical operations:

```
@approval:"Approve proceeding to next phase"
@security-approval:"Security team approval required"
@deploy-approval:"Authorize production deployment"
@merge-approval:"Approve merging to main branch"
@budget-approval:"Confirm resource allocation"
```

### Decision Points

For workflow branching decisions:

```
@decide:"Choose which path to take"
@choose-path:"Select implementation approach"
@select-strategy:"Pick optimization strategy"
@confirm-direction:"Verify architectural direction"
```

### Verification Checkpoints

For confirming states or conditions:

```
@verify:"Verify system state before proceeding"
@confirm:"Confirm operation parameters"
@validate:"Validate input data"
@check-prerequisites:"Ensure requirements are met"
```

## Checkpoint Patterns

### Pre-Deployment Gates

Multi-stage approval before production:

```
agent1~> "Run test suite"
@review-tests:"Review test results - all passing?"

agent2~> "Build production artifacts"
@verify-build:"Verify build succeeded and artifacts are valid"

agent3~> "Deploy to staging"
@staging-approval:"Test in staging - approve prod deploy?"

(deploy-prod)~> "Deploy to production"
```

### Post-Test Reviews

Review before committing changes:

```
agent1~> "Implement feature"
agent2~> "Write tests"
agent3~> "Run test suite"

@review-implementation:"Review code and test results"

(if approved)~> agent4~> "Update docs"
@final-review:"Final review before commit"

(commit)~> "git commit and push"
```

### Multi-Stage Approvals

Complex workflows with multiple approval points:

```
agent1~> "Design system architecture"
@architecture-approval:"Approve architecture design"

agent2~> "Implement core components"
@code-review:"Review core implementation"

agent3~> "Add security features"
@security-approval:"Security team review"

agent4~> "Performance optimization"
@performance-approval:"Approve performance changes"

(deploy)~> "Deploy to production"
```

### Conditional Checkpoints

Checkpoints that only trigger under certain conditions:

```
agent1~> "Analyze code changes"

(if critical-path-changed)~> @security-review:"Critical code changed - security review"
(if performance-impact)~> @performance-review:"Performance impact detected"
(if breaking-change)~> @api-review:"Breaking API change - stakeholder approval"

agent2~> "Finalize changes"
```

## Best Practices

### When to Add Checkpoints

**Always add checkpoints before**:
- Irreversible operations (deployments, deletions, database migrations)
- Production changes
- Git commits and pushes
- Security-related modifications
- API changes that affect external users
- Resource allocation or budget changes

**Consider checkpoints for**:
- Complex refactoring operations
- AI-generated code that needs human review
- Test results that may need interpretation
- Documentation that represents the system
- Configuration changes to critical systems

### Naming Conventions

**Good checkpoint names** (descriptive, purpose-based):
```
@review-security-changes
@approve-database-migration
@verify-backup-complete
@confirm-deletion
@review-api-contract
```

**Poor checkpoint names** (vague, generic):
```
@check
@wait
@pause
@here
@stop
```

### Checkpoint Frequency

**Too Many Checkpoints**:
```
agent1~> "Step 1"
@checkpoint1
agent2~> "Step 2"
@checkpoint2
agent3~> "Step 3"
@checkpoint3
```
Result: User fatigue, decreased attention to each checkpoint

**Too Few Checkpoints**:
```
agent1~> "Design, implement, test, and deploy"
@final-check
(deploy-prod)
```
Result: No opportunity to catch issues early

**Well-Balanced**:
```
agent1~> "Design and implement feature"
agent2~> "Write and run tests"
@review-implementation:"Review code and tests"

agent3~> "Build and deploy to staging"
@staging-verification:"Test in staging environment"

(deploy-prod)~> "Deploy to production"
```
Result: Strategic checkpoints at natural workflow boundaries

### Custom Prompts for Clarity

**Provide context about what to review**:
```
@review:"Review the following before proceeding:
- Code follows style guidelines
- Tests cover edge cases
- Documentation is updated
- No security vulnerabilities introduced"
```

**Explain consequences of approval**:
```
@deploy-approval:"Approving will:
1. Deploy to production
2. Notify users of new features
3. Archive previous version
Proceed?"
```

**Guide decision-making**:
```
@choose-implementation:"Select approach:
Option A: Fast but higher memory usage
Option B: Slower but more memory efficient
Option C: Balanced approach (recommended)"
```

## Examples

### Example 1: Feature Development with Reviews

```
workflow: feature-with-reviews

agent1~> "Implement user authentication feature"
agent2~> "Write unit and integration tests"
agent3~> "Run complete test suite"

@review-code:"Review implementation and test results:
- Authentication logic secure?
- Tests comprehensive?
- Edge cases covered?"

agent4~> "Update API documentation"
agent5~> "Add user guide examples"

@review-docs:"Review documentation for accuracy"

(commit)~> "git add . && git commit -m 'Add user auth'"
```

### Example 2: Database Migration

```
workflow: safe-db-migration

agent1~> "Design database schema changes"
@schema-review:"Review schema changes for:
- Data integrity
- Performance impact
- Backward compatibility"

agent2~> "Create migration scripts with rollback"
agent3~> "Test migration on staging data"

@migration-test-review:"Verify migration test results:
- All data migrated correctly?
- Performance acceptable?
- Rollback tested?"

agent4~> "Backup production database"
@backup-verify:"Confirm backup completed successfully"

agent5~> "Run migration on production"
@migration-complete:"Verify production migration - check logs"

(notify)~> "Send completion notification"
```

### Example 3: Multi-Environment Deployment

```
workflow: progressive-deployment

agent1~> "Build and test application"
@build-review:"Review build artifacts and test results"

agent2~> "Deploy to dev environment"
agent3~> "Run smoke tests in dev"

agent4~> "Deploy to staging"
@staging-approval:"Test in staging - approve production deploy?"

agent5~> "Deploy to production (canary 10%)"
@canary-check:"Monitor canary metrics - proceed to full deploy?"

agent6~> "Deploy to production (full 100%)"
@final-verification:"Verify production deployment successful"
```

### Example 4: Security-Focused Workflow

```
workflow: security-hardening

agent1~> "Scan codebase for vulnerabilities"
agent2~> "Analyze dependency security"

@security-findings:"Review security scan results:
- Critical vulnerabilities found?
- Remediation plan clear?
- Continue with fixes?"

agent3~> "Apply security patches"
agent4~> "Update dependencies to secure versions"

@verify-fixes:"Verify all security issues resolved"

agent5~> "Run security regression tests"
@security-approval:"Security team final approval"

(commit)~> "git commit -m 'Security hardening'"
(deploy)~> "Deploy security updates"
```

### Example 5: Content Generation Pipeline

```
workflow: content-review-pipeline

agent1~> "Generate blog post content"
@content-review:"Review AI-generated content for:
- Accuracy and factual correctness
- Tone and brand alignment
- Technical accuracy"

agent2~> "Optimize for SEO"
agent3~> "Generate social media snippets"

@marketing-review:"Review SEO and social content"

agent4~> "Create images and graphics"
@visual-review:"Review visual assets"

agent5~> "Format and publish to CMS"
@final-preview:"Preview in staging - approve publish?"

(publish)~> "Publish to production"
```

### Example 6: Data Processing with Quality Gates

```
workflow: data-pipeline-with-checks

agent1~> "Extract data from sources"
agent2~> "Validate data quality"

@data-quality-check:"Review validation results:
- Completeness: {{ completeness_pct }}%
- Accuracy: {{ accuracy_score }}
- Anomalies: {{ anomaly_count }}
Proceed with transformation?"

agent3~> "Transform and normalize data"
agent4~> "Run data quality checks"

@transformation-review:"Verify transformation results"

agent5~> "Load to data warehouse"
@load-verification:"Confirm data loaded successfully:
- Row count matches source
- No duplicates
- Indexes created"

(notify)~> "Send pipeline completion report"
```

### Example 7: Infrastructure Changes

```
workflow: infrastructure-update

agent1~> "Plan infrastructure changes"
agent2~> "Generate Terraform/IaC scripts"

@plan-review:"Review infrastructure plan:
- Resource changes appropriate?
- Cost impact acceptable?
- Security implications clear?"

agent3~> "Apply changes to dev environment"
@dev-verification:"Verify dev environment working correctly"

agent4~> "Apply changes to staging"
@staging-verification:"Test in staging - ready for production?"

agent5~> "Create backup of current production state"
@backup-confirm:"Backup complete - proceed with prod changes?"

agent6~> "Apply changes to production"
@production-verification:"Verify production infrastructure health"

(document)~> "Update infrastructure documentation"
```

## Tips

### Checkpoint Limitations

- **Only work in normal mode**: Checkpoints are ignored in auto-mode execution
- **Cannot modify workflow structure**: User can modify context/files but not workflow definition
- **No timeout**: Workflows wait indefinitely at checkpoints until user responds

### Effective Checkpoint Usage

- **Use before deployments**: Always checkpoint before production changes
- **Add before commits**: Review code before committing to version control
- **Gate destructive operations**: Checkpoint before deletes, drops, or irreversible changes
- **Review AI outputs**: Checkpoint after AI-generated code or content
- **Strategic placement**: Place at natural workflow boundaries (after logical phases)
- **Informative prompts**: Always use custom prompts to explain what's being reviewed

### Combining with Conditions

Checkpoints work well with conditional execution:

```
(if high-risk)~> @security-review:"High-risk changes detected"
(if tests-failed)~> @failure-analysis:"Tests failed - review and decide"
(if breaking-change)~> @stakeholder-approval:"Breaking change requires approval"
```

### Emergency Abort

At any checkpoint, users can abort the workflow if:
- Issues discovered that require significant rework
- Requirements changed mid-execution
- External dependencies unavailable
- Critical errors detected

Aborting preserves current state, allowing resume or restart later.

---

**Key Takeaway**: Checkpoints transform automated workflows into collaborative processes, combining AI efficiency with human judgment at critical decision points.
