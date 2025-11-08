# Temp Scripts Detection & Creation Guide

## CRITICAL: When to Create Temp Scripts

This guide ensures that workflow designers (both agents and users) reliably detect when temp scripts are needed and create them proactively.

---

## Core Principle

**If the task involves external data, APIs, or complex data processing that Claude Code cannot do directly with its built-in tools, CREATE A TEMP SCRIPT.**

---

## Automatic Detection Triggers

### ✅ ALWAYS Create Temp Scripts When:

#### 1. **External API Calls**
- **Reddit API**, Twitter API, GitHub API, etc.
- Any service requiring authentication/API keys
- REST/GraphQL endpoints
- Webhooks

**Examples**:
```
❌ BAD: general-purpose:"Fetch data from Reddit API"
✅ GOOD: general-purpose:"Create Python script using PRAW to fetch Reddit posts. Save as temp-scripts/reddit_fetcher.py and execute."
```

#### 2. **Web Scraping**
- Parsing HTML from websites
- Extracting structured data from web pages
- Following pagination or link chains
- Screenshot capture

**Examples**:
```
❌ BAD: general-purpose:"Scrape ProductHunt for competitors"
✅ GOOD: general-purpose:"Create Python script with BeautifulSoup to scrape ProductHunt. Save as temp-scripts/producthunt_scraper.py and execute."
```

#### 3. **Data Processing**
- JSON/CSV parsing and transformation
- Statistical analysis
- Data aggregation from multiple sources
- Complex filtering/sorting

**Examples**:
```
❌ BAD: general-purpose:"Analyze these 1000 data points"
✅ GOOD: general-purpose:"Create Python script with pandas to analyze data. Save as temp-scripts/data_analyzer.py and execute."
```

#### 4. **Database Queries**
- SQL queries (unless using Supabase MCP)
- NoSQL queries
- Database schema analysis
- Data migrations

**Examples**:
```
❌ BAD: general-purpose:"Query PostgreSQL for user data"
✅ GOOD: general-purpose:"Create Python script with psycopg2 to query database. Save as temp-scripts/db_query.py and execute."
```

#### 5. **File System Operations at Scale**
- Processing 10+ files
- Complex file transformations
- Batch renaming/moving
- ZIP/archive operations

**Examples**:
```
❌ BAD: general-purpose:"Rename 50 files"
✅ GOOD: general-purpose:"Create Python script to batch rename files. Save as temp-scripts/batch_rename.py and execute."
```

#### 6. **Third-Party Library Usage**
- NumPy, pandas, requests, BeautifulSoup
- Libraries not available in Claude's built-in tools
- Specialized computations

**Examples**:
```
❌ BAD: general-purpose:"Calculate matrix operations"
✅ GOOD: general-purpose:"Create Python script with NumPy for matrix operations. Save as temp-scripts/matrix_calc.py and execute."
```

#### 7. **Async/Concurrent Operations**
- Parallel API calls
- Rate-limited requests
- Batch processing with retry logic

**Examples**:
```
❌ BAD: general-purpose:"Make 100 API calls"
✅ GOOD: general-purpose:"Create Python script with asyncio to make concurrent API calls with rate limiting. Save as temp-scripts/batch_api.py and execute."
```

#### 8. **Complex Validation/Parsing**
- Regex pattern matching at scale
- Data schema validation
- Format conversion (JSON ↔ YAML ↔ XML)

**Examples**:
```
❌ BAD: general-purpose:"Validate 500 email addresses"
✅ GOOD: general-purpose:"Create Python script to validate emails with regex. Save as temp-scripts/email_validator.py and execute."
```

---

## Pattern Recognition Examples

### Pattern: External Service Integration

**User Request**: "Fetch 10 posts from Reddit about startups"

**Detection**:
- ✅ Mentions external API (Reddit)
- ✅ Requires authentication
- ✅ Needs specialized library (PRAW)

**Correct Response**:
```flow
general-purpose:"Create Python script that:
1. Uses PRAW library for Reddit API
2. Authenticates with client_id and client_secret
3. Fetches 10 hot posts from r/startups
4. Returns JSON array with title, url, score
5. Save as temp-scripts/reddit_fetcher.py
6. Execute the script and return results"
```

---

### Pattern: Competition Research

**User Request**: "Check if there are competing products on ProductHunt"

**Detection**:
- ✅ Web scraping needed
- ✅ May need pagination
- ✅ Structured data extraction

**Correct Response**:
```flow
general-purpose:"Create Python script that:
1. Uses requests + BeautifulSoup
2. Searches ProductHunt for [keyword]
3. Extracts product names, descriptions, upvotes
4. Handles pagination (first 3 pages)
5. Returns JSON array
6. Save as temp-scripts/producthunt_search.py
7. Execute and return results"
```

