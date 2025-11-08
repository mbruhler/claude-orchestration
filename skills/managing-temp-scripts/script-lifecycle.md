# Script Lifecycle Documentation

## Overview

This document describes the complete lifecycle of temporary scripts used in orchestration workflows, from creation through execution to cleanup. Understanding this lifecycle is essential for building reliable workflows that use custom scripts for data processing, API integration, and automation tasks.

**Complete Lifecycle Flow:**
```
Creation → Dependencies → Execution → Output Processing → Cleanup
```

Each phase has specific requirements, best practices, and potential failure points that must be handled properly.

---

## Phase 1: Script Creation

### Storage Location

All temporary scripts are stored in `/tmp/workflow-scripts/` with subdirectories organized by workflow ID:

```
/tmp/workflow-scripts/
├── workflow-12345/
│   ├── reddit_client.py
│   ├── requirements.txt
│   └── venv/
├── workflow-67890/
│   ├── github_scraper.js
│   └── package.json
└── workflow-11111/
    └── data_processor.py
```

### Directory Structure Best Practices

1. **One directory per workflow** - Isolates dependencies and prevents conflicts
2. **Workflow ID in path** - Enables tracking and debugging
3. **Group related scripts** - Keep helper files together
4. **Clear naming** - Use descriptive names that indicate purpose

### File Naming Conventions

**Python Scripts:**
```
snake_case_name.py
reddit_api_client.py
data_processor.py
```

**Node.js Scripts:**
```
camelCaseName.js or kebab-case-name.js
githubScraper.js or github-scraper.js
dataProcessor.js
```

**Shell Scripts:**
```
kebab-case-name.sh
process-data.sh
```

### Permission Setting

All scripts must be made executable immediately after creation:

```bash
chmod 700 /tmp/workflow-scripts/workflow-12345/script.py
```

**Permission Levels:**
- `700` - Owner can read, write, execute (recommended for security)
- `755` - Owner full, others read+execute (use if sharing needed)
- Never use `777` - Security risk

### Creation Example

```python
# Step 1: Create workflow directory
import os
workflow_id = "workflow-12345"
script_dir = f"/tmp/workflow-scripts/{workflow_id}"
os.makedirs(script_dir, exist_ok=True)

# Step 2: Write script file
script_path = f"{script_dir}/reddit_client.py"
with open(script_path, 'w') as f:
    f.write(script_content)

# Step 3: Set permissions
os.chmod(script_path, 0o700)
```

---

## Phase 2: Dependency Installation

### Python Dependencies

**Using pip with requirements.txt:**

```bash
# Create virtual environment
cd /tmp/workflow-scripts/workflow-12345
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**requirements.txt example:**
```
praw==7.7.1
pandas==2.1.3
requests==2.31.0
python-dotenv==1.0.0
```

**Best Practices:**
- Pin exact versions (`==`) for reproducibility
- Use virtual environments to avoid system conflicts
- Include all transitive dependencies
- Test installation before execution

### Node.js Dependencies

**Using npm with package.json:**

```bash
# Navigate to script directory
cd /tmp/workflow-scripts/workflow-67890

# Install dependencies
npm install
```

**package.json example:**
```json
{
  "name": "github-scraper",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12",
    "dotenv": "^16.3.1"
  }
}
```

**Best Practices:**
- Use `package-lock.json` for version locking
- Avoid global installations
- Use `npm ci` for faster, reliable installs in production
- Minimize dependency count

### System Packages

**macOS (Homebrew):**
```bash
brew install jq curl imagemagick
```

**Ubuntu/Debian (apt):**
```bash
apt-get update
apt-get install -y jq curl imagemagick
```

**Best Practices:**
- Check if package already installed
- Use non-interactive flags (`-y`)
- Handle installation failures gracefully

### Version Pinning Best Practices

1. **Always pin major versions** - Prevents breaking changes
2. **Test with pinned versions** - Ensures reproducibility
3. **Document version requirements** - Include in comments
4. **Update cautiously** - Test before updating pins

---

## Phase 3: Execution

### Via Bash Tool

Scripts are executed using the Bash tool with proper environment setup:

**Python execution:**
```bash
cd /tmp/workflow-scripts/workflow-12345
source venv/bin/activate
python reddit_client.py --subreddit programming --limit 10
```

**Node.js execution:**
```bash
cd /tmp/workflow-scripts/workflow-67890
node github_scraper.js --repo "microsoft/vscode" --type issues
```

### Passing Arguments

**Command-line arguments:**
```bash
# Python with argparse
python script.py --api-key "sk-xxx" --output "/tmp/results.json"

# Node.js with process.argv
node script.js --username "octocat" --format json
```

**Stdin input:**
```bash
echo '{"query": "python", "limit": 100}' | python script.py
```

### Environment Variables

**Setting variables:**
```bash
# Inline
API_KEY="sk-xxx" python script.py

