---
name: managing-temp-scripts
description: Create and execute temporary scripts (Python, Node.js, shell) during workflow execution for API integrations, data processing, and custom tools. Use when user needs to interact with external APIs, process data with specific libraries, or create temporary executable code.
---

# Managing Temporary Scripts

I help you create and execute temporary scripts during workflow execution. Perfect for API integrations, data processing with specialized libraries, and creating temporary tools that execute and return results.

## When I Activate

I automatically activate when you:
- Need to interact with external APIs (Reddit, Twitter, GitHub, etc.)
- Want to use specific libraries not available in Claude Code
- Need to process data with custom code
- Ask "how do I call an API in a workflow?"
- Mention "temporary script", "execute code", "API client"
- Need credentials/API keys for external services

## Key Concept

**Temporary scripts are code files that:**
1. Are created during workflow execution
2. Execute via Bash tool
3. Return results to workflow
4. Are automatically cleaned up after workflow completion

**Supported Languages:**
- Python (with pip packages)
- Node.js/JavaScript (with npm packages)
- Shell/Bash scripts
- Ruby, Go, or any executable language

## Quick Example

```flow
# 1. Ask for API credentials
AskUserQuestion:"Reddit API key needed":api_key ->

# 2. Create Python script with embedded credentials
general-purpose:"Create Python script: reddit_client.py with {api_key}":script_path ->

# 3. Execute script and capture output
Bash:"python3 {script_path}":reddit_data ->

# 4. Process results in workflow
general-purpose:"Analyze {reddit_data} and create summary":analysis ->

# 5. Cleanup happens automatically
```

## Script Lifecycle

See [script-lifecycle.md](script-lifecycle.md) for complete details.

**Overview:**

```
1. Creation
   ↓
   Write script to /tmp/workflow-scripts/

2. Preparation
   ↓
   Set permissions (chmod +x)
   Install dependencies if needed

3. Execution
   ↓
   Run via Bash tool
   Capture stdout/stderr

4. Data Return
   ↓
   Parse output (JSON, CSV, text)
   Pass to next workflow step

5. Cleanup
   ↓
   Remove script files
   Clean temp directories
```

## Common Use Cases

### 1. API Integration

**Reddit API Client:**
```python
# /tmp/workflow-scripts/reddit_client.py
import requests
import json
import sys

api_key = sys.argv[1]
subreddit = sys.argv[2]

headers = {'Authorization': f'Bearer {api_key}'}
response = requests.get(
    f'https://oauth.reddit.com/r/{subreddit}/hot.json',
    headers=headers
)

print(json.dumps(response.json(), indent=2))
```

**In workflow:**
```flow
$script-creator:"Create reddit_client.py":script ->
Bash:"python3 {script} {api_key} programming":posts ->
general-purpose:"Parse {posts} and extract top 10 titles"
```

### 2. Data Processing

**CSV Analysis:**
```python
# /tmp/workflow-scripts/analyze_data.py
import pandas as pd
import sys

df = pd.read_csv(sys.argv[1])
summary = df.describe().to_json()
print(summary)
```

**In workflow:**
```flow
general-purpose:"Create analyze_data.py script":script ->
Bash:"pip install pandas && python3 {script} data.csv":analysis ->
general-purpose:"Interpret {analysis} and create report"
```

### 3. Web Scraping

**Article Scraper:**
```javascript
// /tmp/workflow-scripts/scraper.js
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeArticles(url) {
  const {data} = await axios.get(url);
  const $ = cheerio.load(data);

  const articles = [];
  $('.article').each((i, el) => {
    articles.push({
      title: $(el).find('.title').text(),
      url: $(el).find('a').attr('href')
    });
  });

  console.log(JSON.stringify(articles));
}

scrapeArticles(process.argv[2]);
```

**In workflow:**
```flow
general-purpose:"Create scraper.js":script ->
Bash:"npm install axios cheerio && node {script} https://news.site":articles ->
general-purpose:"Process {articles}"
```

