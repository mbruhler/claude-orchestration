---
name: orchestration:creating-workflows
description: Use when user says "create workflow", "create a workflow", "design workflow", "orchestrate", "automate multiple steps", "coordinate agents", "multi-agent workflow". Creates orchestration workflows from natural language using Socratic questioning to plan multi-agent workflows with visualization.
---

# Creating Orchestration Workflows

I'll help you create powerful orchestration workflows that coordinate multiple Claude Code agents. I use Socratic questioning to understand your needs and generate optimal workflow syntax.

## When I Activate

I automatically activate when you:
- Describe a multi-step process you want to automate
- Mention "workflow", "orchestration", "automate", "coordinate agents"
- Ask "how do I create a workflow?"
- Want to connect multiple agents or tasks
- Ask about automating repetitive processes

## My Process

### 1. Understanding Your Intent

**CRITICAL**: I use AskUserQuestion tool for ALL questions. NO plain text numbered lists.

I'll ask strategic questions to understand:
- What problem you're solving
- What your goal is
- What scope you have in mind
- **What external data sources you need** (APIs, web scraping, databases)

### 2. Detecting Temp Script Needs

I automatically scan for these triggers:
- **External APIs**: Reddit, Twitter, GitHub, ProductHunt, etc.
- **Web Scraping**: Extracting data from websites
- **Data Processing**: Analyzing 10+ items, statistical analysis
- **Authentication**: Any service requiring API keys

**If detected → I'll proactively create temp scripts for you**

### 3. Identifying the Pattern
I'll determine if your workflow is:
- **Sequential**: One step after another (`->`)
- **Parallel**: Multiple tasks at once (`||`)
- **Conditional**: Based on results (`~>`)
- **Hybrid**: Combination of above

### 3. Designing the Workflow
I'll help you define:
- Which agents to use (built-in or custom)
- How data flows between steps
- Error handling strategy
- Review checkpoints

### 4. Generating Syntax
I'll create clean, readable workflow syntax like:

```flow
# Simple sequential workflow
explore:"Analyze codebase" ->
implement:"Add feature" ->
test:"Run tests"
```

```flow
# Parallel with merge
[security-check || style-check || performance-check] ->
general-purpose:"Consolidate findings"
```

## Question Approach

For more details on my questioning strategy, see [socratic-method.md](socratic-method.md).

**Quick overview:**
- **Vague requests**: I ask about problem → scope → constraints
- **Specific requests**: I confirm pattern → ask about customization
- **Medium requests**: I explore scope → clarify details

## Common Patterns

I have templates for common scenarios. See [patterns.md](patterns.md) for complete catalog.

**Popular patterns:**
- Feature implementation (explore → implement → test → review)
- Bug fixing (investigate → fix → verify)
- Security scanning (scan → review → fix → verify)
- Documentation (analyze → write → review)
- Refactoring (analyze → refactor → test → validate)

## Custom Agents

When your workflow needs specialized expertise, I can create **temp agents** for you.

**Temp agents are:**
- Created automatically during workflow design
- Saved in `./temp-agents/` directory (in current working directory)
- Cleaned after workflow design (with user confirmation)
- Can be promoted to permanent agents if useful

