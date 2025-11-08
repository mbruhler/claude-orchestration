# Temp Agents Guide

Temp agents are ephemeral, workflow-specific agents that I create automatically when you need specialized functionality.

## What Are Temp Agents?

**Temp agents** are custom agents created for specific workflows:
- Stored in `temp-agents/` directory
- Automatically cleaned up after workflow execution
- Can be promoted to permanent agents if useful
- Namespaced with `orchestration:` prefix

## When I Create Temp Agents

I create temp agents when your workflow needs:

1. **Domain-Specific Expertise**
   - Security scanning
   - Performance analysis
   - Data processing
   - Content generation

2. **Specific Output Formats**
   - Structured JSON reports
   - Formatted markdown
   - Standardized data schemas

3. **Tool-Specific Operations**
   - Complex grep patterns
   - Multi-file analysis
   - Specialized transformations

4. **Reusable Logic**
   - Common validation patterns
   - Standard processing steps
   - Consistent formatting

## Temp Agent Structure

Each temp agent is a markdown file with:

```markdown
---
name: agent-name
description: One-line description
created: 2025-01-08
---

# Agent prompt with detailed instructions

Responsibilities:
1. Specific task 1
2. Specific task 2

Output format:
[Expected format description]

Tools to use:
- Read: [When to use]
- Grep: [When to use]
```

## Examples

### Example 1: Security Scanner

```markdown
---
name: security-scanner
description: Scans codebase for security vulnerabilities
created: 2025-01-08
---

You are a security-focused code analyzer specializing in identifying vulnerabilities.

Your responsibilities:
1. Scan all source files for OWASP Top 10 issues
2. Check for: SQL injection, XSS, CSRF, auth flaws, data exposure
3. Analyze dependencies for known CVEs
4. Review authentication and authorization implementations

Output format:
JSON array with entries:
{
  "file": "path/to/file.js",
  "line": 42,
  "severity": "critical|high|medium|low",
  "type": "sql-injection",
  "description": "User input directly in SQL query",
  "recommendation": "Use parameterized queries"
}

Use these tools:
- Grep: Search for vulnerable patterns (e.g., grep "eval\\(" for eval usage)
- Read: Examine suspicious files in detail
- Glob: Find all files of specific types (e.g., "**/*.js")
- WebSearch: Check CVE databases for dependency vulnerabilities

Prioritize by severity. Focus on actionable findings.
```

**Usage in workflow**:
```flow
$security-scanner:"Scan codebase":vulnerabilities ->
general-purpose:"Analyze {vulnerabilities}, prioritize critical":priority ->
@security-review:"Review {priority}. Approve if acceptable?" ->
(if approved)~> continue:"Proceed"
```

### Example 2: API Documentation Generator

```markdown
---
name: api-doc-generator
description: Generates comprehensive API documentation from code
created: 2025-01-08
---

You are an API documentation specialist.

Your responsibilities:
1. Find all API endpoints in the codebase
2. Extract route definitions, methods, parameters
3. Generate OpenAPI/Swagger documentation
4. Create usage examples for each endpoint

Output format:
OpenAPI 3.0 YAML specification with:
- All endpoints documented
- Request/response schemas
- Authentication requirements
- Example requests and responses

Use these tools:
- Glob: Find API route files (e.g., "**/*routes*.{js,ts}")
- Read: Parse route definitions
- Grep: Search for endpoint patterns (@app.get, @app.post, etc.)

Include edge cases and error responses in documentation.
```

**Usage in workflow**:
```flow
$api-doc-generator:"Generate API docs":api_docs ->
expert-code-implementer:"Format {api_docs} as README":formatted_docs ->
@review-docs:"Review {formatted_docs}. Approve?" ->
expert-code-implementer:"Save to docs/API.md"
```

### Example 3: Performance Profiler

```markdown
---
name: performance-profiler
description: Analyzes code for performance bottlenecks
created: 2025-01-08
---

You are a performance optimization specialist.

Your responsibilities:
1. Identify inefficient algorithms (O(n²) or worse)
2. Find unnecessary loops and redundant operations
3. Detect memory leaks and excessive allocations
4. Check for blocking I/O operations
5. Analyze database query efficiency

Output format:
Markdown report with sections:

## Critical Issues (P0)
- Issue description
- Location (file:line)
- Current complexity
- Recommendation

## Optimizations (P1)
[Same format]

## Nice-to-Have (P2)
[Same format]

Use these tools:
- Grep: Search for patterns like nested loops, .forEach().map()
- Read: Analyze algorithm complexity
- Glob: Find all source files for analysis

Focus on issues with measurable impact. Provide concrete optimization suggestions.
```

**Usage in workflow**:
```flow
$performance-profiler:"Analyze codebase":perf_issues ->
(if perf_issues.critical)~> @urgent-review:"Critical performance issues found!" ->
                            code-optimizer:"Fix critical {perf_issues}":fixes ~>
(if perf_issues.none)~> continue:"No critical issues"
```

### Example 4: Data Validator

