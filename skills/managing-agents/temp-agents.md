# Temporary Agents Guide

A comprehensive guide to creating, using, and managing temporary agents in orchestration workflows.

## What Are Temp Agents?

Temporary agents are workflow-specific, ephemeral agents that exist only during a single workflow execution. They allow you to create specialized agents tailored to specific tasks without cluttering your permanent agent library.

### Key Characteristics

- **Workflow-scoped**: Created for and used within a single workflow
- **Full agent definitions**: Complete markdown files with YAML frontmatter, not just prompt snippets
- **Automatic cleanup**: Deleted after workflow execution unless promoted
- **Promotion eligible**: Can be saved as permanent defined agents if valuable

### When to Create Temp Agents

Create temporary agents when you need:

1. **Specialized expertise** - Domain-specific knowledge (security, performance, data validation)
2. **Workflow-specific context** - Custom instructions for this particular task
3. **Experimentation** - Testing agent designs before committing to permanent agents
4. **One-off tasks** - Agents that won't be reused across workflows

### When NOT to Create Temp Agents

Don't create temp agents when:

- A built-in agent (`Explore`, `general-purpose`, etc.) can handle it
- A permanent defined agent already exists for this purpose
- The task is simple enough for a single instruction
- You know you'll reuse this agent frequently (create a defined agent instead)

## Lifecycle Overview

```
1. Creation        2. Execution       3. Promotion       4. Cleanup
   (design)           (workflow)         (optional)        (automatic)

[Designer] ──────> [Workflow] ──────> [User Choice] ──────> [Done]
creates temp       references $agent   save or discard     temp deleted
agent files        in workflow steps   after completion    if not saved
```

## Temp Agent File Format

Temp agents are markdown files stored in `temp-agents/` with YAML frontmatter.

### Required Structure

```markdown
---
name: agent-name
base: base-agent-type
model: sonnet|opus|haiku
description: One-line description of what this agent does
---

You are a [role] specializing in [expertise].

Your responsibilities:
1. Primary task
2. Secondary task
3. Additional tasks

Input format:
[What the agent expects to receive]

Output format:
[Expected output structure]

Best practices:
- Use [tool name]: [When and how to use it]
- Handle [edge case]: [How to handle it]
- Focus on [priority]: [Why it matters]
```

### Required Fields (YAML Frontmatter)

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `name` | Yes | Agent identifier (kebab-case) | `security-scanner` |
| `base` | Yes | Base agent type to use | `general-purpose`, `Explore`, `code-reviewer` |
| `model` | No | Model selection (default: sonnet) | `opus`, `sonnet`, `haiku` |
| `description` | Yes | Brief one-line summary | `Scans for security vulnerabilities` |

### Available Base Agents

- **`general-purpose`** - Versatile agent for most tasks
- **`Explore`** - Code exploration and codebase search
- **`code-reviewer`** - Code review and quality checks
- **`expert-code-implementer`** - Code implementation and editing
- **`implementation-architect`** - Planning and architecture

### Prompt Content Guidelines

Make your agent prompts **comprehensive and specific**:

1. **Define the role clearly** - "You are a security expert specializing in..."
2. **List responsibilities** - Numbered list of what agent should do
3. **Specify input/output formats** - JSON, markdown, specific structure
4. **Include tool recommendations** - When to use Read, Grep, Edit, etc.
5. **Handle edge cases** - Error handling, missing data, conflicts
6. **Define success criteria** - What constitutes completion

## Creating Temp Agents

Temp agents are typically created automatically by the workflow designer when you use `/orchestration:create`. However, you can also create them manually.

### Automatic Creation (Recommended)

When designing workflows, the system creates temp agents for you:

```
User: Create a workflow to scan for security issues and fix them

Designer: I'll create two temp agents:
1. security-scanner - To find vulnerabilities
2. vulnerability-fixer - To apply fixes
```

Creates files:
- `temp-agents/security-scanner.md`
- `temp-agents/vulnerability-fixer.md`

### Manual Creation

To create a temp agent manually:

