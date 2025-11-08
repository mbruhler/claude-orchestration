# Agent Promotion Guide

Progressive disclosure guide for promoting temporary agents to permanent defined agents.

## What Is Agent Promotion?

**Agent promotion** is the process of converting a temporary agent (created inline in a workflow) into a permanent, reusable defined agent that can be used across multiple workflows.

### Definition

- **Temporary Agent**: Created inline with `$agent-name` syntax, exists only within a single workflow
- **Permanent Agent**: Stored in `agents/` directory, registered in `agents/registry.json`, available system-wide
- **Promotion**: Moving a temporary agent to permanent status with proper registration

### Why Promote?

Promotion provides several key benefits:

- **Reusability**: Use the same agent across multiple workflows without redefining
- **Discoverability**: Registered agents appear in system searches and documentation
- **Maintenance**: Single source of truth, update once to affect all workflows
- **Version Control**: Track changes to agent definitions over time
- **Statistics**: Monitor usage patterns and performance metrics
- **Quality**: Promotes review and refinement of successful agent patterns

### When to Promote vs When to Discard

**Promote when**:
- Agent worked well and delivered expected results
- Agent could be useful in future workflows
- Agent provides specialized domain expertise
- Agent represents a reusable pattern or capability

**Discard when**:
- Agent was one-time use only
- Agent is too specific to a single workflow context
- Agent didn't work well or needs major redesign
- Agent duplicates existing permanent agent functionality

## Promotion Process

The promotion process follows a structured, step-by-step flow:

### Step 1: Workflow Completion

After a workflow using temporary agents completes successfully, the system automatically detects all temporary agents that were defined.

### Step 2: Review Phase

The system presents a list of all temporary agents used in the workflow:

```
Workflow Complete!

Temporary agents used in this workflow:
1. $security-scanner - Analyzes code for security vulnerabilities
2. $data-validator - Validates data against schema requirements
3. $quick-formatter - One-off formatting task

Would you like to review these agents for promotion?
```

### Step 3: Selection Phase

User selects which agents to promote:

```
Select agents to promote (space to toggle, enter to confirm):
[x] $security-scanner
[x] $data-validator
[ ] $quick-formatter

2 agents selected for promotion
```

### Step 4: Options Phase

For each selected agent, choose how to promote:

```
Promoting: $security-scanner

Options:
1. Save as-is (recommended if agent worked perfectly)
2. Edit before saving (refine prompt, make more general)
3. Skip this agent

Your choice: _
```

### Step 5: Confirmation Phase

Review and confirm all promotions:

```
Ready to promote:
- security-scanner → agents/security-scanner.md
- data-validator → agents/data-validator.md

Confirm promotion? (y/n): _
```

### Step 6: Completion

System confirms successful promotion:

```
Promoted 2 agents successfully!

New agents available:
- orchestration:security-scanner
- orchestration:data-validator

Cleaned up temporary agents directory.
```

## Promotion Flow Diagram

```
┌─────────────────────┐
│ Workflow Completes  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Review Temp Agents  │
│ (List all created)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ User Selects Agents         │
│ (Multi-select interface)    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ For Each Selected Agent:    │
│                             │
│ ┌─────────────────────┐    │
│ │ Prompt: Action?     │    │
│ │ - Save as-is        │    │
│ │ - Edit first        │    │
│ │ - Skip              │    │
│ └─────────┬───────────┘    │
│           │                 │
│           ▼                 │
│ ┌─────────────────────┐    │
│ │ If Edit: Open file  │    │
│ │ for modifications   │    │
│ └─────────┬───────────┘    │
│           │                 │
│           ▼                 │
│ ┌─────────────────────┐    │
│ │ Move to agents/     │    │
│ └─────────┬───────────┘    │
│           │                 │
│           ▼                 │
│ ┌─────────────────────┐    │
│ │ Add to registry.json│    │
│ └─────────────────────┘    │
└─────────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Cleanup Unselected Agents   │
│ (Remove from temp-agents/)  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Confirmation Message        │
│ (List newly available)      │
└─────────────────────────────┘
```

## What Happens During Promotion