**When I create temp agents:**
- You need domain-specific expertise (e.g., security scanner)
- Task requires specific output formats
- Multiple workflows might benefit (I'll suggest making it permanent)

See [temp-agents.md](temp-agents.md) for examples and guidelines.

## Credential Security (CRITICAL)

When workflows require API credentials or sensitive data, I follow strict security practices:

### Security Checklist

1. **Never hardcode credentials** in workflow files
2. **Use config files** for credentials (e.g., `config/reddit-credentials.json`)
3. **Provide example files** (e.g., `config/reddit-credentials.json.example`)
4. **Verify .gitignore** includes credential files before workflow runs
5. **Check git status** to ensure credentials aren't staged

### Required Workflow Phase

For workflows requiring credentials, I add a **Phase 0: Security Verification** step:

```flow
# Phase 0: Security & Credential Verification
general-purpose:"SECURITY CHECK - Verify credentials are properly configured.

1. Check if credentials file exists
2. Verify .gitignore includes the credentials file
3. Check git status for accidental staging
4. Abort if credentials might be committed

If NOT protected:
- WARN user
- Offer to add to .gitignore
- Only proceed after confirmation":credentials_status
```

### .gitignore Patterns

These patterns MUST be in .gitignore:
```
# API credentials - NEVER commit
config/*-credentials.json
config/credentials*.json
**/credentials.json
**/secrets.json
*.credentials.json
.env
.env.local
```

### User Notification

When I detect a workflow needs credentials, I:
1. Ask user if they have credentials set up
2. Provide setup instructions with example file
3. Verify .gitignore protection
4. Add security verification phase to workflow

## Temp Scripts (CRITICAL)

**Temp scripts** are Python/Node.js scripts I create for tasks that Claude Code tools can't handle directly.

### When I Create Temp Scripts

I **automatically** create temp scripts when you need:

1. **External API calls** - Reddit, Twitter, GitHub, ProductHunt
2. **Web scraping** - Extracting data from websites
3. **Data processing** - Pandas analysis, JSON parsing at scale
4. **Database queries** - SQL, NoSQL operations
5. **Batch operations** - Processing 10+ files
6. **Third-party libraries** - NumPy, BeautifulSoup, requests

### How It Works

**You say**: "Fetch 10 Reddit posts about startups"

**I create**:
```flow
general-purpose:"Create Python script using PRAW library:
1. Authenticate with Reddit API (client_id, client_secret)
2. Fetch 10 hot posts from r/startups
3. Extract: title, url, score, selftext
4. Return JSON array
5. Save as ./temp-scripts/reddit_fetcher.py
6. Execute and return results":reddit_posts
```

### Proactive Detection

I scan your request for keywords:
- "API", "fetch", "scrape", "get data from"
- "Reddit", "Twitter", "ProductHunt", "GitHub"
- "analyze", "process", "calculate"
- Numbers like "10 posts", "100 records"

**If found → I'll suggest temp scripts and ask for your confirmation**

### When Uncertain

If I'm not sure whether you need a temp script, I'll ask:

```javascript
AskUserQuestion({
  questions: [{
    question: "How should I handle this data processing?",
    header: "Approach",
    multiSelect: false,
    options: [
      {label: "Built-in tools", description: "Use Read/Grep for simple operations"},
      {label: "Create temp script", description: "Python script for complex processing"},
      {label: "External API", description: "Fetch from service with authentication"}
    ]
  }]
})
```

For complete guide, see: `docs/TEMP-SCRIPTS-DETECTION-GUIDE.md`

## Custom Syntax

Sometimes you need syntax beyond the basics. I can design custom syntax elements like:
- New operators (`=>` for merge-with-dedup)
- Checkpoints (`@security-gate`)
- Conditions (`if security-critical`)
- Loops (`retry-with-backoff`)

I follow a **reuse-first approach**: I check existing syntax before creating new.

See [custom-syntax.md](custom-syntax.md) for syntax design process.

## Examples

Real workflow examples to inspire you:

See [examples.md](examples.md) for complete catalog with explanations.

**Quick examples:**

**TDD Implementation:**
```flow
# Test-Driven Development workflow
general-purpose:"Write failing test":test_file ->
implement:"Make test pass":implementation ->
code-reviewer:"Review {implementation}":review ->
(if review.approved)~> commit:"Commit changes" ~>
(if review.needs_changes)~> implement:"Fix issues"
```

**Bug Investigation:**
```flow
# Parallel investigation with consolidation
[
  explore:"Find related code":related_files ||
  general-purpose:"Search for similar bugs":similar_issues ||
  general-purpose:"Check recent changes":recent_commits
] ->
general-purpose:"Consolidate findings into root cause analysis":analysis ->
implement:"Fix bug based on {analysis}":fix ->
general-purpose:"Run relevant tests":test_results
```

**Security Audit:**
```flow
# Security scanning with manual gate
$security-scanner:"Scan codebase for vulnerabilities":findings ->
@security-review:"Review {findings}. Approve if no critical issues." ->
(if approved)~> deploy:"Deploy to production"
```

## Workflow Templates

After creating your workflow, I'll offer to save it as a template for reuse.

Templates include:
- Descriptive name and metadata
- Parameter placeholders for customization
- Complete workflow syntax
- Usage instructions

Templates are saved in `./examples/` directory as `.flow` files.

## What Happens Next

After I create your workflow:

1. **Review**: I show you the generated syntax with explanation
2. **Customize**: You can ask for modifications
3. **Save**: I offer to save as template
4. **Execute**: Use `/orchestration:run` to execute it
5. **Cleanup**: Check for temp files and ask about deletion

## Cleanup After Workflow Design (MANDATORY)

After completing workflow design, check for temporary files and ask user before deleting.

### Step 1: Detect Temporary Files

Check for existence of temporary files in the **current working directory**:

```bash
# Check temp-agents created during design
TEMP_AGENTS=$(ls ./temp-agents/*.md 2>/dev/null | wc -l)

# Check temp-scripts created during design
TEMP_SCRIPTS=$(ls ./temp-scripts/* 2>/dev/null | wc -l)

TOTAL=$((TEMP_AGENTS + TEMP_SCRIPTS))
```

### Step 2: If Files Exist, Ask User

**Only if `TOTAL > 0`**, use AskUserQuestion:

```javascript
AskUserQuestion({
  questions: [{
    question: "Found ${TOTAL} temporary files created during workflow design. Do you want to delete them?",
    header: "Cleanup",
    multiSelect: false,
    options: [
      {label: "Yes, delete all", description: "Remove temp-agents and temp-scripts"},
      {label: "Show me first", description: "List files before deciding"},
      {label: "No, keep them", description: "Leave files for workflow execution"}
    ]
  }]
})
```

### Step 3: Execute Cleanup if Confirmed

If user chose "Yes, delete all":

```bash
# Delete temp-agents (in current working directory)
rm -f ./temp-agents/*.md

# Delete temp-scripts (in current working directory)
rm -rf ./temp-scripts/*
```

Report what was deleted:
```
Cleaned up ${TOTAL} temporary files:
- ${TEMP_AGENTS} temp agents removed
- ${TEMP_SCRIPTS} temp scripts removed
```

### Step 4: Skip if No Files

If `TOTAL == 0`, skip cleanup silently (don't bother user).

## Tips for Best Results

- **Be specific**: More details = better workflow
- **Ask questions**: I'm here to help refine your ideas
- **Start simple**: We can add complexity later
- **Review examples**: Check [examples.md](examples.md) for inspiration

## Technical Details

- **Namespace**: All plugin agents use `orchestration:` prefix
- **Temp agents**: Auto-prefixed with `orchestration:`
- **Variable binding**: Use `:variable_name` to capture outputs
- **Error handling**: Use `(if failed)~>` for error branches

For complete syntax reference, see executing-workflows skill or [syntax reference](../../docs/reference/syntax.md).

## Related Skills

- **executing-workflows**: Run workflows with visualization and steering
- **managing-agents**: Create and manage custom agents
- **designing-syntax**: Design custom syntax elements
- **using-templates**: Use and customize workflow templates

---

**Ready to create a workflow? Just describe what you want to automate!**