1. Create file in `temp-agents/` directory
2. Use kebab-case naming: `my-agent.md`
3. Include YAML frontmatter with required fields
4. Write comprehensive prompt
5. Reference in workflow with `$agent-name` syntax

## Using Temp Agents in Workflows

### Reference Syntax

Use the `$` prefix to reference temp agents in workflows:

```flow
$agent-name:"instruction"
```

**Example:**
```flow
$security-scanner:"Scan the authentication module"
```

### With Output Capture

Capture agent output to a variable for use in subsequent steps:

```flow
$agent-name:"instruction":output_var
```

**Example:**
```flow
$security-scanner:"Scan auth code":vulnerabilities
```

### Variable Interpolation

Use captured variables in subsequent agent instructions:

```flow
$agent1:"First task":result1 ->
$agent2:"Process {result1}"
```

**Example:**
```flow
$security-scanner:"Scan code":issues ->
$fixer:"Fix these issues: {issues}":fixes ->
general-purpose:"Verify {fixes} resolved {issues}"
```

### Complete Workflow Example

```flow
$security-scanner:"Scan authentication and authorization":issues ->
@review ->
$fixer:"Fix issues: {issues}":fixes ->
general-purpose:"Verify fixes and run tests"
```

## Temp Agent Examples

### Example 1: Security Scanner

**File:** `temp-agents/security-scanner.md`

```markdown
---
name: security-scanner
base: general-purpose
model: opus
description: Scans codebase for security vulnerabilities using OWASP guidelines
---

You are a security expert specializing in web application vulnerabilities.

Your responsibilities:
1. Scan code for OWASP Top 10 vulnerabilities
2. Identify SQL injection, XSS, CSRF, and authentication flaws
3. Provide specific file paths and line numbers
4. Assess severity (critical, high, medium, low)

Input format:
- Natural language instruction specifying what to scan
- May include specific modules or file patterns

Output format:
```json
{
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "critical",
      "file": "auth.js",
      "line": 42,
      "code": "const query = 'SELECT * FROM users WHERE id=' + userId",
      "recommendation": "Use parameterized queries"
    }
  ],
  "summary": {
    "critical": 2,
    "high": 5,
    "medium": 8,
    "low": 3
  }
}
```

Use these tools:
- Grep: Search for vulnerable patterns (eval, innerHTML, raw SQL)
- Read: Examine suspicious files in detail
- Glob: Find all files of specific types (*.js, *.php)

Best practices:
- Focus on user input handling, database queries, and authentication
- Check both server-side and client-side code
- Consider context-specific vulnerabilities (framework-specific issues)
- Provide actionable, specific recommendations
```

**Usage in workflow:**

```flow
$security-scanner:"Scan authentication module":security_issues ->
general-purpose:"Prioritize {security_issues} by severity"
```

### Example 2: Performance Profiler

**File:** `temp-agents/performance-profiler.md`

```markdown
---
name: performance-profiler
base: Explore
model: sonnet
description: Analyzes code for performance bottlenecks and optimization opportunities
---

You are a performance optimization expert specializing in identifying bottlenecks and inefficiencies.

Your responsibilities:
1. Identify performance issues (N+1 queries, memory leaks, inefficient algorithms)
2. Measure complexity (time/space)
3. Suggest specific optimizations
4. Prioritize by impact

Input format:
- Module or component to analyze
- Optional: performance budget or target metrics

Output format:
```markdown
## Performance Analysis

### Critical Issues
1. **N+1 Query in UserController.index** (auth/controllers/user.js:45)
   - Impact: 500ms+ for 100 users
   - Fix: Add eager loading `.includes(:posts)`

### Optimization Opportunities
1. **Memoization candidate** (utils/calculator.js:23)
   - Function called 1000+ times with same inputs
   - Potential savings: 200ms per request