When an agent is promoted, the system performs several automated steps:

### 1. File Movement

The agent definition file is moved from the temporary location to the permanent location:

```
FROM: temp-agents/security-scanner.md
TO:   agents/security-scanner.md
```

### 2. Registry Registration

An entry is added to `agents/registry.json`:

```json
{
  "security-scanner": {
    "file": "security-scanner.md",
    "description": "Analyzes code for security vulnerabilities",
    "namespace": "orchestration:security-scanner",
    "created": "2025-01-08",
    "usageCount": 0,
    "lastUsed": null
  }
}
```

### 3. Namespace Assignment

The agent receives a formal namespace identifier:

```
Namespace: orchestration:security-scanner
```

This namespace is used when invoking the agent in future workflows.

### 4. Immediate Availability

The agent becomes immediately available for use in any workflow:

```yaml
agents:
  - name: security-scanner  # No $ prefix, uses registered agent
    type: defined
```

### 5. Statistics Initialization

Usage tracking is initialized for the agent:

- `usageCount`: Starts at 0
- `lastUsed`: Set to null
- `created`: Current timestamp

## Registry Structure

The `agents/registry.json` file maintains metadata for all permanent agents.

### Example Entry

```json
{
  "security-scanner": {
    "file": "security-scanner.md",
    "description": "Analyzes code for security vulnerabilities using industry best practices",
    "namespace": "orchestration:security-scanner",
    "created": "2025-01-08T10:30:00Z",
    "usageCount": 0,
    "lastUsed": null,
    "tags": ["security", "analysis", "code-review"],
    "version": "1.0.0"
  }
}
```

### Field Descriptions

- **file**: Filename of the agent definition (in `agents/` directory)
- **description**: One-line summary of agent's purpose (used in discovery)
- **namespace**: Fully qualified name for invoking the agent
- **created**: ISO 8601 timestamp of when agent was created/promoted
- **usageCount**: Number of times agent has been used in workflows
- **lastUsed**: ISO 8601 timestamp of most recent usage (null if never used)
- **tags**: (Optional) Keywords for categorization and search
- **version**: (Optional) Semantic version for tracking changes

### Multiple Agents Example

```json
{
  "security-scanner": {
    "file": "security-scanner.md",
    "description": "Analyzes code for security vulnerabilities",
    "namespace": "orchestration:security-scanner",
    "created": "2025-01-08T10:30:00Z",
    "usageCount": 15,
    "lastUsed": "2025-01-10T14:22:00Z"
  },
  "data-validator": {
    "file": "data-validator.md",
    "description": "Validates data against schema requirements",
    "namespace": "orchestration:data-validator",
    "created": "2025-01-08T10:31:00Z",
    "usageCount": 8,
    "lastUsed": "2025-01-09T16:45:00Z"
  },
  "api-documenter": {
    "file": "api-documenter.md",
    "description": "Generates comprehensive API documentation",
    "namespace": "orchestration:api-documenter",
    "created": "2025-01-07T09:15:00Z",
    "usageCount": 23,
    "lastUsed": "2025-01-10T11:30:00Z"
  }
}
```

## Criteria for Promotion

Use these criteria to decide whether an agent should be promoted:

### Strong Promotion Candidates

- **Proven Performance**: Agent successfully completed its tasks in the workflow
- **Reusability Potential**: Similar tasks are likely to occur in future workflows
- **Domain Expertise**: Agent encapsulates specialized knowledge or skills
- **Well-Tested**: Agent's behavior is reliable and predictable
- **Clear Purpose**: Agent has a focused, well-defined responsibility
- **Good Prompt Quality**: Agent's prompt is comprehensive and well-structured

### Example Scenarios

**Promote**: A security scanner that analyzes code for vulnerabilities
- Reason: Security analysis is needed regularly across projects

**Promote**: A data validator that checks JSON schemas
- Reason: Data validation is a common requirement

**Promote**: A documentation generator for REST APIs
- Reason: API documentation tasks occur frequently

**Promote**: A code reviewer specialized in React best practices
- Reason: React reviews are needed for ongoing development

## When NOT to Promote