# Export for multiple commands
export REDDIT_CLIENT_ID="abc123"
export REDDIT_CLIENT_SECRET="xyz789"
python reddit_client.py
```

**Loading from .env file:**
```bash
# Create .env file
cat > /tmp/workflow-scripts/workflow-12345/.env <<EOF
REDDIT_CLIENT_ID=abc123
REDDIT_CLIENT_SECRET=xyz789
EOF

# Script loads with python-dotenv
python reddit_client.py
```

### Timeout Handling

**Bash tool timeout parameter:**
```bash
# 5 minute timeout (300000ms)
timeout 300000ms python long_running_script.py
```

**Script-level timeouts:**
```python
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("Script exceeded time limit")

signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(300)  # 5 minutes

try:
    # Your code here
    process_data()
finally:
    signal.alarm(0)  # Cancel alarm
```

### Capturing stdout/stderr

**Redirecting output:**
```bash
# Capture stdout only
python script.py > /tmp/output.txt

# Capture stderr only
python script.py 2> /tmp/errors.txt

# Capture both separately
python script.py > /tmp/output.txt 2> /tmp/errors.txt

# Capture both together
python script.py > /tmp/combined.txt 2>&1

# Capture and display
python script.py 2>&1 | tee /tmp/output.txt
```

---

## Phase 4: Output Processing

### JSON Parsing

**Python script output:**
```python
# reddit_client.py
import json

results = {
    "subreddit": "programming",
    "posts": [
        {"title": "Post 1", "score": 100},
        {"title": "Post 2", "score": 50}
    ],
    "total": 2
}

print(json.dumps(results, indent=2))
```

**Processing in workflow:**
```bash
# Execute and parse
output=$(python reddit_client.py)
echo "$output" | jq '.posts[] | select(.score > 75)'
```

### CSV Parsing

**Python script output:**
```python
# data_processor.py
import csv
import sys

data = [
    ["name", "age", "city"],
    ["Alice", "30", "NYC"],
    ["Bob", "25", "LA"]
]

writer = csv.writer(sys.stdout)
writer.writerows(data)
```

**Processing in workflow:**
```bash
# Execute and process
python data_processor.py > /tmp/data.csv

# Parse with Python
python -c "
import csv
with open('/tmp/data.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f'{row[\"name\"]}: {row[\"age\"]}')
"
```

### Plain Text Processing

**Script output:**
```bash
# Simple line-based output
python script.py
# Output:
# Processing file 1...
# Processing file 2...
# Complete: 2 files processed
```

**Processing:**
```bash
# Extract specific lines
python script.py | grep "Complete"

# Count lines
python script.py | wc -l

# Filter and transform
python script.py | grep "Processing" | sed 's/Processing //'
```

### Error Detection in Output

**Structured error output:**
```python
# error_aware_script.py
import json
import sys

try:
    result = perform_operation()
    print(json.dumps({"status": "success", "data": result}))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}), file=sys.stderr)
    sys.exit(1)
```

**Checking for errors:**
```bash
# Execute and check exit code
if python error_aware_script.py > /tmp/output.json 2> /tmp/errors.txt; then
    echo "Success"
    cat /tmp/output.json
else
    echo "Failed"
    cat /tmp/errors.txt
    exit 1
fi
```

### Large Output Handling

**Streaming output:**
```python
# stream_processor.py
import json

# Process in chunks, output line by line
for chunk in process_large_dataset():
    print(json.dumps(chunk))
    sys.stdout.flush()  # Important for real-time output
```

**Processing large output:**
```bash
# Process line by line without loading all into memory
python stream_processor.py | while read -r line; do
    echo "$line" | jq -c '.id, .value'
done

# Use files for very large output
python stream_processor.py > /tmp/large_output.jsonl
grep "important" /tmp/large_output.jsonl > /tmp/filtered.jsonl
```

---

## Phase 5: Cleanup

### Automatic Cleanup After Workflow

**At workflow end:**
```bash
# Remove entire workflow directory
rm -rf /tmp/workflow-scripts/workflow-12345