---

### Pattern: Data Analysis

**User Request**: "Analyze this CSV file with 1000 rows"

**Detection**:
- ✅ Large dataset
- ✅ Statistical analysis
- ✅ Needs pandas/NumPy

**Correct Response**:
```flow
general-purpose:"Create Python script that:
1. Uses pandas to load CSV
2. Calculates mean, median, std dev
3. Identifies outliers
4. Generates summary statistics
5. Save as temp-scripts/data_analysis.py
6. Execute with CSV path as argument
7. Return markdown-formatted results"
```

---

## Decision Tree

```
Does task need external API/service?
├─ YES → Create temp script
└─ NO
    └─ Does task process >10 items?
        ├─ YES → Create temp script
        └─ NO
            └─ Does task need specialized library?
                ├─ YES → Create temp script
                └─ NO
                    └─ Can Claude Code tools handle this directly?
                        ├─ YES → Use built-in tools (Read, Grep, Edit)
                        └─ NO → Create temp script
```

---

## When to Ask User (Uncertainty Cases)

If you're **not 100% certain** whether a temp script is needed, **ASK THE USER** using AskUserQuestion:

### Example 1: Ambiguous Data Processing

**User Request**: "Process the user data"

**Uncertainty**:
- How many users? (10 vs 10,000 matters)
- What kind of processing? (simple filter vs complex analysis)
- What format? (JSON, CSV, database?)

**Correct Response**:
```javascript
AskUserQuestion({
  questions: [{
    question: "How should I process the user data?",
    header: "Approach",
    multiSelect: false,
    options: [
      {
        label: "Simple filter",
        description: "Use built-in tools for basic filtering"
      },
      {
        label: "Complex analysis",
        description: "Create Python script with pandas for statistics"
      },
      {
        label: "API integration",
        description: "Fetch data from external API first"
      }
    ]
  }]
})
```

### Example 2: Unclear Scope

**User Request**: "Get competitor information"

**Uncertainty**:
- From where? (Web scraping vs API)
- How many? (3 vs 100)
- How detailed? (names only vs full analysis)

**Correct Response**:
```javascript
AskUserQuestion({
  questions: [{
    question: "Where should I gather competitor information?",
    header: "Source",
    multiSelect: true,
    options: [
      {
        label: "ProductHunt",
        description: "Scrape ProductHunt for similar products"
      },
      {
        label: "Crunchbase",
        description: "Get funding/company data via API"
      },
      {
        label: "Google Search",
        description: "Search for competitors via web scraping"
      },
      {
        label: "GitHub",
        description: "Find similar open-source projects"
      }
    ]
  }]
})
```

---

## Temp Script Template Structure

Every temp script instruction should include:

### Minimum Requirements:

1. **What library/tool to use** (e.g., "Use PRAW", "Use BeautifulSoup")
2. **What authentication needed** (API keys, credentials)
3. **What data to extract/process** (specific fields)
4. **What format to return** (JSON, markdown, CSV)
5. **Where to save script** (`temp-scripts/script_name.py`)
6. **Execute instruction** ("Execute the script and return results")

### Template:

```
general-purpose:"Create a [Python/Node.js] script that:
1. Uses [library name] to [main task]
2. [Authentication/setup step if needed]
3. [Data extraction/processing details]
4. [Error handling requirements]
5. Returns [output format]
6. Save as temp-scripts/[descriptive_name].[py|js]
7. Execute the script [with arguments if needed]
8. Return [what to return - results, path to output file, etc.]"
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Vague Instructions

**Bad**:
```
general-purpose:"Get data from Reddit API"
```

**Why Bad**: Agent doesn't know:
- Which library to use
- What authentication
- What data to extract
- What format to return

**Good**:
```
general-purpose:"Create Python script using PRAW library:
1. Authenticate with client_id='...' and client_secret='...'
2. Fetch 10 hot posts from r/startups
3. Extract: title, url, score, subreddit
4. Return as JSON array
5. Save as temp-scripts/reddit_fetcher.py
6. Execute and return the JSON output"
```

---

### ❌ Mistake 2: Not Saving Script

**Bad**:
```
general-purpose:"Write a Python script to fetch Reddit data"
```

**Why Bad**: Script is created but not saved, can't be reused or debugged

**Good**:
```
general-purpose:"Create Python script... Save as temp-scripts/reddit_fetcher.py and execute it"
```

---

### ❌ Mistake 3: Not Executing Script

**Bad**:
```
general-purpose:"Create and save temp-scripts/analyzer.py"
```

**Why Bad**: Script is created but never run, workflow stalls

**Good**:
```
general-purpose:"Create Python script... Save as temp-scripts/analyzer.py, execute it, and return the results"
```

---

## Integration with Workflow Design

### During Socratic Questioning

When designing workflows, the Socratic designer agent should **proactively suggest temp scripts**:

**Example Dialogue**:

**User**: "I want to analyze startup ideas from Reddit"

**Agent** (should say):
```
I notice this workflow will need:
1. Reddit API integration → temp script required
2. Competition research → likely temp script for web scraping
3. Data analysis → temp script with pandas