Recognize situations where promotion isn't appropriate:

### Poor Promotion Candidates

- **One-Time Use**: Agent was created for a single, specific task
- **Workflow-Specific**: Agent relies on context unique to one workflow
- **Untested**: Agent didn't work well or needs significant refinement
- **Duplicate Functionality**: Agent does what an existing permanent agent already does
- **Overly Specific**: Agent is too narrowly focused to be useful elsewhere
- **Poor Quality**: Agent's prompt is unclear or incomplete

### Example Scenarios

**Don't Promote**: A formatter that fixed a specific formatting issue in one file
- Reason: Too specific, unlikely to be needed again

**Don't Promote**: An agent that parsed a unique legacy data format
- Reason: One-time migration task

**Don't Promote**: An agent that didn't work correctly
- Reason: Needs redesign, not ready for reuse

**Don't Promote**: An agent that does the same thing as an existing permanent agent
- Reason: Duplicate functionality, use existing agent instead

**Don't Promote**: An agent that only works with specific hardcoded values from the workflow
- Reason: Too coupled to workflow context

## After Promotion

Once agents are promoted, here's how to work with them:

### Using Promoted Agents

Reference promoted agents by name (without `$` prefix) in workflows:

```yaml
agents:
  - name: security-scanner  # Uses permanent agent
    type: defined

tasks:
  - agent: security-scanner
    input: "Analyze the authentication module"
```

The system automatically resolves the agent from the registry.

### Updating Promoted Agents

To modify a permanent agent:

1. Edit the file directly in the `agents/` directory
2. Changes take effect immediately
3. All workflows using the agent will use the updated version

```bash
# Edit the agent definition
vim agents/security-scanner.md

# Changes are live immediately
# No need to update registry.json manually
```

### Tracking Usage Statistics

The registry automatically tracks usage:

```json
{
  "security-scanner": {
    "usageCount": 23,
    "lastUsed": "2025-01-10T14:22:00Z"
  }
}
```

Use these statistics to:
- Identify most valuable agents
- Find unused agents that can be archived
- Understand agent adoption patterns

### Removing Promoted Agents

If a permanent agent is no longer needed:

1. Remove the file from `agents/` directory
2. Remove the entry from `agents/registry.json`
3. Update any workflows that reference the agent

## Examples

Real-world scenarios illustrating the promotion decision process:

### Example 1: Promoting a Security Scanner

**Scenario**: Created a temporary agent to scan code for SQL injection vulnerabilities.

**Workflow Definition**:
```yaml
agents:
  - name: $sql-injection-scanner
    prompt: |
      You are a security expert specializing in SQL injection detection.
      Analyze code for SQL injection vulnerabilities:
      - Identify unsafe query construction
      - Flag missing input sanitization
      - Recommend parameterized queries
      Provide severity ratings and fix recommendations.

tasks:
  - agent: $sql-injection-scanner
    input: "Scan the user authentication module"
```

**Result**: Agent found 3 vulnerabilities with clear recommendations.

**Decision**: **PROMOTE**

**Reasoning**:
- Security scanning is needed regularly
- Agent performed well and found real issues
- Applicable to any codebase with SQL queries
- Well-defined scope and purpose

**Action**: Promote as-is to `agents/sql-injection-scanner.md`

**Registry Entry**:
```json
{
  "sql-injection-scanner": {
    "file": "sql-injection-scanner.md",
    "description": "Detects SQL injection vulnerabilities in code",
    "namespace": "orchestration:sql-injection-scanner",
    "created": "2025-01-08T15:30:00Z",
    "usageCount": 0,
    "lastUsed": null,
    "tags": ["security", "sql", "vulnerability-scanning"]
  }
}
```

### Example 2: Promoting a Data Validator

**Scenario**: Created an agent to validate API responses against OpenAPI schemas.

**Original Definition**:
```yaml
agents:
  - name: $api-response-validator
    prompt: |
      Validate API responses against OpenAPI 3.0 schemas.
      Check for:
      - Required fields presence
      - Data type correctness
      - Format compliance
      - Enum value validity
      Report all violations with paths and expected values.
```

