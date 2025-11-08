# Workflow Integration Patterns for Temporary Scripts

Complete patterns for integrating temporary scripts into orchestration workflows.

## Pattern Categories

1. [Basic Patterns](#basic-patterns) - Simple script execution
2. [Data Collection Patterns](#data-collection-patterns) - API data fetching
3. [Processing Patterns](#processing-patterns) - Data transformation pipelines
4. [Integration Patterns](#integration-patterns) - Multi-service orchestration
5. [Advanced Patterns](#advanced-patterns) - Complex workflow scenarios

---

## Basic Patterns

### Pattern 1: Simple Script Execution

**Use Case**: Execute a single script and process results

**Workflow**:
```flow
general-purpose:"Create data_fetcher.py script":script_path ->
Bash:"python3 {script_path}":data ->
general-purpose:"Parse and analyze {data}":results
```

**Script** (`data_fetcher.py`):
```python
#!/usr/bin/env python3
import json
import requests

response = requests.get('https://api.example.com/data')
print(json.dumps(response.json()))
```

**Data Flow**:
```
workflow → create script → execute → capture output → process results
```

**Error Handling**:
```flow
Bash:"python3 {script_path} 2>&1":output ->
(if output.contains('Error'))~>
  @review-error:"Script failed: {output}" ~>
(if output.success)~>
  general-purpose:"Process {output}"
```

---

### Pattern 2: Script with User Input

**Use Case**: Script needs user-provided credentials or parameters

**Workflow**:
```flow
AskUserQuestion:"API credentials needed":api_key ->
general-purpose:"Create reddit_client.py with {api_key}":script ->
Bash:"python3 {script} programming 10":posts ->
general-purpose:"Extract titles from {posts}":titles
```

**Script** (`reddit_client.py`):
```python
#!/usr/bin/env python3
import sys
import json
import requests

api_key = sys.argv[1]
subreddit = sys.argv[2]
limit = sys.argv[3]

headers = {'Authorization': f'Bearer {api_key}'}
response = requests.get(
    f'https://oauth.reddit.com/r/{subreddit}/hot.json?limit={limit}',
    headers=headers
)

print(json.dumps(response.json()))
```

**Data Flow**:
```
user input → embed in script → execute with args → parse output → use data
```

**Example Output**:
```json
{
  "data": {
    "children": [
      {"data": {"title": "Post 1", "url": "...", "score": 100}},
      {"data": {"title": "Post 2", "url": "...", "score": 85}}
    ]
  }
}
```

---

### Pattern 3: Script with Error Handling

**Use Case**: Robust execution with retry logic

**Workflow**:
```flow
@attempt ->
general-purpose:"Create api_client.py":script ->
Bash:"python3 {script}":result ->

(if result.contains('RateLimit'))~>
  general-purpose:"Wait 60 seconds" ->
  @attempt ~>

(if result.contains('Error') AND attempts < 3)~>
  @attempt ~>

(if result.success)~>
  general-purpose:"Process {result}"
```

**Script** (`api_client.py`):
```python
#!/usr/bin/env python3
import json
import sys

try:
    # API call logic
    result = fetch_data()
    print(json.dumps({"status": "success", "data": result}))
except RateLimitError as e:
    print(json.dumps({"status": "error", "type": "RateLimit", "message": str(e)}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"status": "error", "type": "Unknown", "message": str(e)}))
    sys.exit(1)
```

---

## Data Collection Patterns

### Pattern 4: Single API Data Fetch

**Use Case**: Fetch data from one API source

**Workflow**:
```flow
AskUserQuestion:"GitHub token needed":token ->

general-purpose:"Create github_fetcher.py with {token}":script ->

Bash:"python3 {script} anthropics claude-code":repo_data ->

general-purpose:"Parse {repo_data} and extract: stars, forks, issues":stats ->

general-purpose:"Create summary report of {stats}":report
```

**Script** (`github_fetcher.py`):
```python
#!/usr/bin/env python3
import sys
import json
import requests

token = sys.argv[1]
owner = sys.argv[2]
repo = sys.argv[3]

headers = {'Authorization': f'token {token}'}
response = requests.get(
    f'https://api.github.com/repos/{owner}/{repo}',
    headers=headers
)

data = response.json()
print(json.dumps({
    "name": data['name'],
    "stars": data['stargazers_count'],
    "forks": data['forks_count'],
    "issues": data['open_issues_count'],
    "language": data['language']
}))
```

---

### Pattern 5: Multiple API Parallel Fetching

**Use Case**: Collect data from multiple sources simultaneously

**Workflow**:
```flow
AskUserQuestion:"API credentials":creds ->

general-purpose:"Create reddit_client.py":reddit_script ->
general-purpose:"Create twitter_client.py":twitter_script ->
general-purpose:"Create github_client.py":github_script ->

[
  Bash:"python3 {reddit_script} {creds.reddit}":reddit_data ||
  Bash:"node {twitter_script} {creds.twitter}":twitter_data ||
  Bash:"python3 {github_script} {creds.github}":github_data
] ->

general-purpose:"Merge {reddit_data}, {twitter_data}, {github_data}":combined ->

general-purpose:"Analyze combined social metrics":insights
```

**Data Flow**:
```
credentials
    ↓
create 3 scripts in parallel
    ↓
execute 3 scripts in parallel
    ↓
    ┌──────────┬──────────┬──────────┐
reddit_data  twitter_data  github_data
    └──────────┴──────────┴──────────┘
                    ↓
            merge all sources
                    ↓
               analyze
```

---

### Pattern 6: Paginated Data Collection

**Use Case**: Fetch all pages of data from API

**Workflow**:
```flow
general-purpose:"Create paginated_fetcher.py":script ->

@fetch_page ->
Bash:"python3 {script} {page_num}":page_data ->

general-purpose:"Parse {page_data}":parsed ->

(if parsed.has_next_page)~>
  general-purpose:"Increment page number":page_num ->
  @fetch_page ~>

(if parsed.is_last_page)~>
  general-purpose:"Combine all pages":all_data ->
  general-purpose:"Process {all_data}"
```

**Script** (`paginated_fetcher.py`):
```python
#!/usr/bin/env python3
import sys
import json
import requests

page = int(sys.argv[1])

response = requests.get(f'https://api.example.com/data?page={page}')
data = response.json()

print(json.dumps({
    "items": data['items'],
    "page": page,
    "has_next": data.get('next') is not None,
    "total_pages": data.get('total_pages', 1)
}))
```

---

## Processing Patterns

### Pattern 7: Sequential Processing Pipeline

**Use Case**: Multi-stage data transformation

**Workflow**:
```flow
# Stage 1: Fetch raw data
general-purpose:"Create data_fetcher.py":fetcher ->
Bash:"python3 {fetcher}":raw_data ->

# Stage 2: Clean data
general-purpose:"Create data_cleaner.py":cleaner ->
Bash:"python3 {cleaner} <<< '{raw_data}'":clean_data ->

# Stage 3: Transform data
general-purpose:"Create data_transformer.py":transformer ->
Bash:"python3 {transformer} <<< '{clean_data}'":transformed ->

# Stage 4: Aggregate results
general-purpose:"Create aggregator.py":aggregator ->
Bash:"python3 {aggregator} <<< '{transformed}'":final_report
```

**Data Flow**:
```
raw_data → clean_data → transformed → final_report
```

---

### Pattern 8: Parallel Data Processing

**Use Case**: Process different data types simultaneously

**Workflow**:
```flow
general-purpose:"Fetch dataset":dataset ->

general-purpose:"Create csv_processor.py":csv_proc ->
general-purpose:"Create json_processor.py":json_proc ->
general-purpose:"Create xml_processor.py":xml_proc ->

[
  Bash:"python3 {csv_proc} {dataset.csv}":csv_results ||
  Bash:"python3 {json_proc} {dataset.json}":json_results ||
  Bash:"python3 {xml_proc} {dataset.xml}":xml_results
] ->

general-purpose:"Merge {csv_results}, {json_results}, {xml_results}":combined ->

general-purpose:"Generate unified report":report
```

---

### Pattern 9: Batch Processing with Iteration

**Use Case**: Process large datasets in batches

**Workflow**:
```flow
general-purpose:"Split dataset into batches":batches ->

@process_batch ->
general-purpose:"Get next batch":current_batch ->

general-purpose:"Create batch_processor.py":processor ->
Bash:"python3 {processor} <<< '{current_batch}'":batch_result ->

general-purpose:"Store {batch_result}":stored ->

(if batches.has_more)~>
  @process_batch ~>

(if batches.complete)~>
  general-purpose:"Combine all batch results":final_results
```

**Script** (`batch_processor.py`):
```python
#!/usr/bin/env python3
import json
import sys

# Read batch from stdin
batch = json.load(sys.stdin)

# Process each item
results = []
for item in batch['items']:
    processed = process_item(item)
    results.append(processed)

print(json.dumps({
    "batch_id": batch['id'],
    "processed_count": len(results),
    "results": results
}))
```

---

## Integration Patterns

### Pattern 10: Multi-Service Orchestration

**Use Case**: Coordinate multiple services in workflow

**Workflow**:
```flow
# Collect from multiple sources
[
  Bash:"python3 reddit_api.py":reddit ||
  Bash:"python3 twitter_api.py":twitter ||
  Bash:"python3 github_api.py":github
] ->

# Process each source
general-purpose:"Analyze {reddit}":reddit_insights ->
general-purpose:"Analyze {twitter}":twitter_insights ->
general-purpose:"Analyze {github}":github_insights ->

# Cross-reference data
general-purpose:"Create cross_referencer.py":cross_ref ->
Bash:"python3 {cross_ref} {reddit_insights} {twitter_insights} {github_insights}":connections ->

# Store in database
general-purpose:"Create db_writer.py":db_writer ->
Bash:"python3 {db_writer} <<< '{connections}'":stored ->

# Generate report
general-purpose:"Create report_generator.py":reporter ->
Bash:"python3 {reporter} {stored}":final_report
```

---

### Pattern 11: ETL Pipeline

**Use Case**: Extract, Transform, Load data pipeline

**Workflow**:
```flow
# EXTRACT
general-purpose:"Create extractors for multiple sources":extractors ->

[
  Bash:"python3 {extractors.postgres}":pg_data ||
  Bash:"python3 {extractors.mongodb}":mongo_data ||
  Bash:"python3 {extractors.api}":api_data
] ->

# TRANSFORM
general-purpose:"Create transformer.py":transformer ->
Bash:"python3 {transformer} {pg_data} {mongo_data} {api_data}":transformed ->

@review-transformation:"Check {transformed} quality" ->

# LOAD
general-purpose:"Create loader.py":loader ->
Bash:"python3 {loader} <<< '{transformed}'":loaded ->

general-purpose:"Verify {loaded} data integrity":verification
```

**Transform Script** (`transformer.py`):
```python
#!/usr/bin/env python3
import json
import sys

def transform_data(sources):
    """Transform data from multiple sources into unified format"""
    transformed = []

    for source in sources:
        for item in source['data']:
            transformed.append({
                "id": generate_id(item),
                "source": source['name'],
                "normalized_data": normalize(item),
                "metadata": extract_metadata(item)
            })

    return transformed

# Read all sources
sources = json.load(sys.stdin)
result = transform_data(sources)
print(json.dumps(result))
```

---

### Pattern 12: Real-Time Data Streaming

**Use Case**: Process streaming data with temp scripts

**Workflow**:
```flow
# Start stream listener
general-purpose:"Create stream_listener.py":listener ->
Bash:"python3 {listener} & echo $!":listener_pid ->

# Process stream in batches
@process_stream ->
Bash:"python3 read_stream_buffer.py":batch ->

(if batch.has_data)~>
  general-purpose:"Create batch_processor.py":processor ->
  Bash:"python3 {processor} <<< '{batch}'":processed ->
  general-purpose:"Store {processed}":stored ->
  @process_stream ~>

(if batch.stream_ended)~>
  Bash:"kill {listener_pid}":stopped ->
  general-purpose:"Generate final report"
```

---

## Advanced Patterns

### Pattern 13: Conditional Script Execution

**Use Case**: Execute different scripts based on workflow state

**Workflow**:
```flow
general-purpose:"Analyze requirements":reqs ->

(if reqs.type == 'api')~>
  general-purpose:"Create api_client.py":script ->
  Bash:"python3 {script} {reqs.params}":data ~>

(if reqs.type == 'scraping')~>
  general-purpose:"Create web_scraper.py":script ->
  Bash:"python3 {script} {reqs.url}":data ~>

(if reqs.type == 'database')~>
  general-purpose:"Create db_query.py":script ->
  Bash:"python3 {script} {reqs.query}":data ->

general-purpose:"Process {data} regardless of source"
```

---

### Pattern 14: Retry with Exponential Backoff

**Use Case**: Resilient API calls with increasing wait times

**Workflow**:
```flow
general-purpose:"Set attempt=1, delay=1":state ->

@retry ->
general-purpose:"Create api_client.py":script ->
Bash:"python3 {script}":result ->

(if result.failed AND state.attempt < 5)~>
  general-purpose:"Calculate backoff: delay * 2":new_delay ->
  general-purpose:"Wait {new_delay} seconds" ->
  general-purpose:"Increment attempt, update delay":state ->
  @retry ~>

(if result.failed AND state.attempt >= 5)~>
  @max-retries-reached:"Failed after 5 attempts" ~>

(if result.success)~>
  general-purpose:"Process {result}"
```

**Script with Detailed Error Info**:
```python
#!/usr/bin/env python3
import json
import sys
import requests

try:
    response = requests.get('https://api.example.com/data', timeout=10)
    response.raise_for_status()
    print(json.dumps({
        "status": "success",
        "data": response.json()
    }))
except requests.exceptions.Timeout:
    print(json.dumps({
        "status": "error",
        "type": "timeout",
        "retryable": True
    }))
    sys.exit(1)
except requests.exceptions.HTTPError as e:
    print(json.dumps({
        "status": "error",
        "type": "http_error",
        "code": e.response.status_code,
        "retryable": e.response.status_code in [429, 500, 502, 503]
    }))
    sys.exit(1)
```

---

### Pattern 15: Dynamic Script Generation

**Use Case**: Generate scripts based on workflow state

**Workflow**:
```flow
general-purpose:"Analyze user requirements":requirements ->

general-purpose:"Generate script template based on {requirements}":template ->

general-purpose:"Inject parameters into {template}":custom_script ->

Bash:"python3 {custom_script}":result ->

general-purpose:"Validate {result} meets {requirements}":validation ->

(if validation.passed)~>
  general-purpose:"Save {custom_script} as template for reuse" ~>

(if validation.failed)~>
  general-purpose:"Refine {template} based on errors" ->
  @retry-generation
```

**Template Generation Example**:
```python
def generate_api_client(requirements):
    """Generate custom API client based on requirements"""

    template = f'''#!/usr/bin/env python3
import requests
import json
import sys

def fetch_data():
    response = requests.{requirements['method'].lower()}(
        "{requirements['endpoint']}",
        headers={requirements.get('headers', {})},
        params={requirements.get('params', {})}
    )
    return response.json()

if __name__ == "__main__":
    try:
        data = fetch_data()
        print(json.dumps({{"status": "success", "data": data}}))
    except Exception as e:
        print(json.dumps({{"status": "error", "message": str(e)}}))
        sys.exit(1)
'''
    return template
```

---

## Pattern Comparison Matrix

| Pattern | Complexity | Use Case | Scripts | Error Handling |
|---------|-----------|----------|---------|----------------|
| Simple Execution | Low | Single task | 1 | Basic |
| User Input | Low | Needs credentials | 1 | Basic |
| Error Handling | Medium | Production use | 1 | Advanced |
| Single API Fetch | Low | One source | 1 | Medium |
| Parallel Fetching | Medium | Multiple sources | 3+ | Medium |
| Paginated Collection | Medium | Large datasets | 1 | Medium |
| Sequential Pipeline | Medium | Multi-stage | 3-5 | Medium |
| Parallel Processing | Medium | Different types | 3+ | Medium |
| Batch Processing | High | Very large data | 1-2 | Advanced |
| Multi-Service | High | Complex integration | 5+ | Advanced |
| ETL Pipeline | High | Data warehouse | 3+ | Advanced |
| Streaming | High | Real-time data | 2+ | Advanced |
| Conditional | Medium | Dynamic flow | 2-3 | Medium |
| Retry Backoff | Medium | Resilient calls | 1 | Advanced |
| Dynamic Generation | High | Custom needs | Generated | Advanced |

---

## Real-World Example: Social Media Analytics

**Complete workflow combining multiple patterns:**

```flow
# Phase 1: Credentials Collection
AskUserQuestion:"Social media API keys":keys ->

# Phase 2: Create Scripts
general-purpose:"Create reddit_analyzer.py with {keys.reddit}":reddit_script ->
general-purpose:"Create twitter_analyzer.py with {keys.twitter}":twitter_script ->
general-purpose:"Create github_analyzer.py with {keys.github}":github_script ->

# Phase 3: Parallel Data Collection
[
  Bash:"python3 {reddit_script} python programming 50":reddit_data ||
  Bash:"python3 {twitter_script} #python #programming 50":twitter_data ||
  Bash:"python3 {github_script} python topics/machine-learning":github_data
] ->

# Phase 4: Data Cleaning (Sequential)
general-purpose:"Create data_cleaner.py":cleaner ->
Bash:"python3 {cleaner} {reddit_data}":clean_reddit ->
Bash:"python3 {cleaner} {twitter_data}":clean_twitter ->
Bash:"python3 {cleaner} {github_data}":clean_github ->

# Phase 5: Analysis
general-purpose:"Create sentiment_analyzer.py":sentiment ->
[
  Bash:"python3 {sentiment} <<< '{clean_reddit}'":reddit_sentiment ||
  Bash:"python3 {sentiment} <<< '{clean_twitter}'":twitter_sentiment ||
  Bash:"python3 {sentiment} <<< '{clean_github}'":github_sentiment
] ->

# Phase 6: Cross-Platform Insights
general-purpose:"Create cross_analyzer.py":cross ->
Bash:"python3 {cross} {reddit_sentiment} {twitter_sentiment} {github_sentiment}":insights ->

# Phase 7: Report Generation
general-purpose:"Create report_generator.py":reporter ->
Bash:"python3 {reporter} <<< '{insights}'":final_report ->

# Phase 8: Review
@review-report:"Check {final_report}" ->

# Phase 9: Cleanup (automatic)
general-purpose:"Remove all temp scripts"
```

**This workflow demonstrates:**
- User input collection
- Parallel script execution
- Sequential processing
- Error handling at each stage
- Automatic cleanup
- Review checkpoints

---

## Best Practices Summary

1. **Always validate script output** before using in workflow
2. **Use JSON for structured data** exchange
3. **Handle errors gracefully** with proper exit codes
4. **Set timeouts** for long-running scripts
5. **Clean up after workflow** completion
6. **Use virtual environments** for Python
7. **Pin dependency versions** exactly
8. **Pass credentials securely** (args/env vars, never hardcoded)
9. **Log script execution** for debugging
10. **Test scripts independently** before workflow integration

---

**Need help implementing a pattern? Just describe your use case!**