## Script Templates

See [script-templates.md](script-templates.md) for complete library.

**Quick templates:**

- **API Client** (REST, GraphQL)
- **Data Processing** (CSV, JSON, XML)
- **Web Scraping** (HTML parsing)
- **File Processing** (PDF, images, documents)
- **Database Access** (PostgreSQL, MySQL, MongoDB)
- **Message Queues** (RabbitMQ, Kafka)
- **Cloud Services** (AWS S3, GCS, Azure)

## Security Best Practices

See [security.md](security.md) for comprehensive guide.

**Quick checklist:**

✅ **Credentials Management:**
- Pass via command-line arguments (not hardcoded)
- Use environment variables for sensitive data
- Clean up after execution

✅ **File Permissions:**
```bash
chmod 700 /tmp/workflow-scripts/script.py  # Owner only
```

✅ **Output Sanitization:**
- Validate script output before using
- Escape special characters
- Limit output size

✅ **Dependency Management:**
- Use virtual environments for Python
- Specify exact package versions
- Avoid running arbitrary code

## Integration with Workflows

See [integration-patterns.md](integration-patterns.md) for detailed patterns.

### Pattern 1: Simple Script Execution

```flow
general-purpose:"Create script.py that fetches data":script ->
Bash:"python3 {script}":data ->
general-purpose:"Process {data}"
```

### Pattern 2: Script with User Input

```flow
AskUserQuestion:"API credentials needed":creds ->
general-purpose:"Create api_client.py with {creds}":script ->
Bash:"python3 {script}":results ->
general-purpose:"Analyze {results}"
```

### Pattern 3: Parallel Script Execution

```flow
general-purpose:"Create multiple API clients":scripts ->
[
  Bash:"python3 {scripts.reddit}":reddit_data ||
  Bash:"python3 {scripts.twitter}":twitter_data ||
  Bash:"python3 {scripts.github}":github_data
] ->
general-purpose:"Merge all data sources"
```

### Pattern 4: Iterative Processing

```flow
@process_batch ->
general-purpose:"Create batch_processor.py":script ->
Bash:"python3 {script} batch_{n}":results ->
(if results.has_more)~> @process_batch ~>
(if results.complete)~> general-purpose:"Finalize"
```

## Script Directory Structure

```
/tmp/workflow-scripts/
├── {workflow-id}/              # Unique per workflow
│   ├── reddit_client.py
│   ├── data_processor.py
│   ├── requirements.txt        # Python dependencies
│   ├── package.json            # Node.js dependencies
│   └── .env                    # Environment variables
```

**Automatic cleanup after workflow:**
```bash
rm -rf /tmp/workflow-scripts/{workflow-id}
```

## Creating Scripts in Workflows

### Method 1: Inline Script Creation

```flow
general-purpose:"Create Python script:
```python
import requests
import sys

api_key = sys.argv[1]
response = requests.get(
    'https://api.example.com/data',
    headers={'Authorization': f'Bearer {api_key}'}
)
print(response.text)
```
Save to /tmp/workflow-scripts/api_client.py":script_path ->

Bash:"python3 {script_path} {api_key}":data
```

### Method 2: Template-Based Creation

```flow
general-purpose:"Use template: api-rest-client
- Language: Python
- API: Reddit
- Auth: Bearer token
- Output: JSON
Create script in /tmp/workflow-scripts/":script ->

Bash:"python3 {script}":data
```

### Method 3: Multi-File Scripts

```flow
general-purpose:"Create script package:
- main.py (entry point)
- utils.py (helper functions)
- requirements.txt (dependencies)
Save to /tmp/workflow-scripts/package/":package_path ->

Bash:"cd {package_path} && pip install -r requirements.txt && python3 main.py":data
```

## Dependency Management

### Python (pip)