**Result**: Agent validated 15 endpoints, found 8 schema violations.

**Decision**: **PROMOTE WITH EDITS**

**Reasoning**:
- API validation is a common need
- Agent worked perfectly
- Prompt could be more general to support JSON Schema too

**Action**: Edit before promotion to support both OpenAPI and JSON Schema:

```markdown
# API Response Validator

You are a data validation expert specializing in API response validation.

## Capabilities

Validate API responses against schemas:
- OpenAPI 3.0 specifications
- JSON Schema definitions
- Custom validation rules

## Validation Checks

For each response:
- Required fields presence
- Data type correctness
- Format compliance (email, uuid, date, etc.)
- Enum value validity
- Range constraints (min/max)
- Pattern matching (regex)
- Array constraints (minItems, maxItems, uniqueItems)

## Output Format

Report violations clearly:
- Path to violating field (JSONPath notation)
- Expected value/type/constraint
- Actual value received
- Severity level (error, warning)
- Suggested fix
```

**Registry Entry**:
```json
{
  "api-response-validator": {
    "file": "api-response-validator.md",
    "description": "Validates API responses against OpenAPI and JSON schemas",
    "namespace": "orchestration:api-response-validator",
    "created": "2025-01-08T16:45:00Z",
    "usageCount": 0,
    "lastUsed": null,
    "tags": ["validation", "api", "schema", "openapi", "json-schema"]
  }
}
```

### Example 3: Deciding NOT to Promote

**Scenario**: Created an agent to fix a specific legacy date format in one migration.

**Definition**:
```yaml
agents:
  - name: $legacy-date-fixer
    prompt: |
      Convert dates from legacy format "DD/MM/YY HH:MM" to ISO 8601.
      Assume 20th century for years (97 = 1997).
      Handle missing times by defaulting to 00:00.
      Specific to the old CRM system export format.
```

**Result**: Agent successfully converted 1,200 dates in migration data.

**Decision**: **DO NOT PROMOTE**

**Reasoning**:
- One-time migration task, won't be needed again
- Too specific to legacy CRM format
- Not applicable to other date conversion needs
- If similar need arises, better to create a new, more general agent

**Action**: Discard after workflow completion, keep workflow as documentation of migration process.

### Example 4: Editing Before Promotion

**Scenario**: Created an agent to review React components, but it was too opinionated.

**Original Prompt** (too specific):
```yaml
agents:
  - name: $react-reviewer
    prompt: |
      Review React components for our company standards:
      - Must use hooks, no class components
      - Must use TypeScript strict mode
      - Must use our custom useAuth hook for auth
      - Must follow our exact folder structure
      - Must use Tailwind CSS, no styled-components
```

**Decision**: **EDIT BEFORE PROMOTION**

**Revised Prompt** (more general):
```markdown
# React Component Reviewer

You are a React expert reviewing component code for best practices.

## Review Criteria

### Code Quality
- Component structure and organization
- Proper hook usage (dependencies, rules of hooks)
- State management patterns
- Error handling
- Performance considerations (memoization, lazy loading)

### Type Safety
- TypeScript usage (if applicable)
- Prop type definitions
- Type inference optimization

### Best Practices
- Single responsibility principle
- Proper component composition
- Accessibility (a11y) compliance
- Testability

### Common Issues to Flag
- Missing key props in lists
- Unsafe lifecycle patterns
- Memory leaks (missing cleanup)
- Unnecessary re-renders
- Missing error boundaries

## Output Format

Provide:
- Overall assessment
- Specific issues with line numbers
- Severity levels (critical, warning, suggestion)
- Recommended fixes
- Code examples where helpful
```

**Reasoning**: Removed company-specific requirements, made it useful for any React project.

### Example 5: Promoting Multiple Agents at Once

**Scenario**: Completed a large workflow that used 5 temporary agents.

**Agents Used**:
1. `$code-analyzer` - Analyzes code complexity
2. `$test-generator` - Generates unit tests
3. `$doc-writer` - Writes JSDoc comments
4. `$performance-checker` - Identifies performance issues
5. `$quick-renamer` - Renamed variables for one refactoring