### Summary
- Total potential improvement: 700ms (60% faster)
- Estimated effort: 4 hours
```

Use these tools:
- Grep: Find patterns (loops, queries, large data structures)
- Read: Analyze algorithm complexity
- Glob: Find all files in hot paths

Best practices:
- Focus on hot paths and frequently called code
- Consider both time and space complexity
- Provide before/after performance estimates
- Suggest profiling tools if needed
```

**Usage in workflow:**

```flow
$performance-profiler:"Analyze API request handlers":bottlenecks ->
@review ->
expert-code-implementer:"Optimize based on {bottlenecks}"
```

### Example 3: Data Validator

**File:** `temp-agents/data-validator.md`

```markdown
---
name: data-validator
base: general-purpose
model: haiku
description: Validates data integrity, schema compliance, and business rules
---

You are a data validation specialist ensuring data quality and consistency.

Your responsibilities:
1. Validate data against schema/rules
2. Check referential integrity
3. Identify data quality issues (nulls, duplicates, outliers)
4. Report statistics and violations

Input format:
- Data source (file path, database table, API response)
- Validation rules or schema

Output format:
```json
{
  "valid": false,
  "total_records": 1000,
  "violations": [
    {
      "rule": "email_required",
      "count": 45,
      "examples": ["row 23", "row 67", "row 89"]
    },
    {
      "rule": "age_range",
      "count": 12,
      "details": "Values outside 0-120 range"
    }
  ],
  "statistics": {
    "null_emails": 45,
    "duplicate_ids": 8,
    "invalid_dates": 3
  }
}
```

Use these tools:
- Read: Load data files
- Bash: Run validation scripts or database queries

Best practices:
- Validate both structure and semantics
- Provide specific row/record references
- Suggest fixes for common violations
- Report both errors and warnings
```

**Usage in workflow:**

```flow
$data-validator:"Validate user import CSV against schema":validation_report ->
general-purpose:"Fix validation errors in {validation_report}" ->
$data-validator:"Re-validate fixed data":final_report
```

### Example 4: Documentation Generator

**File:** `temp-agents/doc-generator.md`

```markdown
---
name: doc-generator
base: general-purpose
model: sonnet
description: Generates comprehensive documentation from code analysis
---

You are a technical writer specializing in creating clear, comprehensive documentation.

Your responsibilities:
1. Analyze code structure and functionality
2. Generate API documentation
3. Create usage examples
4. Document edge cases and limitations

Input format:
- Code files or modules to document
- Documentation format preference (Markdown, JSDoc, OpenAPI)

Output format:
```markdown
# Module Name

## Overview
Brief description of module purpose and functionality.

## API Reference

### `functionName(param1, param2)`
Description of what the function does.

**Parameters:**
- `param1` (type): Description
- `param2` (type): Description

**Returns:** Return type and description

**Example:**
\`\`\`javascript
const result = functionName('value1', 'value2');
\`\`\`

**Edge Cases:**
- What happens if param1 is null
- Behavior with empty arrays

## Usage Guide
Step-by-step guide for common use cases.
```

Use these tools:
- Read: Examine source code
- Grep: Find usage examples in tests
- Glob: Discover related files

Best practices:
- Include practical examples
- Document edge cases and error handling
- Keep language clear and concise
- Link to related documentation
```

**Usage in workflow:**

```flow
$doc-generator:"Generate API docs for auth module":api_docs ->
code-reviewer:"Review {api_docs} for accuracy" ->
general-purpose:"Create getting-started guide using {api_docs}"
```

### Example 5: Code Transformer

**File:** `temp-agents/code-transformer.md`

```markdown
---
name: code-transformer
base: expert-code-implementer
model: sonnet
description: Transforms code between patterns, frameworks, or styles
---

You are a code refactoring expert specializing in transforming code while preserving functionality.

Your responsibilities:
1. Transform code to new patterns/frameworks
2. Maintain functionality and tests
3. Update imports and dependencies
4. Preserve comments and documentation

Input format:
- Source code or files to transform
- Target pattern/framework/style
- Transformation rules