```flow
general-purpose:"Create requirements.txt:
requests==2.31.0
pandas==2.0.0
Save to /tmp/workflow-scripts/":deps ->

general-purpose:"Create script.py":script ->

Bash:"pip install -r {deps} && python3 {script}":data
```

### Node.js (npm)

```flow
general-purpose:"Create package.json with dependencies":package ->

general-purpose:"Create script.js":script ->

Bash:"cd /tmp/workflow-scripts && npm install && node {script}":data
```

### Virtual Environments

```flow
Bash:"python3 -m venv /tmp/workflow-scripts/venv":venv ->

general-purpose:"Create script in venv":script ->

Bash:"source /tmp/workflow-scripts/venv/bin/activate && python3 {script}":data
```

## Error Handling

### Capturing Errors

```flow
Bash:"python3 {script} 2>&1":output ->

(if output.contains('Error'))~>
  general-purpose:"Parse error: {output}":error ->
  @review-error:"Script failed: {error}" ~>

(if output.success)~>
  general-purpose:"Process {output}"
```

### Retry Logic

```flow
@retry ->
Bash:"python3 {script}":result ->

(if result.failed)~>
  general-purpose:"Wait 5 seconds" ->
  @retry ~>

(if result.success)~>
  general-purpose:"Process {result}"
```

## Output Formats

Scripts can return data in various formats:

### JSON (Recommended)

```python
import json
result = {"data": [...], "status": "success"}
print(json.dumps(result))
```

### CSV

```python
import csv
import sys
writer = csv.writer(sys.stdout)
writer.writerows(data)
```

### Plain Text

```python
for item in results:
    print(f"{item['title']}: {item['url']}")
```

## Cleanup

### Automatic Cleanup

Cleanup happens automatically after workflow completion:

```flow
# At end of workflow execution:
general-purpose:"Remove all scripts in /tmp/workflow-scripts/{workflow-id}"
```

### Manual Cleanup

For long-running workflows:

```flow
general-purpose:"Create and execute script":result ->
general-purpose:"Process {result}":output ->
Bash:"rm -rf /tmp/workflow-scripts/{script-dir}":cleanup
```

## Best Practices

### DO:

✅ Use unique workflow IDs for script directories
✅ Pass credentials as arguments, not hardcoded
✅ Validate and sanitize script output
✅ Use virtual environments for Python
✅ Specify exact dependency versions
✅ Return structured data (JSON preferred)
✅ Clean up after workflow completion
✅ Set restrictive file permissions
✅ Use timeouts for script execution
✅ Log script output for debugging

### DON'T:

❌ Hardcode API keys in scripts
❌ Execute untrusted code
❌ Store sensitive data in script files
❌ Leave scripts after workflow
❌ Use global Python/Node packages
❌ Ignore script errors
❌ Return massive outputs (>1MB)
❌ Use system-wide directories

## Tips for Effective Script Management

1. **Use Descriptive Names**: `reddit_api_client.py` not `script.py`

2. **Return Structured Data**: Always use JSON when possible

3. **Error Messages**: Include detailed error messages in output

4. **Logging**: Add logging for debugging:
```python
import logging
logging.basicConfig(level=logging.INFO)
logging.info(f"Fetching data from {url}")
```

5. **Validation**: Validate inputs before execution

6. **Timeouts**: Set execution timeouts:
```flow
Bash:"timeout 30 python3 {script}":data
```

## Related Skills

- **creating-workflows**: Create workflows that use temp scripts
- **executing-workflows**: Execute workflows with script steps
- **managing-agents**: Temp agents vs temp scripts
- **debugging-workflows**: Debug script execution issues

## Advanced Topics

See detail files for:
- [script-lifecycle.md](script-lifecycle.md) - Complete lifecycle management
- [script-templates.md](script-templates.md) - 20+ ready-to-use templates
- [security.md](security.md) - Security best practices
- [integration-patterns.md](integration-patterns.md) - Workflow integration patterns

---

**Ready to use temporary scripts? Just describe what API or processing you need!**