**Review Process**:
```
Select agents to promote:
[x] $code-analyzer - Useful for ongoing code reviews
[x] $test-generator - Always need test generation
[x] $doc-writer - Documentation is continuous need
[x] $performance-checker - Performance analysis needed regularly
[ ] $quick-renamer - One-off task, too specific

4 agents selected for promotion
```

**Batch Promotion**:
```
Promoting 4 agents:

1. code-analyzer → Save as-is? (y/e/s): y
2. test-generator → Save as-is? (y/e/s): e
   [Opens editor for refinement]
3. doc-writer → Save as-is? (y/e/s): y
4. performance-checker → Save as-is? (y/e/s): y

Promotion complete!

New agents available:
- orchestration:code-analyzer
- orchestration:test-generator
- orchestration:doc-writer
- orchestration:performance-checker
```

**Result**: 4 reusable agents added to permanent collection, 1 temporary agent discarded.

## Best Practices

Follow these guidelines for effective agent promotion:

### 1. Review All Temporary Agents

After every workflow, review all temporary agents:
- Did each agent work as expected?
- Which agents could be useful again?
- Which agents need refinement?

Don't skip the review step - it's where value is captured.

### 2. Promote High-Value Agents

Prioritize promoting agents that:
- Saved significant time or effort
- Solved complex problems effectively
- Will likely be needed again soon
- Represent specialized expertise

### 3. Make Prompts More General

Before promotion, edit prompts to remove:
- Hardcoded values specific to one workflow
- References to specific files or paths
- Overly narrow constraints
- Company-specific assumptions

Make agents reusable across different contexts.

### 4. Add Good Descriptions

Write clear, searchable descriptions:

**Bad**: "Does stuff with code"
**Good**: "Analyzes code complexity and suggests refactoring opportunities"

**Bad**: "Validator"
**Good**: "Validates JSON data against OpenAPI 3.0 and JSON Schema specifications"

Descriptions help with discovery and appropriate usage.

### 5. Use Tags for Organization

Add tags to help categorize and find agents:

```json
{
  "security-scanner": {
    "tags": ["security", "analysis", "code-review", "vulnerabilities"]
  },
  "api-validator": {
    "tags": ["validation", "api", "testing", "schema"]
  }
}
```

### 6. Test Before Promoting

If uncertain about an agent's quality:
1. Use it in another workflow first
2. Verify it works in different contexts
3. Only promote after confirming reliability

Don't promote untested agents.

### 7. Archive Rather Than Delete

Instead of deleting agents that might be useful later:
- Create an `agents/archived/` directory
- Move rarely used agents there
- Keep them accessible for reference

### 8. Document Agent Capabilities

In the agent file, clearly document:
- What the agent does
- What inputs it expects
- What outputs it provides
- Any limitations or constraints
- Example use cases

### 9. Version Complex Agents

For agents that will evolve over time:
- Use semantic versioning in registry
- Document breaking changes
- Consider keeping old versions for compatibility

### 10. Review Usage Statistics

Periodically check which promoted agents are actually being used:
- High usage = valuable, keep improving
- No usage = consider archiving or removing
- Declining usage = may be obsolete

---

## Quick Reference

### Promotion Checklist

Before promoting an agent, verify:

- [ ] Agent worked correctly in workflow
- [ ] Agent could be useful in future workflows
- [ ] Prompt is clear and comprehensive
- [ ] Removed workflow-specific hardcoded values
- [ ] Added good description for discovery
- [ ] Considered adding tags for categorization
- [ ] Checked for duplicate functionality
- [ ] Agent has focused, well-defined purpose

### Common Promotion Patterns

**Promote As-Is**: Agent is perfect, no changes needed
**Edit First**: Agent works but needs generalization
**Skip**: Agent is one-time use or needs major redesign

### File Locations

- **Temporary Agents**: `temp-agents/*.md`
- **Permanent Agents**: `agents/*.md`
- **Registry**: `agents/registry.json`
- **Archive**: `agents/archived/*.md` (optional)

---

Ready to promote your temporary agents? Review your recent workflow and identify valuable agents to preserve for future use!