Output format:
```markdown
## Transformation Summary

**Files transformed:** 12
**Pattern:** Class components → Functional components with hooks

### Changes Made

1. **UserProfile.jsx**
   - Converted class component to function
   - Replaced `componentDidMount` with `useEffect`
   - Converted state to `useState` hooks

2. **Dashboard.jsx**
   - Similar transformations
   - Added custom hook `useAuth` for auth logic

### Breaking Changes
None - all tests passing

### Manual Review Needed
- Authentication.jsx: Complex lifecycle - review useEffect dependencies
```

Use these tools:
- Read: Load source files
- Edit: Apply transformations
- Bash: Run tests after transformation

Best practices:
- Transform incrementally, test frequently
- Preserve git history with meaningful commits
- Document breaking changes
- Maintain code style consistency
```

**Usage in workflow:**

```flow
$code-transformer:"Convert class components to hooks":transformation ->
general-purpose:"Run tests and verify {transformation}" ->
code-reviewer:"Review transformed code quality"
```

### Example 6: Test Generator

**File:** `temp-agents/test-generator.md`

```markdown
---
name: test-generator
base: general-purpose
model: sonnet
description: Generates comprehensive test suites from code analysis
---

You are a testing expert specializing in creating thorough, maintainable test suites.

Your responsibilities:
1. Analyze code to identify test cases
2. Generate unit, integration, and edge case tests
3. Ensure high coverage of critical paths
4. Follow testing best practices (AAA, no test interdependence)

Input format:
- Code files or modules to test
- Testing framework (Jest, Mocha, pytest, etc.)
- Coverage requirements

Output format:
```javascript
// UserService.test.js

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };

      // Act
      const user = await UserService.createUser(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it('should throw error with invalid email', async () => {
      // Arrange
      const userData = { email: 'invalid', name: 'Test' };

      // Act & Assert
      await expect(UserService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });

    // Edge cases...
  });
});
```

Use these tools:
- Read: Analyze source code
- Grep: Find existing test patterns
- Write: Create test files

Best practices:
- Test happy path, edge cases, and error conditions
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Aim for meaningful coverage, not just high percentage
```

**Usage in workflow:**

```flow
$test-generator:"Generate tests for auth module":test_suite ->
general-purpose:"Run {test_suite} and report coverage" ->
code-reviewer:"Review test quality and completeness"
```

### Example 7: API Client Generator

**File:** `temp-agents/api-client-generator.md`

```markdown
---
name: api-client-generator
base: expert-code-implementer
model: sonnet
description: Generates type-safe API client code from OpenAPI/Swagger specs
---

You are an API integration expert specializing in generating robust client libraries.

Your responsibilities:
1. Parse API specifications (OpenAPI, Swagger)
2. Generate type-safe client code
3. Include error handling and retries
4. Create usage documentation

Input format:
- OpenAPI/Swagger spec (URL or file)
- Target language (TypeScript, Python, Go)
- Client library preferences (axios, fetch, requests)

Output format:
```typescript
// Generated API Client

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
}

export class UserApiClient {
  constructor(private baseUrl: string, private apiKey: string) {}

  async getUser(userId: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    // Implementation with validation, error handling, retries
  }
}

// Usage example and documentation
```

Use these tools:
- WebFetch: Retrieve OpenAPI specs from URLs
- Read: Load local spec files
- Write: Create generated client files

Best practices:
- Generate TypeScript interfaces from schemas
- Include JSDoc comments with examples
- Add request/response validation
- Implement retry logic for transient failures
- Provide clear error messages
```

**Usage in workflow:**

```flow
$api-client-generator:"Generate TypeScript client from OpenAPI spec":client_code ->
general-purpose:"Create integration tests for {client_code}" ->
code-reviewer:"Review generated client quality"
```

## Best Practices

### Creating Effective Temp Agents

#### Make Prompts Comprehensive

Agents have **no context** beyond their prompt. Include everything they need:

**Good prompt:**
```markdown
You are a security expert specializing in OWASP vulnerabilities.

Scan for:
- SQL injection (raw queries, string concatenation)
- XSS (innerHTML, unescaped output)
- CSRF (missing tokens on state-changing operations)