# Remove specific files
rm -f /tmp/workflow-scripts/workflow-12345/*.json
rm -f /tmp/output-*.csv
```

### Manual Cleanup for Long Workflows

**Progressive cleanup:**
```bash
# Clean after each major step
python step1.py > /tmp/step1_output.json
process_results /tmp/step1_output.json
rm /tmp/step1_output.json  # Clean immediately

python step2.py > /tmp/step2_output.json
process_results /tmp/step2_output.json
rm /tmp/step2_output.json
```

### Cleanup on Error

**Trap-based cleanup:**
```bash
#!/bin/bash

# Set up cleanup trap
cleanup() {
    echo "Cleaning up..."
    rm -rf /tmp/workflow-scripts/workflow-12345
    rm -f /tmp/temp-*.json
}

trap cleanup EXIT ERR

# Your workflow code
python script.py
process_output
# Cleanup runs automatically on exit or error
```

### Temporary File Removal

**Best practices:**
```bash
# Use specific patterns
rm -f /tmp/workflow-12345-*.tmp
rm -f /tmp/processing-*.json

# Avoid wildcards that could match too much
# DON'T: rm -f /tmp/*
# DO: rm -f /tmp/workflow-12345/*

# Verify before removing
if [ -d "/tmp/workflow-scripts/workflow-12345" ]; then
    rm -rf /tmp/workflow-scripts/workflow-12345
fi
```

---

## Complete Examples

### Example 1: Reddit API Client (Python)

**Phase 1: Creation**
```bash
# Create directory
mkdir -p /tmp/workflow-scripts/workflow-reddit-001
cd /tmp/workflow-scripts/workflow-reddit-001

# Create script
cat > reddit_client.py <<'EOF'
import praw
import json
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def fetch_reddit_posts(subreddit, limit=10):
    reddit = praw.Reddit(
        client_id=os.getenv('REDDIT_CLIENT_ID'),
        client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
        user_agent='workflow-script/1.0'
    )

    posts = []
    for submission in reddit.subreddit(subreddit).hot(limit=limit):
        posts.append({
            'title': submission.title,
            'score': submission.score,
            'url': submission.url,
            'created_utc': submission.created_utc,
            'num_comments': submission.num_comments
        })

    return posts

if __name__ == '__main__':
    subreddit = sys.argv[1] if len(sys.argv) > 1 else 'programming'
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10

    try:
        results = fetch_reddit_posts(subreddit, limit)
        output = {
            'status': 'success',
            'subreddit': subreddit,
            'count': len(results),
            'posts': results
        }
        print(json.dumps(output, indent=2))
    except Exception as e:
        error = {
            'status': 'error',
            'message': str(e)
        }
        print(json.dumps(error, indent=2), file=sys.stderr)
        sys.exit(1)
EOF

# Set permissions
chmod 700 reddit_client.py
```

**Phase 2: Dependencies**
```bash
# Create requirements.txt
cat > requirements.txt <<EOF
praw==7.7.1
python-dotenv==1.0.0
EOF

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Phase 3: Execution**
```bash
# Create .env file
cat > .env <<EOF
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
EOF

# Execute script
source venv/bin/activate
python reddit_client.py programming 20 > /tmp/reddit_output.json 2> /tmp/reddit_errors.txt
```

**Phase 4: Output Processing**
```bash
# Check for errors
if [ -s /tmp/reddit_errors.txt ]; then
    echo "Error occurred:"
    cat /tmp/reddit_errors.txt
    exit 1
fi

# Parse and filter results
cat /tmp/reddit_output.json | jq '.posts[] | select(.score > 100) | {title, score, url}'

# Extract top post
cat /tmp/reddit_output.json | jq '.posts[0]'

# Count posts
cat /tmp/reddit_output.json | jq '.count'
```

**Phase 5: Cleanup**
```bash
# Clean up output files
rm -f /tmp/reddit_output.json /tmp/reddit_errors.txt

# Clean up script directory (when workflow complete)
deactivate
rm -rf /tmp/workflow-scripts/workflow-reddit-001
```

---

### Example 2: GitHub API Client (Node.js)

**Phase 1: Creation**
```bash
# Create directory
mkdir -p /tmp/workflow-scripts/workflow-github-002
cd /tmp/workflow-scripts/workflow-github-002

# Create script
cat > github_scraper.js <<'EOF'
const axios = require('axios');
require('dotenv').config();

async function fetchGitHubIssues(owner, repo, state = 'open', limit = 30) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/issues`,
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                },
                params: {
                    state: state,
                    per_page: limit,
                    sort: 'created',
                    direction: 'desc'
                }
            }
        );

        const issues = response.data.map(issue => ({
            number: issue.number,
            title: issue.title,
            state: issue.state,
            created_at: issue.created_at,
            comments: issue.comments,
            labels: issue.labels.map(l => l.name),
            url: issue.html_url
        }));

        console.log(JSON.stringify({
            status: 'success',
            repo: `${owner}/${repo}`,
            count: issues.length,
            issues: issues
        }, null, 2));

    } catch (error) {
        console.error(JSON.stringify({
            status: 'error',
            message: error.message,
            code: error.code
        }, null, 2));
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const owner = args[0] || 'microsoft';
const repo = args[1] || 'vscode';
const state = args[2] || 'open';
const limit = parseInt(args[3]) || 30;

fetchGitHubIssues(owner, repo, state, limit);
EOF

# Set permissions
chmod 700 github_scraper.js
```

**Phase 2: Dependencies**
```bash
# Create package.json
cat > package.json <<'EOF'
{
  "name": "github-scraper",
  "version": "1.0.0",
  "description": "Fetch GitHub issues",
  "dependencies": {
    "axios": "^1.6.2",
    "dotenv": "^16.3.1"
  }
}
EOF

# Install dependencies
npm install
```

**Phase 3: Execution**
```bash
# Create .env file
cat > .env <<EOF
GITHUB_TOKEN=ghp_your_token_here
EOF

# Execute script
node github_scraper.js microsoft vscode open 50 > /tmp/github_output.json 2> /tmp/github_errors.txt
```

**Phase 4: Output Processing**
```bash
# Check for errors
if [ $? -ne 0 ]; then
    echo "Script failed:"
    cat /tmp/github_errors.txt
    exit 1
fi

# Parse results
cat /tmp/github_output.json | jq '.issues[] | select(.comments > 10) | {number, title, comments}'

# Get issue numbers
cat /tmp/github_output.json | jq '.issues[].number'

# Filter by label
cat /tmp/github_output.json | jq '.issues[] | select(.labels[] | contains("bug"))'
```

**Phase 5: Cleanup**
```bash
# Remove output files
rm -f /tmp/github_output.json /tmp/github_errors.txt

# Remove script directory
rm -rf /tmp/workflow-scripts/workflow-github-002
```

---

### Example 3: Data Processing with Pandas

**Phase 1: Creation**
```bash
mkdir -p /tmp/workflow-scripts/workflow-pandas-003
cd /tmp/workflow-scripts/workflow-pandas-003

cat > data_processor.py <<'EOF'
import pandas as pd
import json
import sys

def process_csv_data(input_file):
    # Read CSV
    df = pd.read_csv(input_file)

    # Basic statistics
    stats = {
        'total_rows': len(df),
        'columns': list(df.columns),
        'numeric_summary': df.describe().to_dict(),
        'missing_values': df.isnull().sum().to_dict()
    }

    # Group by analysis (example)
    if 'category' in df.columns:
        grouped = df.groupby('category').agg({
            'value': ['sum', 'mean', 'count']
        }).to_dict()
        stats['grouped_analysis'] = grouped

    # Top 10 rows by value (if column exists)
    if 'value' in df.columns:
        top_10 = df.nlargest(10, 'value')[['name', 'value']].to_dict('records')
        stats['top_10'] = top_10

    return stats

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'status': 'error',
            'message': 'Usage: python data_processor.py <input_file.csv>'
        }), file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]

    try:
        results = process_csv_data(input_file)
        output = {
            'status': 'success',
            'file': input_file,
            'results': results
        }
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(json.dumps({
            'status': 'error',
            'message': str(e)
        }), file=sys.stderr)
        sys.exit(1)
EOF

chmod 700 data_processor.py
```

**Phase 2: Dependencies**
```bash
cat > requirements.txt <<EOF
pandas==2.1.3
numpy==1.26.2
EOF

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Phase 3: Execution**
```bash
# Create sample CSV for testing
cat > /tmp/sample_data.csv <<EOF
name,category,value
Product A,Electronics,1500
Product B,Electronics,2000
Product C,Furniture,800
Product D,Furniture,1200
Product E,Electronics,1800
EOF

# Execute
source venv/bin/activate
python data_processor.py /tmp/sample_data.csv > /tmp/analysis.json
```

**Phase 4: Output Processing**
```bash
# Extract specific metrics
cat /tmp/analysis.json | jq '.results.total_rows'
cat /tmp/analysis.json | jq '.results.top_10'
cat /tmp/analysis.json | jq '.results.numeric_summary.value.mean'

# Process for further use
cat /tmp/analysis.json | jq -r '.results.top_10[] | "\(.name): \(.value)"'
```

**Phase 5: Cleanup**
```bash
rm -f /tmp/sample_data.csv /tmp/analysis.json
deactivate
rm -rf /tmp/workflow-scripts/workflow-pandas-003
```

---

### Example 4: Web Scraping with Cheerio (Node.js)

**Phase 1: Creation**
```bash
mkdir -p /tmp/workflow-scripts/workflow-scraper-004
cd /tmp/workflow-scripts/workflow-scraper-004

cat > web_scraper.js <<'EOF'
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePage(url, selector) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        $(selector).each((i, element) => {
            results.push({
                text: $(element).text().trim(),
                html: $(element).html(),
                href: $(element).attr('href')
            });
        });

        console.log(JSON.stringify({
            status: 'success',
            url: url,
            selector: selector,
            count: results.length,
            items: results
        }, null, 2));

    } catch (error) {
        console.error(JSON.stringify({
            status: 'error',
            message: error.message
        }));
        process.exit(1);
    }
}

const url = process.argv[2];
const selector = process.argv[3] || 'a';

if (!url) {
    console.error('Usage: node web_scraper.js <url> [selector]');
    process.exit(1);
}

scrapePage(url, selector);
EOF

chmod 700 web_scraper.js
```

**Phase 2: Dependencies**
```bash
cat > package.json <<'EOF'
{
  "name": "web-scraper",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.2",
    "cheerio": "^1.0.0-rc.12"
  }
}
EOF

npm install
```

**Phase 3: Execution**
```bash
node web_scraper.js "https://news.ycombinator.com" ".titleline > a" > /tmp/scrape_results.json
```

**Phase 4: Output Processing**
```bash
# Extract titles
cat /tmp/scrape_results.json | jq -r '.items[].text'

# Get URLs
cat /tmp/scrape_results.json | jq -r '.items[] | select(.href != null) | .href'

# Count items
cat /tmp/scrape_results.json | jq '.count'
```

**Phase 5: Cleanup**
```bash
rm -f /tmp/scrape_results.json
rm -rf /tmp/workflow-scripts/workflow-scraper-004
```

---

### Example 5: Database Access with psycopg2 (Python)

**Phase 1: Creation**
```bash
mkdir -p /tmp/workflow-scripts/workflow-db-005
cd /tmp/workflow-scripts/workflow-db-005

cat > db_query.py <<'EOF'
import psycopg2
import json
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def execute_query(query, params=None):
    conn = None
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', 5432)
        )

        cur = conn.cursor()
        cur.execute(query, params)

        # Fetch results if SELECT query
        if cur.description:
            columns = [desc[0] for desc in cur.description]
            rows = cur.fetchall()
            results = [dict(zip(columns, row)) for row in rows]
        else:
            # For INSERT/UPDATE/DELETE
            conn.commit()
            results = {'rows_affected': cur.rowcount}

        cur.close()

        return {
            'status': 'success',
            'query': query,
            'results': results
        }

    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'status': 'error',
            'message': 'Usage: python db_query.py "<query>"'
        }), file=sys.stderr)
        sys.exit(1)

    query = sys.argv[1]
    result = execute_query(query)

    print(json.dumps(result, indent=2, default=str))

    if result['status'] == 'error':
        sys.exit(1)
EOF

chmod 700 db_query.py
```

**Phase 2: Dependencies**
```bash
cat > requirements.txt <<EOF
psycopg2-binary==2.9.9
python-dotenv==1.0.0
EOF

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Phase 3: Execution**
```bash
# Create .env
cat > .env <<EOF
DB_HOST=localhost
DB_NAME=mydb
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
EOF

# Execute query
source venv/bin/activate
python db_query.py "SELECT * FROM users WHERE active = true LIMIT 10" > /tmp/db_results.json
```

**Phase 4: Output Processing**
```bash
# Parse results
cat /tmp/db_results.json | jq '.results[] | {id, username, email}'

# Count rows
cat /tmp/db_results.json | jq '.results | length'

# Filter results
cat /tmp/db_results.json | jq '.results[] | select(.role == "admin")'
```

**Phase 5: Cleanup**
```bash
rm -f /tmp/db_results.json
deactivate
rm -rf /tmp/workflow-scripts/workflow-db-005
```

---

### Example 6: API Rate-Limited Scraper (Python)

**Phase 1: Creation**
```bash
mkdir -p /tmp/workflow-scripts/workflow-ratelimit-006
cd /tmp/workflow-scripts/workflow-ratelimit-006

cat > rate_limited_scraper.py <<'EOF'
import requests
import json
import time
import sys
from datetime import datetime

class RateLimitedScraper:
    def __init__(self, base_url, requests_per_second=1):
        self.base_url = base_url
        self.delay = 1.0 / requests_per_second
        self.last_request_time = 0

    def wait_if_needed(self):
        elapsed = time.time() - self.last_request_time
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)

    def fetch(self, endpoint, params=None):
        self.wait_if_needed()

        url = f"{self.base_url}/{endpoint}"
        response = requests.get(url, params=params)

        self.last_request_time = time.time()
        response.raise_for_status()

        return response.json()

    def fetch_multiple(self, endpoints):
        results = []

        for i, endpoint in enumerate(endpoints):
            try:
                data = self.fetch(endpoint)
                results.append({
                    'endpoint': endpoint,
                    'status': 'success',
                    'data': data,
                    'timestamp': datetime.now().isoformat()
                })
                print(f"Progress: {i+1}/{len(endpoints)}", file=sys.stderr)
            except Exception as e:
                results.append({
                    'endpoint': endpoint,
                    'status': 'error',
                    'error': str(e)
                })

        return results

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python rate_limited_scraper.py <base_url> <endpoint1> [endpoint2] ...",
              file=sys.stderr)
        sys.exit(1)

    base_url = sys.argv[1]
    endpoints = sys.argv[2:]

    scraper = RateLimitedScraper(base_url, requests_per_second=2)
    results = scraper.fetch_multiple(endpoints)

    output = {
        'status': 'success',
        'base_url': base_url,
        'total_endpoints': len(endpoints),
        'successful': sum(1 for r in results if r['status'] == 'success'),
        'failed': sum(1 for r in results if r['status'] == 'error'),
        'results': results
    }

    print(json.dumps(output, indent=2))
EOF

chmod 700 rate_limited_scraper.py
```

**Phase 2: Dependencies**
```bash
cat > requirements.txt <<EOF
requests==2.31.0
EOF

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Phase 3: Execution**
```bash
source venv/bin/activate
python rate_limited_scraper.py \
    "https://api.github.com" \
    "users/octocat" \
    "users/torvalds" \
    "users/gvanrossum" \
    > /tmp/scraper_output.json 2> /tmp/scraper_progress.txt
```

**Phase 4: Output Processing**
```bash
# Check progress
tail -f /tmp/scraper_progress.txt

# After completion, analyze results
cat /tmp/scraper_output.json | jq '{total: .total_endpoints, successful: .successful, failed: .failed}'

# Extract successful results
cat /tmp/scraper_output.json | jq '.results[] | select(.status == "success") | .data.login'

# Find errors
cat /tmp/scraper_output.json | jq '.results[] | select(.status == "error")'
```

**Phase 5: Cleanup**
```bash
rm -f /tmp/scraper_output.json /tmp/scraper_progress.txt
deactivate
rm -rf /tmp/workflow-scripts/workflow-ratelimit-006
```

---

### Example 7: Multi-Format Data Converter (Python)

**Phase 1: Creation**
```bash
mkdir -p /tmp/workflow-scripts/workflow-converter-007
cd /tmp/workflow-scripts/workflow-converter-007

cat > data_converter.py <<'EOF'
import pandas as pd
import json
import yaml
import xml.etree.ElementTree as ET
import sys
from pathlib import Path

def csv_to_json(input_file, output_file):
    df = pd.read_csv(input_file)
    df.to_json(output_file, orient='records', indent=2)
    return len(df)

def json_to_csv(input_file, output_file):
    df = pd.read_json(input_file)
    df.to_csv(output_file, index=False)
    return len(df)

def json_to_yaml(input_file, output_file):
    with open(input_file) as f:
        data = json.load(f)
    with open(output_file, 'w') as f:
        yaml.dump(data, f, default_flow_style=False)
    return len(data) if isinstance(data, list) else 1

def yaml_to_json(input_file, output_file):
    with open(input_file) as f:
        data = yaml.safe_load(f)
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    return len(data) if isinstance(data, list) else 1

def convert(input_file, output_file, conversion_type):
    conversions = {
        'csv_to_json': csv_to_json,
        'json_to_csv': json_to_csv,
        'json_to_yaml': json_to_yaml,
        'yaml_to_json': yaml_to_json
    }

    if conversion_type not in conversions:
        raise ValueError(f"Unknown conversion type: {conversion_type}")

    rows = conversions[conversion_type](input_file, output_file)

    return {
        'status': 'success',
        'conversion': conversion_type,
        'input': input_file,
        'output': output_file,
        'rows_processed': rows,
        'output_size': Path(output_file).stat().st_size
    }

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: python data_converter.py <input> <output> <conversion_type>",
              file=sys.stderr)
        print("Types: csv_to_json, json_to_csv, json_to_yaml, yaml_to_json",
              file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    conversion_type = sys.argv[3]

    try:
        result = convert(input_file, output_file, conversion_type)
        print(json.dumps(result, indent=2))
    except Exception as e:
        error = {
            'status': 'error',
            'message': str(e)
        }
        print(json.dumps(error, indent=2), file=sys.stderr)
        sys.exit(1)
EOF

chmod 700 data_converter.py
```

**Phase 2: Dependencies**
```bash
cat > requirements.txt <<EOF
pandas==2.1.3
PyYAML==6.0.1
EOF

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Phase 3: Execution**
```bash
# Create sample CSV
cat > /tmp/sample.csv <<EOF
id,name,department,salary
1,Alice,Engineering,90000
2,Bob,Marketing,75000
3,Carol,Engineering,95000
EOF

# Convert CSV to JSON
source venv/bin/activate
python data_converter.py /tmp/sample.csv /tmp/output.json csv_to_json > /tmp/conversion_result.json

# Convert JSON to YAML
python data_converter.py /tmp/output.json /tmp/output.yaml json_to_yaml
```

**Phase 4: Output Processing**
```bash
# Check conversion result
cat /tmp/conversion_result.json | jq '{status, rows: .rows_processed, size: .output_size}'

# Verify output
cat /tmp/output.json | jq '.'
cat /tmp/output.yaml

# Further processing
cat /tmp/output.json | jq '.[] | select(.salary > 80000)'
```

**Phase 5: Cleanup**
```bash
rm -f /tmp/sample.csv /tmp/output.json /tmp/output.yaml /tmp/conversion_result.json
deactivate
rm -rf /tmp/workflow-scripts/workflow-converter-007
```

---

## Troubleshooting

### Script Not Found Errors

**Error:**
```
bash: /tmp/workflow-scripts/workflow-12345/script.py: No such file or directory
```

**Solutions:**

1. **Verify directory exists:**
```bash
ls -la /tmp/workflow-scripts/workflow-12345/
```

2. **Check script was created:**
```bash
cat /tmp/workflow-scripts/workflow-12345/script.py
```

3. **Verify correct path:**
```bash
# Use absolute path
/tmp/workflow-scripts/workflow-12345/script.py

# Or cd first
cd /tmp/workflow-scripts/workflow-12345 && python script.py
```

4. **Check for typos:**
```bash
# List all files in directory
find /tmp/workflow-scripts/workflow-12345 -type f
```

---

### Permission Denied

**Error:**
```
bash: /tmp/workflow-scripts/workflow-12345/script.py: Permission denied
```

**Solutions:**

1. **Make script executable:**
```bash
chmod +x /tmp/workflow-scripts/workflow-12345/script.py
# or
chmod 700 /tmp/workflow-scripts/workflow-12345/script.py
```

2. **Check current permissions:**
```bash
ls -l /tmp/workflow-scripts/workflow-12345/script.py
```

3. **Run with interpreter explicitly:**
```bash
# Instead of: ./script.py
# Use: python script.py or node script.js
python /tmp/workflow-scripts/workflow-12345/script.py
```

4. **Check file ownership:**
```bash
ls -l /tmp/workflow-scripts/workflow-12345/script.py
# If needed, change ownership
chown $USER /tmp/workflow-scripts/workflow-12345/script.py
```

---

### Dependency Installation Failures

**Error:**
```
ERROR: Could not find a version that satisfies the requirement praw==7.7.1
```

**Solutions:**

1. **Check internet connectivity:**
```bash
ping pypi.org
curl -I https://pypi.org
```

2. **Update package manager:**
```bash
# Python
pip install --upgrade pip

# Node.js
npm install -g npm@latest
```

3. **Use alternative package index:**
```bash
# Python with mirror
pip install -i https://pypi.org/simple -r requirements.txt

# Node.js with different registry
npm install --registry=https://registry.npmjs.org/
```

4. **Install dependencies individually:**
```bash
# If requirements.txt fails, install one by one
pip install praw==7.7.1
pip install pandas==2.1.3
```

5. **Check Python/Node version:**
```bash
python --version  # Should be 3.8+
node --version    # Should be 16+

# Use specific version if needed
python3.11 -m pip install -r requirements.txt
```

6. **Clear cache:**
```bash
# Python
pip cache purge

# Node.js
npm cache clean --force
```

---

### Timeout Errors

**Error:**
```
Script execution exceeded timeout of 120000ms
```

**Solutions:**

1. **Increase timeout in Bash tool:**
```bash
# Use timeout parameter (in milliseconds)
python long_script.py  # with timeout: 600000 (10 minutes)
```

2. **Add progress indicators:**
```python
# In your script
import sys

for i, item in enumerate(large_dataset):
    process(item)
    if i % 100 == 0:
        print(f"Processed {i} items...", file=sys.stderr)
        sys.stderr.flush()
```

3. **Optimize script:**
```python
# Use batch processing
def process_in_batches(items, batch_size=100):
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        process_batch(batch)

# Use streaming instead of loading all data
for line in file:
    process(line)  # Instead of: lines = file.readlines()
```

4. **Split into multiple scripts:**
```bash
# Instead of one long script
python process_step1.py > /tmp/step1.json
python process_step2.py /tmp/step1.json > /tmp/step2.json
```

---

### Output Parsing Errors

**Error:**
```
jq: parse error: Invalid JSON
```

**Solutions:**

1. **Validate JSON output:**
```bash
# Check if output is valid JSON
python script.py > /tmp/output.txt
cat /tmp/output.txt | jq '.' || echo "Invalid JSON"
```

2. **Fix script output:**
```python
# Ensure script only outputs JSON to stdout
import json
import sys

# Debugging output goes to stderr
print("Debug info", file=sys.stderr)

# JSON output goes to stdout
result = {"status": "success"}
print(json.dumps(result))  # Only this to stdout
```

3. **Handle mixed output:**
```bash
# If script outputs text + JSON, extract JSON only
python script.py > /tmp/full_output.txt
grep -A 9999 '{' /tmp/full_output.txt | jq '.'

# Or use tail to get last line if JSON is at end
python script.py | tail -n 1 | jq '.'
```

4. **Check for stderr contamination:**
```bash
# Separate stdout and stderr
python script.py > /tmp/stdout.txt 2> /tmp/stderr.txt
cat /tmp/stdout.txt | jq '.'
```

5. **Validate before parsing:**
```bash
# Check if file is empty
if [ ! -s /tmp/output.json ]; then
    echo "Output file is empty"
    exit 1
fi

# Check if it's valid JSON
if ! jq empty /tmp/output.json 2>/dev/null; then
    echo "Invalid JSON in output"
    cat /tmp/output.json
    exit 1
fi
```

---

### Virtual Environment Issues

**Error:**
```
command not found: python
ModuleNotFoundError: No module named 'praw'
```

**Solutions:**

1. **Always activate venv:**
```bash
cd /tmp/workflow-scripts/workflow-12345
source venv/bin/activate
python script.py
```

2. **Use absolute path to venv python:**
```bash
/tmp/workflow-scripts/workflow-12345/venv/bin/python script.py
```

3. **Verify venv exists:**
```bash
ls -la /tmp/workflow-scripts/workflow-12345/venv/
```

4. **Recreate venv if corrupted:**
```bash
rm -rf /tmp/workflow-scripts/workflow-12345/venv
python3 -m venv /tmp/workflow-scripts/workflow-12345/venv
source /tmp/workflow-scripts/workflow-12345/venv/bin/activate
pip install -r requirements.txt
```

---

### Environment Variable Issues

**Error:**
```
KeyError: 'REDDIT_CLIENT_ID'
None is not a valid value
```

**Solutions:**

1. **Verify .env file exists:**
```bash
cat /tmp/workflow-scripts/workflow-12345/.env
```

2. **Check variable loading:**
```python
# Add debug output
import os
from dotenv import load_dotenv

load_dotenv()
print(f"CLIENT_ID loaded: {os.getenv('REDDIT_CLIENT_ID') is not None}", file=sys.stderr)
```

3. **Use explicit .env path:**
```python
from dotenv import load_dotenv
from pathlib import Path

env_path = Path('/tmp/workflow-scripts/workflow-12345/.env')
load_dotenv(dotenv_path=env_path)
```

4. **Pass variables directly:**
```bash
# Instead of .env file
REDDIT_CLIENT_ID="abc123" REDDIT_CLIENT_SECRET="xyz789" python script.py
```

---

### Cleanup Failures

**Error:**
```
rm: /tmp/workflow-scripts/workflow-12345: Directory not empty
```

**Solutions:**

1. **Force recursive removal:**
```bash
rm -rf /tmp/workflow-scripts/workflow-12345
```

2. **Check for processes using files:**
```bash
# macOS
lsof +D /tmp/workflow-scripts/workflow-12345

# Linux
fuser -v /tmp/workflow-scripts/workflow-12345
```

3. **Deactivate venv first:**
```bash
deactivate
rm -rf /tmp/workflow-scripts/workflow-12345
```

4. **Remove files individually:**
```bash
rm -f /tmp/workflow-scripts/workflow-12345/*
rm -rf /tmp/workflow-scripts/workflow-12345/venv
rmdir /tmp/workflow-scripts/workflow-12345
```

---

## Best Practices Summary

1. **Always use virtual environments** for Python scripts
2. **Pin exact dependency versions** for reproducibility
3. **Separate stdout and stderr** for clean output parsing
4. **Use structured output** (JSON) for programmatic processing
5. **Handle errors gracefully** with proper exit codes
6. **Clean up temporary files** after workflow completion
7. **Set appropriate timeouts** based on expected runtime
8. **Use progress indicators** for long-running scripts
9. **Validate output** before parsing
10. **Test scripts independently** before integrating into workflows

---

## Quick Reference

**Create script directory:**
```bash
mkdir -p /tmp/workflow-scripts/workflow-{id}
```

**Python virtual environment:**
```bash
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

**Execute with output capture:**
```bash
python script.py > /tmp/output.json 2> /tmp/errors.txt
```

**Parse JSON output:**
```bash
cat /tmp/output.json | jq '.results[] | {key1, key2}'
```

**Cleanup:**
```bash
deactivate && rm -rf /tmp/workflow-scripts/workflow-{id}
```