```markdown
---
name: data-validator
description: Validates data against schema and business rules
created: 2025-01-08
---

You are a data validation specialist.

Your responsibilities:
1. Check data against provided JSON schema
2. Validate business rules (e.g., dates in range, IDs exist)
3. Identify missing required fields
4. Check data types and formats
5. Verify referential integrity

Output format:
JSON report:
{
  "valid": true|false,
  "errors": [
    {
      "field": "user.email",
      "error": "Invalid email format",
      "value": "bad-email",
      "rule": "Must match email regex"
    }
  ],
  "warnings": [...],
  "summary": {
    "total_records": 100,
    "valid_records": 95,
    "error_count": 5
  }
}

Use these tools:
- Read: Load data file and schema
- Grep: Search for validation rule definitions

Return detailed error information for debugging.
```

**Usage in workflow**:
```flow
general-purpose:"Load data file":data ->
$data-validator:"Validate {data} against schema":validation ->
(if validation.valid)~> process:"Process data" ~>
(if validation.errors)~> @data-review:"Review errors: {validation.errors}" ->
                         general-purpose:"Fix data issues" ->
                         $data-validator:"Re-validate"
```

## Temp Agent Best Practices

### DO:

✅ **Be specific about responsibilities**
- List exactly what the agent should do
- Include edge cases

✅ **Define clear output formats**
- Specify JSON structure, markdown format, etc.
- Include examples

✅ **Recommend appropriate tools**
- List which Claude Code tools to use
- Explain when to use each

✅ **Include quality criteria**
- What makes output complete?
- What level of detail is expected?

✅ **Handle edge cases**
- What if input is invalid?
- What if operation fails?

### DON'T:

❌ **Create for simple tasks**
- Don't create temp agent for "list files"
- Use general-purpose for simple operations

❌ **Make too generic**
- "Do analysis" is too vague
- Be specific about what to analyze and how

❌ **Forget error handling**
- Always specify what to do if operation fails
- Include validation steps

❌ **Skip tool recommendations**
- Agents work better when you suggest tools
- Explain why each tool is useful

## Workflow Integration

### Defining Temp Agents in Workflow

There are two ways to use temp agents:

**1. Reference existing temp agent**:
```flow
$security-scanner:"Scan for vulnerabilities":results
```

**2. Define inline** (I'll create the file):
```flow
# I'll create temp-agents/security-scanner.md during workflow execution
$security-scanner:"Scan for vulnerabilities":results
```

### Variable Passing to Temp Agents

Pass data to temp agents using variable syntax:

```flow
Explore:"Find API routes":routes ->
$api-doc-generator:"Document {routes}":docs
```

The `{routes}` variable is automatically injected into the agent's prompt.

### Error Handling with Temp Agents

```flow
$data-processor:"Process data":result ->
(if result.failed)~> @error-review:"Processing failed. Manual intervention?" ->
                     general-purpose:"Fix data issues" ->
                     $data-processor:"Retry processing" ~>
(if result.success)~> continue:"Proceed"
```

## Agent Promotion

After workflow execution, I'll ask if you want to save temp agents:

```
Workflow complete!

Temp agents created:
  - security-scanner
  - performance-profiler

Would you like to save any as permanent agents?
```

**If you save**, the agent moves to `agents/` directory and gets added to registry:
- Available in all future workflows
- No need to recreate
- Can be updated and maintained

**If you don't save**, the agent is deleted during cleanup:
- Keeps plugin directory clean
- Can recreate when needed

## Temp Agent Lifecycle

```
Workflow Design
    ↓
I create temp-agents/agent-name.md
    ↓
Workflow Execution
    ↓
Agent is used (with orchestration: namespace)
    ↓
Workflow Completes
    ↓
Agent Promotion Prompt
    ↓
User chooses: Save or Discard
    ↓
Cleanup Phase
    ↓
Saved: Moved to agents/
Discarded: Deleted
```

## Namespace Handling

All temp agents automatically get `orchestration:` prefix:

**You write**:
```flow
$news-analyzer:"Analyze news"
```

**System executes**:
```javascript
Task({
  subagent_type: "orchestration:news-analyzer",
  prompt: /* loaded from temp-agents/news-analyzer.md */ + "\n\n" + "Analyze news"
})
```

This ensures no conflicts with built-in Claude Code agents.

## Tips for Effective Temp Agents

1. **Make prompts comprehensive** - Agent has no context beyond what you write
2. **Include examples in prompt** - Shows agent what good output looks like
3. **Specify tools explicitly** - Don't assume agent knows which tools to use
4. **Define success criteria** - How does agent know when it's done?
5. **Handle ambiguity** - What should agent do if input is unclear?

## Common Use Cases

| Use Case | Temp Agent | Benefits |
|----------|-----------|----------|
| Security audit | security-scanner | Consistent vulnerability checking |
| Performance analysis | performance-profiler | Standardized bottleneck detection |
| Data validation | data-validator | Schema compliance checking |
| Documentation generation | doc-generator | Uniform doc format |
| Code transformation | code-transformer | Repeatable refactoring patterns |
| Test generation | test-generator | Comprehensive test coverage |
| API client generation | client-generator | Consistent API wrappers |
| Migration scripts | migration-helper | Safe data transformations |

---

**Want to see temp agents in action? Ask me to create a workflow that needs specialized functionality!**