I'll create temp scripts for these steps. Would you like me to:
- Use your Reddit API credentials, or
- Use placeholder credentials you'll fill in later?
```

**Agent uses AskUserQuestion**:
```javascript
AskUserQuestion({
  questions: [{
    question: "Do you have Reddit API credentials ready?",
    header: "API Setup",
    multiSelect: false,
    options: [
      {label: "Yes, use my credentials", description: "I'll provide client_id and secret"},
      {label: "Use placeholders", description: "I'll add them later"},
      {label: "Help me get credentials", description: "Show me how to get Reddit API key"}
    ]
  }]
})
```

---

## Checklist for Workflow Designers

Before finalizing any workflow step, ask:

- [ ] Does this step fetch data from an external source?
- [ ] Does this step need an API key or authentication?
- [ ] Does this step process more than 10 items?
- [ ] Does this step need a library not built into Claude Code?
- [ ] Would a script make this step more reliable/repeatable?
- [ ] Is the data format complex (JSON parsing, CSV processing)?
- [ ] Does this step need error handling/retry logic?

**If ANY checkbox is YES → Create a temp script**

---

## Language Choice: Python vs Node.js

### Use Python When:
- Data analysis (pandas, NumPy)
- Web scraping (BeautifulSoup, Scrapy)
- API calls with authentication (requests)
- Scientific computing
- Reddit API (PRAW), Twitter API, etc.

### Use Node.js When:
- npm packages needed
- JavaScript/TypeScript code generation
- Frontend testing
- Build tool integration

**Default: Python** (better for most data/API tasks)

---

## Summary: The Golden Rule

**When in doubt, create a temp script.**

Better to have a reusable, debuggable script than to:
- Fail silently
- Give vague results
- Force user to manually do the work

Temp scripts are **cheap** (cleaned up automatically) and **powerful** (can use any library).

---

## Real-World Example: Full Workflow

**User Request**: "Analyze 10 startup ideas from Reddit, check competition, rate them"

**Correct Workflow** (with temp scripts):

```flow
# Step 1: Fetch Reddit posts (temp script)
general-purpose:"Create Python script using PRAW:
1. Authenticate with Reddit API
2. Fetch 10 hot posts from r/startups, r/SomebodyMakeThis
3. Extract: title, description, url, score
4. Return JSON array
5. Save as temp-scripts/reddit_fetcher.py
6. Execute and return results":reddit_posts ->

# Step 2: Analyze each post in parallel (temp scripts for competition research)
[
  general-purpose:"Create Python script to research competition for post 1:
  1. Google search for similar products
  2. Check ProductHunt via scraping
  3. Check domain availability
  4. Return competitor list as JSON
  5. Save as temp-scripts/analyze_1.py
  6. Execute and return results":analysis_1 ||

  general-purpose:"[Same for post 2]":analysis_2 ||
  // ... repeat for all 10 posts
] ->

# Step 3: Rate ideas (temp script for consistent scoring)
general-purpose:"Create Python script that:
1. Takes all analyses as input
2. Rates each on: competition, market size, feasibility (1-10 scale)
3. Generates markdown table
4. Save as temp-scripts/rate_ideas.py
5. Execute and return table":ratings_table ->

# Step 4: Manual review
@review:"Review ratings: {ratings_table}"
```

**Why this works**:
- Each external operation has a dedicated temp script
- Scripts are reusable and debuggable
- Clear separation of concerns
- Parallel execution possible
- Results are structured (JSON/markdown)

---

## For Socratic Designer Agent

When you're the workflow-socratic-designer agent:

1. **Scan user request for these keywords**:
   - "API", "fetch", "scrape", "get data from"
   - "analyze", "process", "calculate"
   - Service names: "Reddit", "Twitter", "ProductHunt", etc.
   - "competition", "research", "find"

2. **If ANY keyword found → Suggest temp script in your workflow design**

3. **Use AskUserQuestion to clarify**:
   - Do they have API credentials?
   - What output format do they want?
   - How much data (10 vs 1000 items)?

4. **Include temp script instructions in workflow syntax**:
   - Always specify library to use
   - Always include save path
   - Always include execute instruction

---

**This guide is mandatory for all workflow creation. Temp scripts are not optional - they are the primary method for external integrations and data processing.**