Provide:
- File paths and line numbers
- Severity rating
- Specific fix recommendations

Use Grep to search for vulnerable patterns, Read to examine context.
```

**Bad prompt:**
```markdown
Check for security issues.
```

#### Include Tool Recommendations

Tell agents **when and how** to use specific tools:

```markdown
Use these tools:
- Read: Examine files you need detailed analysis of
- Grep: Search codebase for patterns (*.js files, specific functions)
- Glob: Find all files matching criteria (test files, config files)
- Edit: Apply fixes to code
- Bash: Run validation scripts or tests
```

#### Define Clear Output Formats

Specify **exactly** what format you expect:

```markdown
Output format:
```json
{
  "issues": [
    {"file": "path/to/file.js", "line": 42, "severity": "high", "description": "..."}
  ],
  "summary": {
    "total": 10,
    "critical": 2,
    "high": 5
  }
}
```
```

#### Handle Edge Cases

Include guidance for common edge cases:

```markdown
Edge cases to handle:
- If no issues found, return empty array
- If file cannot be read, log error and continue
- If pattern is ambiguous, ask for clarification
- If multiple files match, process all of them
```

#### Specify Success Criteria

Define what "done" means:

```markdown
Success criteria:
- All files in specified directory scanned
- Issues categorized by severity
- At least one example provided for each issue type
- Recommendations include code snippets
```

### Naming Temp Agents

#### Good Names

- **Descriptive**: `security-scanner`, `performance-profiler`, `api-doc-generator`
- **Domain-specific**: `sql-query-optimizer`, `react-hook-converter`
- **Action-oriented**: `test-generator`, `schema-validator`

#### Bad Names

- **Generic**: `helper`, `agent1`, `analyzer`
- **Vague**: `doer`, `processor`, `handler`
- **Too long**: `comprehensive-security-vulnerability-scanner-and-reporter`

### Model Selection

Choose models based on task complexity:

| Model | Use For | Characteristics |
|-------|---------|----------------|
| **Opus** | Complex analysis, security audits, architecture | Highest quality, slowest, most expensive |
| **Sonnet** | General implementation, balanced tasks | Good quality, reasonable speed, moderate cost |
| **Haiku** | Fast exploration, simple validation, parallel tasks | Fast, cheap, good for simple tasks |

**Example:**
```flow
$security-scanner (opus):"Deep vulnerability analysis":issues ->
$quick-validator (haiku):"Validate fix syntax":validation ->
$implementer (sonnet):"Apply fixes"
```

### Variable Management

#### Use Descriptive Variable Names

**Good:**
```flow
:scan_results
:vulnerabilities
:performance_metrics
:api_documentation
```

**Bad:**
```flow
:output
:result
:data
:x
```

#### Track Variable Flow

Ensure variables flow logically:

```flow
$analyzer:"Scan code":issues ->
$fixer:"Fix {issues}":fixes ->
general-purpose:"Verify {fixes} resolved {issues}"
```

Variables should be:
1. **Produced** before being consumed
2. **Named** consistently throughout workflow
3. **Scoped** to relevant parts of workflow

## Agent Promotion

After workflow completion, you can promote valuable temp agents to permanent defined agents.

### When to Promote

Promote agents that are:

- **Reusable** - Useful across multiple workflows
- **Well-tested** - Successfully completed workflow execution
- **Generic** - Not tied to specific files or project context
- **Valuable** - Provide domain expertise worth keeping

### When NOT to Promote

Don't promote agents that are:

- **One-time use** - Created for single specific workflow
- **Workflow-specific** - Reference specific files or project details
- **Untested** - Haven't been validated in real workflow
- **Duplicative** - Similar to existing defined agents

### Promotion Process

After workflow completion:

1. **Review Phase** - System analyzes each temp agent for reusability
2. **Recommendations** - AI suggests which agents to save
3. **Selection** - Choose which agents to promote
4. **Processing** - Selected agents moved to `agents/` and registered
5. **Cleanup** - Unselected agents deleted

**Example prompt:**

```
Workflow complete!

Temp agents used:
✓ [Recommended] security-scanner
  Generic security analysis - reusable across projects

✗ [Not recommended] auth-fixer
  Contains project-specific file references

Select agents to save: [1]

Saved: security-scanner → agents/security-scanner.md
Cleaned up: auth-fixer
```

For complete promotion details, see [promotion.md](promotion.md).

## Cleanup

### Automatic Cleanup

Temp agents are **automatically deleted** after workflow completion unless promoted.

Cleaned files:
- `temp-agents/*.md` - Agent definition files
- `examples/*-data.json` - Workflow-specific data files

**Example:**
```
Cleaned up 2 temporary file(s):
  - temp-agents/security-scanner.md
  - temp-agents/performance-profiler.md
```

### What Happens to Unsaved Agents

Unsaved temp agents are permanently deleted:
- Agent files removed from `temp-agents/`
- No entry in `agents/registry.json`
- Not available in future workflows
- Must be recreated if needed again

### Manual Cleanup

To manually clean up temp agents:

```bash
# Remove all temp agents
rm -rf temp-agents/*.md

# Remove specific temp agent
rm temp-agents/my-agent.md
```

For complete cleanup details, see the cleanup section in [SKILL.md](SKILL.md).

## Common Issues

### Agent Not Found

**Error:** `Temporary agent '$scanner' not found`

**Causes:**
- Typo in agent name
- Agent file doesn't exist in `temp-agents/`
- Agent was already cleaned up
- Wrong directory

**Fix:**
```bash
# Check if agent file exists
ls temp-agents/scanner.md

# Verify agent name matches file name
# File: scanner.md, Reference: $scanner
```

### Missing Variable

**Error:** `Variable 'results' referenced but not produced`

**Cause:** No agent captures output to this variable

**Fix:**
```flow
# Before (error)
$agent1:"Task" ->
general-purpose:"Use {results}"

# After (fixed)
$agent1:"Task":results ->
general-purpose:"Use {results}"
```

### Variable Not Ready

**Error:** `Cannot execute: missing variables: results`

**Cause:** Agent tries to use variable before it's produced

**Fix:**
```flow
# Ensure producer runs before consumer
$producer:"Generate data":results ->
$consumer:"Process {results}"
```

### Invalid Frontmatter

**Error:** `Invalid agent definition: missing required field 'base'`

**Cause:** YAML frontmatter incomplete

**Fix:**
```markdown
---
name: my-agent
base: general-purpose    # Required!
description: What it does # Required!
---
```

## Related Documentation

- **[SKILL.md](SKILL.md)** - Complete agent management overview
- **[promotion.md](promotion.md)** - Detailed promotion process *(to be created)*
- **[defined-agents.md](defined-agents.md)** - Creating permanent agents *(to be created)*
- **[namespacing.md](namespacing.md)** - Agent namespace conventions *(to be created)*
- **[docs/features/temporary-agents.md](/Users/mbroler/.claude/plugins/repos/orchestration/docs/features/temporary-agents.md)** - Technical specification
- **[docs/reference/temp-agents-syntax.md](/Users/mbroler/.claude/plugins/repos/orchestration/docs/reference/temp-agents-syntax.md)** - Syntax reference

## Quick Reference

### File Structure

```
temp-agents/
  my-agent.md          # Your temp agent definition

agents/
  promoted-agent.md    # Promoted permanent agents
  registry.json        # Agent registry
```

### Workflow Syntax

```flow
# Reference temp agent
$agent-name:"instruction"

# With output capture
$agent-name:"instruction":variable

# With variable interpolation
$agent:"Use {previous_variable}":new_variable
```

### YAML Frontmatter

```yaml
---
name: agent-name        # Required: kebab-case identifier
base: general-purpose   # Required: base agent type
model: sonnet          # Optional: opus|sonnet|haiku
description: Brief summary  # Required: one-line description
---
```

---

**Ready to create temp agents? Start designing workflows with `/orchestration:create`!**
