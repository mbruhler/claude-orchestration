# Script Templates Library

Ready-to-use script templates for temporary agents in workflows.

---

## 1. API Clients

### REST API Client (Generic)

**Purpose**: Generic HTTP client for REST API interactions with authentication and error handling

**Language**: Python

**Dependencies**:
```
requests==2.31.0
```

**Code**:
```python
import requests
import json
import sys

def main():
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())

    url = input_data.get('url')
    method = input_data.get('method', 'GET').upper()
    headers = input_data.get('headers', {})
    params = input_data.get('params', {})
    body = input_data.get('body', None)
    auth = input_data.get('auth', None)

    try:
        # Prepare authentication
        auth_tuple = None
        if auth and 'username' in auth and 'password' in auth:
            auth_tuple = (auth['username'], auth['password'])

        # Make request
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=body if body else None,
            auth=auth_tuple,
            timeout=30
        )

        response.raise_for_status()

        # Output response
        result = {
            'status_code': response.status_code,
            'headers': dict(response.headers),
            'body': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }

        print(json.dumps(result))

    except requests.exceptions.RequestException as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow api-integration
  agent rest-api-client {
    type: temp-script
    language: python
    script: "./scripts/rest-client.py"
    dependencies: ["requests==2.31.0"]
  }

  rest-api-client(
    url="https://api.example.com/users",
    method="POST",
    headers={"Content-Type": "application/json"},
    body={"name": "John", "email": "john@example.com"}
  )
end
```

**Input**:
- `url` (string): API endpoint URL
- `method` (string): HTTP method (GET, POST, PUT, DELETE, etc.)
- `headers` (object): HTTP headers
- `params` (object): Query parameters
- `body` (object): Request body
- `auth` (object): {username, password} for basic auth

**Output**:
```json
{
  "status_code": 200,
  "headers": {"content-type": "application/json"},
  "body": {"id": 123, "name": "John"}
}
```

---

### GraphQL Client

**Purpose**: Execute GraphQL queries and mutations with variable support

**Language**: Node.js

**Dependencies**:
```
graphql-request@6.1.0
```

**Code**:
```javascript
const { GraphQLClient } = require('graphql-request');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    try {
      const { endpoint, query, variables = {}, headers = {} } = JSON.parse(input);

      const client = new GraphQLClient(endpoint, { headers });
      const data = await client.request(query, variables);

      console.log(JSON.stringify({ success: true, data }));
    } catch (error) {
      console.error(JSON.stringify({
        error: error.message,
        details: error.response?.errors
      }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow graphql-query
  agent gql-client {
    type: temp-script
    language: node
    script: "./scripts/graphql-client.js"
    dependencies: ["graphql-request@6.1.0"]
  }

  gql-client(
    endpoint="https://api.example.com/graphql",
    query="query GetUser($id: ID!) { user(id: $id) { name email } }",
    variables={"id": "123"},
    headers={"Authorization": "Bearer token"}
  )
end
```

**Input**:
- `endpoint` (string): GraphQL API endpoint
- `query` (string): GraphQL query or mutation
- `variables` (object): Query variables
- `headers` (object): HTTP headers

**Output**:
```json
{
  "success": true,
  "data": {
    "user": {"name": "John", "email": "john@example.com"}
  }
}
```

---

### Reddit API Client

**Purpose**: Fetch posts, comments, and user data from Reddit

**Language**: Python

**Dependencies**:
```
praw==7.7.1
```

**Code**:
```python
import praw
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    client_id = input_data['client_id']
    client_secret = input_data['client_secret']
    user_agent = input_data.get('user_agent', 'script:v1.0')
    action = input_data['action']

    try:
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )

        result = {}

        if action == 'get_subreddit_posts':
            subreddit = reddit.subreddit(input_data['subreddit'])
            limit = input_data.get('limit', 10)
            sort = input_data.get('sort', 'hot')

            posts = []
            submission_list = getattr(subreddit, sort)(limit=limit)

            for submission in submission_list:
                posts.append({
                    'id': submission.id,
                    'title': submission.title,
                    'author': str(submission.author),
                    'score': submission.score,
                    'url': submission.url,
                    'created_utc': submission.created_utc,
                    'num_comments': submission.num_comments,
                    'selftext': submission.selftext
                })

            result = {'posts': posts}

        elif action == 'get_comments':
            submission = reddit.submission(id=input_data['submission_id'])
            submission.comments.replace_more(limit=0)

            comments = []
            for comment in submission.comments.list():
                comments.append({
                    'id': comment.id,
                    'author': str(comment.author),
                    'body': comment.body,
                    'score': comment.score,
                    'created_utc': comment.created_utc
                })

            result = {'comments': comments}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow reddit-scraper
  agent reddit-client {
    type: temp-script
    language: python
    script: "./scripts/reddit-client.py"
    dependencies: ["praw==7.7.1"]
  }

  reddit-client(
    client_id="your_client_id",
    client_secret="your_secret",
    action="get_subreddit_posts",
    subreddit="python",
    sort="hot",
    limit=25
  )
end
```

**Input**:
- `client_id` (string): Reddit API client ID
- `client_secret` (string): Reddit API client secret
- `user_agent` (string): User agent string
- `action` (string): "get_subreddit_posts" or "get_comments"
- `subreddit` (string): Subreddit name (for posts)
- `submission_id` (string): Post ID (for comments)
- `limit` (number): Number of items to fetch
- `sort` (string): "hot", "new", "top", "rising"

**Output**:
```json
{
  "posts": [
    {
      "id": "abc123",
      "title": "Example Post",
      "author": "username",
      "score": 1234,
      "url": "https://reddit.com/...",
      "created_utc": 1234567890,
      "num_comments": 42,
      "selftext": "Post content..."
    }
  ]
}
```

---

### Twitter/X API Client

**Purpose**: Post tweets, fetch timeline, search tweets

**Language**: Python

**Dependencies**:
```
tweepy==4.14.0
```

**Code**:
```python
import tweepy
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    api_key = input_data['api_key']
    api_secret = input_data['api_secret']
    access_token = input_data['access_token']
    access_token_secret = input_data['access_token_secret']
    action = input_data['action']

    try:
        client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret
        )

        result = {}

        if action == 'post_tweet':
            response = client.create_tweet(text=input_data['text'])
            result = {'tweet_id': response.data['id']}

        elif action == 'search_tweets':
            query = input_data['query']
            max_results = input_data.get('max_results', 10)

            tweets = client.search_recent_tweets(
                query=query,
                max_results=max_results,
                tweet_fields=['created_at', 'author_id', 'public_metrics']
            )

            result = {
                'tweets': [
                    {
                        'id': tweet.id,
                        'text': tweet.text,
                        'created_at': str(tweet.created_at),
                        'author_id': tweet.author_id,
                        'metrics': tweet.public_metrics
                    }
                    for tweet in tweets.data
                ]
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow twitter-bot
  agent twitter-client {
    type: temp-script
    language: python
    script: "./scripts/twitter-client.py"
    dependencies: ["tweepy==4.14.0"]
  }

  twitter-client(
    api_key="key",
    api_secret="secret",
    access_token="token",
    access_token_secret="token_secret",
    action="post_tweet",
    text="Hello from workflow!"
  )
end
```

**Input**:
- `api_key`, `api_secret`, `access_token`, `access_token_secret` (strings): Twitter API credentials
- `action` (string): "post_tweet", "search_tweets"
- `text` (string): Tweet text (for posting)
- `query` (string): Search query (for search)
- `max_results` (number): Max tweets to return

**Output**:
```json
{
  "tweets": [
    {
      "id": "1234567890",
      "text": "Tweet content",
      "created_at": "2025-01-08T10:00:00",
      "author_id": "9876543210",
      "metrics": {"retweet_count": 10, "like_count": 25}
    }
  ]
}
```

---

### GitHub API Client

**Purpose**: Interact with GitHub repositories, issues, and pull requests

**Language**: Node.js

**Dependencies**:
```
@octokit/rest@20.0.2
```

**Code**:
```javascript
const { Octokit } = require('@octokit/rest');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    try {
      const { token, action, owner, repo, ...params } = JSON.parse(input);

      const octokit = new Octokit({ auth: token });

      let result = {};

      switch (action) {
        case 'list_repos':
          const repos = await octokit.rest.repos.listForAuthenticatedUser({
            per_page: params.per_page || 30
          });
          result = { repositories: repos.data.map(r => ({
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            stars: r.stargazers_count,
            url: r.html_url
          }))};
          break;

        case 'create_issue':
          const issue = await octokit.rest.issues.create({
            owner,
            repo,
            title: params.title,
            body: params.body,
            labels: params.labels || []
          });
          result = { issue_number: issue.data.number, url: issue.data.html_url };
          break;

        case 'list_issues':
          const issues = await octokit.rest.issues.listForRepo({
            owner,
            repo,
            state: params.state || 'open',
            per_page: params.per_page || 30
          });
          result = { issues: issues.data.map(i => ({
            number: i.number,
            title: i.title,
            state: i.state,
            created_at: i.created_at,
            url: i.html_url
          }))};
          break;

        case 'get_file':
          const file = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: params.path
          });
          result = {
            name: file.data.name,
            path: file.data.path,
            content: Buffer.from(file.data.content, 'base64').toString('utf8')
          };
          break;
      }

      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow github-automation
  agent github-client {
    type: temp-script
    language: node
    script: "./scripts/github-client.js"
    dependencies: ["@octokit/rest@20.0.2"]
  }

  github-client(
    token="ghp_token",
    action="create_issue",
    owner="username",
    repo="repository",
    title="Bug report",
    body="Description of the issue",
    labels=["bug", "priority-high"]
  )
end
```

**Input**:
- `token` (string): GitHub personal access token
- `action` (string): "list_repos", "create_issue", "list_issues", "get_file"
- `owner` (string): Repository owner
- `repo` (string): Repository name
- Action-specific parameters

**Output**:
```json
{
  "issue_number": 42,
  "url": "https://github.com/owner/repo/issues/42"
}
```

---

### OpenAI API Client

**Purpose**: Generate text, embeddings, and chat completions

**Language**: Python

**Dependencies**:
```
openai==1.6.1
```

**Code**:
```python
import openai
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    api_key = input_data['api_key']
    action = input_data['action']

    openai.api_key = api_key

    try:
        result = {}

        if action == 'chat_completion':
            response = openai.ChatCompletion.create(
                model=input_data.get('model', 'gpt-4'),
                messages=input_data['messages'],
                temperature=input_data.get('temperature', 0.7),
                max_tokens=input_data.get('max_tokens', 1000)
            )
            result = {
                'content': response.choices[0].message.content,
                'usage': dict(response.usage)
            }

        elif action == 'embeddings':
            response = openai.Embedding.create(
                model=input_data.get('model', 'text-embedding-ada-002'),
                input=input_data['text']
            )
            result = {
                'embedding': response.data[0].embedding,
                'usage': dict(response.usage)
            }

        elif action == 'moderation':
            response = openai.Moderation.create(
                input=input_data['text']
            )
            result = {
                'flagged': response.results[0].flagged,
                'categories': dict(response.results[0].categories)
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow ai-processor
  agent openai-client {
    type: temp-script
    language: python
    script: "./scripts/openai-client.py"
    dependencies: ["openai==1.6.1"]
  }

  openai-client(
    api_key="sk-...",
    action="chat_completion",
    model="gpt-4",
    messages=[
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is 2+2?"}
    ]
  )
end
```

**Input**:
- `api_key` (string): OpenAI API key
- `action` (string): "chat_completion", "embeddings", "moderation"
- `model` (string): Model name
- Action-specific parameters

**Output**:
```json
{
  "content": "2+2 equals 4.",
  "usage": {"prompt_tokens": 15, "completion_tokens": 8, "total_tokens": 23}
}
```

---

### Supabase Client

**Purpose**: Query and manipulate data in Supabase database

**Language**: Node.js

**Dependencies**:
```
@supabase/supabase-js@2.39.0
```

**Code**:
```javascript
const { createClient } = require('@supabase/supabase-js');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    try {
      const { url, key, action, table, ...params } = JSON.parse(input);

      const supabase = createClient(url, key);

      let result = {};

      switch (action) {
        case 'select':
          const { data: selectData, error: selectError } = await supabase
            .from(table)
            .select(params.columns || '*')
            .limit(params.limit || 100);

          if (selectError) throw selectError;
          result = { data: selectData };
          break;

        case 'insert':
          const { data: insertData, error: insertError } = await supabase
            .from(table)
            .insert(params.records)
            .select();

          if (insertError) throw insertError;
          result = { data: insertData };
          break;

        case 'update':
          const { data: updateData, error: updateError } = await supabase
            .from(table)
            .update(params.updates)
            .match(params.match)
            .select();

          if (updateError) throw updateError;
          result = { data: updateData };
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .match(params.match);

          if (deleteError) throw deleteError;
          result = { success: true };
          break;
      }

      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow supabase-sync
  agent supabase-client {
    type: temp-script
    language: node
    script: "./scripts/supabase-client.js"
    dependencies: ["@supabase/supabase-js@2.39.0"]
  }

  supabase-client(
    url="https://your-project.supabase.co",
    key="your-anon-key",
    action="insert",
    table="users",
    records=[{"name": "John", "email": "john@example.com"}]
  )
end
```

**Input**:
- `url` (string): Supabase project URL
- `key` (string): Supabase anon/service key
- `action` (string): "select", "insert", "update", "delete"
- `table` (string): Table name
- Action-specific parameters

**Output**:
```json
{
  "data": [
    {"id": 1, "name": "John", "email": "john@example.com"}
  ]
}
```

---

## 2. Data Processing

### CSV Processor

**Purpose**: Read, transform, and analyze CSV files

**Language**: Python

**Dependencies**:
```
pandas==2.1.4
```

**Code**:
```python
import pandas as pd
import json
import sys
import io

def main():
    input_data = json.loads(sys.stdin.read())

    action = input_data['action']

    try:
        result = {}

        if action == 'read':
            # Read from file or string
            if 'file_path' in input_data:
                df = pd.read_csv(input_data['file_path'])
            else:
                df = pd.read_csv(io.StringIO(input_data['csv_content']))

            result = {
                'rows': len(df),
                'columns': list(df.columns),
                'data': df.to_dict('records')
            }

        elif action == 'filter':
            if 'file_path' in input_data:
                df = pd.read_csv(input_data['file_path'])
            else:
                df = pd.read_csv(io.StringIO(input_data['csv_content']))

            # Apply filters
            for col, value in input_data.get('filters', {}).items():
                df = df[df[col] == value]

            result = {
                'rows': len(df),
                'data': df.to_dict('records')
            }

        elif action == 'aggregate':
            if 'file_path' in input_data:
                df = pd.read_csv(input_data['file_path'])
            else:
                df = pd.read_csv(io.StringIO(input_data['csv_content']))

            group_by = input_data['group_by']
            agg_func = input_data.get('function', 'sum')
            agg_column = input_data['column']

            grouped = df.groupby(group_by)[agg_column].agg(agg_func)

            result = {
                'aggregation': grouped.to_dict()
            }

        elif action == 'transform':
            if 'file_path' in input_data:
                df = pd.read_csv(input_data['file_path'])
            else:
                df = pd.read_csv(io.StringIO(input_data['csv_content']))

            # Apply transformations
            for col, operation in input_data.get('transformations', {}).items():
                if operation['type'] == 'rename':
                    df.rename(columns={col: operation['new_name']}, inplace=True)
                elif operation['type'] == 'multiply':
                    df[col] = df[col] * operation['factor']
                elif operation['type'] == 'uppercase':
                    df[col] = df[col].str.upper()

            result = {
                'data': df.to_dict('records')
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow csv-analysis
  agent csv-processor {
    type: temp-script
    language: python
    script: "./scripts/csv-processor.py"
    dependencies: ["pandas==2.1.4"]
  }

  csv-processor(
    action="filter",
    file_path="/data/sales.csv",
    filters={"region": "North", "year": 2024}
  )
end
```

**Input**:
- `action` (string): "read", "filter", "aggregate", "transform"
- `file_path` (string) or `csv_content` (string): CSV source
- Action-specific parameters

**Output**:
```json
{
  "rows": 150,
  "data": [
    {"name": "Product A", "sales": 1000, "region": "North"}
  ]
}
```

---

### JSON Transformer

**Purpose**: Transform, validate, and manipulate JSON data

**Language**: Node.js

**Dependencies**:
```
lodash@4.17.21
ajv@8.12.0
```

**Code**:
```javascript
const _ = require('lodash');
const Ajv = require('ajv');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    try {
      const { action, data, ...params } = JSON.parse(input);

      let result = {};

      switch (action) {
        case 'transform':
          // Apply JSONPath-like transformations
          const mappings = params.mappings || {};
          result = {};

          for (const [key, path] of Object.entries(mappings)) {
            result[key] = _.get(data, path);
          }
          break;

        case 'validate':
          const ajv = new Ajv();
          const validate = ajv.compile(params.schema);
          const valid = validate(data);

          result = {
            valid,
            errors: validate.errors || []
          };
          break;

        case 'merge':
          result = _.merge({}, ...params.objects);
          break;

        case 'filter':
          // Filter array by predicate
          result = {
            filtered: _.filter(data, params.predicate)
          };
          break;

        case 'group':
          result = {
            grouped: _.groupBy(data, params.key)
          };
          break;

        case 'flatten':
          result = {
            flattened: _.flattenDeep(data)
          };
          break;
      }

      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow json-pipeline
  agent json-transformer {
    type: temp-script
    language: node
    script: "./scripts/json-transformer.js"
    dependencies: ["lodash@4.17.21", "ajv@8.12.0"]
  }

  json-transformer(
    action="transform",
    data={"user": {"name": "John", "address": {"city": "NYC"}}},
    mappings={"userName": "user.name", "city": "user.address.city"}
  )
end
```

**Input**:
- `action` (string): "transform", "validate", "merge", "filter", "group", "flatten"
- `data` (any): Input JSON data
- Action-specific parameters

**Output**:
```json
{
  "userName": "John",
  "city": "NYC"
}
```

---

### XML Parser

**Purpose**: Parse and extract data from XML documents

**Language**: Python

**Dependencies**:
```
lxml==5.1.0
xmltodict==0.13.0
```

**Code**:
```python
import xml.etree.ElementTree as ET
import xmltodict
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    xml_content = input_data.get('xml_content')
    file_path = input_data.get('file_path')
    action = input_data['action']

    try:
        # Load XML
        if file_path:
            with open(file_path, 'r') as f:
                xml_content = f.read()

        result = {}

        if action == 'to_json':
            # Convert XML to JSON
            data_dict = xmltodict.parse(xml_content)
            result = {'data': data_dict}

        elif action == 'xpath':
            # Extract using XPath
            root = ET.fromstring(xml_content)
            xpath = input_data['xpath']

            elements = []
            for elem in root.findall(xpath):
                elements.append({
                    'tag': elem.tag,
                    'text': elem.text,
                    'attrib': elem.attrib
                })

            result = {'elements': elements}

        elif action == 'extract':
            # Extract specific fields
            root = ET.fromstring(xml_content)
            mappings = input_data['mappings']

            extracted = {}
            for key, xpath in mappings.items():
                elem = root.find(xpath)
                extracted[key] = elem.text if elem is not None else None

            result = extracted

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow xml-parser
  agent xml-processor {
    type: temp-script
    language: python
    script: "./scripts/xml-parser.py"
    dependencies: ["lxml==5.1.0", "xmltodict==0.13.0"]
  }

  xml-processor(
    action="to_json",
    file_path="/data/config.xml"
  )
end
```

**Input**:
- `action` (string): "to_json", "xpath", "extract"
- `xml_content` (string) or `file_path` (string): XML source
- Action-specific parameters

**Output**:
```json
{
  "data": {
    "config": {
      "setting": {"@name": "value"}
    }
  }
}
```

---

### Excel File Processor

**Purpose**: Read and write Excel files with multiple sheets

**Language**: Python

**Dependencies**:
```
openpyxl==3.1.2
pandas==2.1.4
```

**Code**:
```python
import pandas as pd
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    action = input_data['action']
    file_path = input_data.get('file_path')

    try:
        result = {}

        if action == 'read':
            # Read all sheets
            excel_file = pd.ExcelFile(file_path)
            sheets = {}

            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
                sheets[sheet_name] = {
                    'rows': len(df),
                    'columns': list(df.columns),
                    'data': df.to_dict('records')
                }

            result = {'sheets': sheets}

        elif action == 'read_sheet':
            sheet_name = input_data.get('sheet_name', 0)
            df = pd.read_excel(file_path, sheet_name=sheet_name)

            result = {
                'rows': len(df),
                'columns': list(df.columns),
                'data': df.to_dict('records')
            }

        elif action == 'write':
            output_path = input_data['output_path']
            sheets_data = input_data['sheets']

            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                for sheet_name, data in sheets_data.items():
                    df = pd.DataFrame(data)
                    df.to_excel(writer, sheet_name=sheet_name, index=False)

            result = {'success': True, 'file': output_path}

        elif action == 'append':
            sheet_name = input_data.get('sheet_name', 'Sheet1')
            new_data = input_data['data']

            # Read existing
            try:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
            except:
                df = pd.DataFrame()

            # Append new data
            new_df = pd.DataFrame(new_data)
            df = pd.concat([df, new_df], ignore_index=True)

            # Write back
            with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)

            result = {'success': True, 'total_rows': len(df)}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow excel-processor
  agent excel-handler {
    type: temp-script
    language: python
    script: "./scripts/excel-processor.py"
    dependencies: ["openpyxl==3.1.2", "pandas==2.1.4"]
  }

  excel-handler(
    action="read_sheet",
    file_path="/data/report.xlsx",
    sheet_name="Sales"
  )
end
```

**Input**:
- `action` (string): "read", "read_sheet", "write", "append"
- `file_path` (string): Excel file path
- Action-specific parameters

**Output**:
```json
{
  "rows": 100,
  "columns": ["Name", "Sales", "Region"],
  "data": [{"Name": "Product A", "Sales": 1000, "Region": "North"}]
}
```

---

### PDF Text Extractor

**Purpose**: Extract text and metadata from PDF files

**Language**: Python

**Dependencies**:
```
PyPDF2==3.0.1
pdfplumber==0.10.3
```

**Code**:
```python
import PyPDF2
import pdfplumber
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    file_path = input_data['file_path']
    method = input_data.get('method', 'pypdf2')

    try:
        result = {}

        if method == 'pypdf2':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)

                pages = []
                for i, page in enumerate(reader.pages):
                    pages.append({
                        'page_number': i + 1,
                        'text': page.extract_text()
                    })

                result = {
                    'num_pages': len(reader.pages),
                    'metadata': dict(reader.metadata) if reader.metadata else {},
                    'pages': pages
                }

        elif method == 'pdfplumber':
            with pdfplumber.open(file_path) as pdf:
                pages = []

                for i, page in enumerate(pdf.pages):
                    page_data = {
                        'page_number': i + 1,
                        'text': page.extract_text(),
                        'width': page.width,
                        'height': page.height
                    }

                    # Extract tables if requested
                    if input_data.get('extract_tables', False):
                        tables = page.extract_tables()
                        page_data['tables'] = tables

                    pages.append(page_data)

                result = {
                    'num_pages': len(pdf.pages),
                    'metadata': pdf.metadata,
                    'pages': pages
                }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow pdf-extractor
  agent pdf-reader {
    type: temp-script
    language: python
    script: "./scripts/pdf-extractor.py"
    dependencies: ["PyPDF2==3.0.1", "pdfplumber==0.10.3"]
  }

  pdf-reader(
    file_path="/documents/report.pdf",
    method="pdfplumber",
    extract_tables=true
  )
end
```

**Input**:
- `file_path` (string): PDF file path
- `method` (string): "pypdf2" or "pdfplumber"
- `extract_tables` (boolean): Extract tables (pdfplumber only)

**Output**:
```json
{
  "num_pages": 5,
  "metadata": {"Title": "Report", "Author": "John Doe"},
  "pages": [
    {
      "page_number": 1,
      "text": "Page content...",
      "tables": [[["Header1", "Header2"], ["Data1", "Data2"]]]
    }
  ]
}
```

---

## 3. Web Scraping

### HTML Scraper (BeautifulSoup)

**Purpose**: Scrape and parse HTML content from web pages

**Language**: Python

**Dependencies**:
```
beautifulsoup4==4.12.2
requests==2.31.0
lxml==5.1.0
```

**Code**:
```python
from bs4 import BeautifulSoup
import requests
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    url = input_data.get('url')
    html_content = input_data.get('html_content')

    try:
        # Get HTML content
        if url:
            headers = input_data.get('headers', {})
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            html_content = response.text

        soup = BeautifulSoup(html_content, 'lxml')

        action = input_data['action']
        result = {}

        if action == 'extract_text':
            selector = input_data['selector']
            elements = soup.select(selector)

            result = {
                'count': len(elements),
                'items': [elem.get_text(strip=True) for elem in elements]
            }

        elif action == 'extract_attrs':
            selector = input_data['selector']
            attr = input_data['attribute']
            elements = soup.select(selector)

            result = {
                'count': len(elements),
                'items': [elem.get(attr) for elem in elements if elem.get(attr)]
            }

        elif action == 'extract_structured':
            # Extract structured data using multiple selectors
            items = []
            container_selector = input_data['container']
            field_selectors = input_data['fields']

            for container in soup.select(container_selector):
                item = {}
                for field_name, selector in field_selectors.items():
                    elem = container.select_one(selector)
                    if elem:
                        if 'attr' in selector:
                            # Extract attribute
                            attr_name = selector.split('@')[1]
                            item[field_name] = elem.get(attr_name)
                        else:
                            item[field_name] = elem.get_text(strip=True)
                items.append(item)

            result = {
                'count': len(items),
                'items': items
            }

        elif action == 'get_links':
            links = []
            for a in soup.find_all('a', href=True):
                links.append({
                    'text': a.get_text(strip=True),
                    'href': a['href']
                })

            result = {'links': links}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow web-scraper
  agent html-scraper {
    type: temp-script
    language: python
    script: "./scripts/html-scraper.py"
    dependencies: ["beautifulsoup4==4.12.2", "requests==2.31.0", "lxml==5.1.0"]
  }

  html-scraper(
    url="https://news.ycombinator.com",
    action="extract_structured",
    container=".athing",
    fields={
      "title": ".titleline > a",
      "url": ".titleline > a@href",
      "score": ".score"
    }
  )
end
```

**Input**:
- `url` (string) or `html_content` (string): HTML source
- `action` (string): "extract_text", "extract_attrs", "extract_structured", "get_links"
- CSS selectors and field mappings

**Output**:
```json
{
  "count": 30,
  "items": [
    {
      "title": "Article Title",
      "url": "https://example.com/article",
      "score": "123"
    }
  ]
}
```

---

### Dynamic Page Scraper (Playwright)

**Purpose**: Scrape JavaScript-rendered pages with browser automation

**Language**: Node.js

**Dependencies**:
```
playwright@1.40.1
```

**Code**:
```javascript
const { chromium } = require('playwright');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    const browser = await chromium.launch({ headless: true });

    try {
      const { url, action, ...params } = JSON.parse(input);

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      let result = {};

      switch (action) {
        case 'screenshot':
          const screenshot = await page.screenshot({
            fullPage: params.fullPage || false,
            type: params.format || 'png'
          });
          result = {
            screenshot: screenshot.toString('base64'),
            path: params.output_path
          };
          if (params.output_path) {
            await page.screenshot({ path: params.output_path });
          }
          break;

        case 'extract':
          // Wait for selector if provided
          if (params.wait_for) {
            await page.waitForSelector(params.wait_for, { timeout: 10000 });
          }

          // Extract data using selectors
          const data = await page.evaluate((selectors) => {
            const results = [];
            document.querySelectorAll(selectors.container).forEach(elem => {
              const item = {};
              for (const [key, selector] of Object.entries(selectors.fields)) {
                const field = elem.querySelector(selector);
                item[key] = field ? field.textContent.trim() : null;
              }
              results.push(item);
            });
            return results;
          }, params);

          result = { items: data };
          break;

        case 'interact':
          // Click, type, and navigate
          for (const step of params.steps) {
            if (step.action === 'click') {
              await page.click(step.selector);
            } else if (step.action === 'type') {
              await page.fill(step.selector, step.text);
            } else if (step.action === 'wait') {
              await page.waitForTimeout(step.ms);
            }
          }

          // Get final page content or data
          const content = await page.content();
          result = { html: content };
          break;

        case 'pdf':
          const pdf = await page.pdf({
            format: params.format || 'A4',
            path: params.output_path
          });
          result = { success: true, path: params.output_path };
          break;
      }

      await browser.close();
      console.log(JSON.stringify(result));

    } catch (error) {
      await browser.close();
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow dynamic-scraper
  agent playwright-scraper {
    type: temp-script
    language: node
    script: "./scripts/playwright-scraper.js"
    dependencies: ["playwright@1.40.1"]
  }

  playwright-scraper(
    url="https://example.com",
    action="extract",
    wait_for=".content",
    container=".item",
    fields={"title": "h2", "description": "p"}
  )
end
```

**Input**:
- `url` (string): Target URL
- `action` (string): "screenshot", "extract", "interact", "pdf"
- Action-specific parameters

**Output**:
```json
{
  "items": [
    {"title": "Item 1", "description": "Description..."}
  ]
}
```

---

### Sitemap Crawler

**Purpose**: Crawl website sitemaps and extract URLs

**Language**: Python

**Dependencies**:
```
requests==2.31.0
lxml==5.1.0
```

**Code**:
```python
import requests
import xml.etree.ElementTree as ET
import json
import sys
from urllib.parse import urljoin

def main():
    input_data = json.loads(sys.stdin.read())

    sitemap_url = input_data['sitemap_url']
    max_urls = input_data.get('max_urls', 1000)

    try:
        urls = []

        def parse_sitemap(url, depth=0):
            if len(urls) >= max_urls or depth > 3:
                return

            response = requests.get(url, timeout=30)
            response.raise_for_status()

            root = ET.fromstring(response.content)

            # Handle namespace
            ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            # Check for sitemap index
            sitemaps = root.findall('.//sm:sitemap/sm:loc', ns)
            if sitemaps:
                # This is a sitemap index, recurse into child sitemaps
                for sitemap in sitemaps:
                    if len(urls) >= max_urls:
                        break
                    parse_sitemap(sitemap.text, depth + 1)
            else:
                # This is a URL set, extract URLs
                for url_elem in root.findall('.//sm:url', ns):
                    if len(urls) >= max_urls:
                        break

                    loc = url_elem.find('sm:loc', ns)
                    lastmod = url_elem.find('sm:lastmod', ns)
                    priority = url_elem.find('sm:priority', ns)

                    url_data = {
                        'url': loc.text if loc is not None else None,
                        'lastmod': lastmod.text if lastmod is not None else None,
                        'priority': priority.text if priority is not None else None
                    }

                    urls.append(url_data)

        parse_sitemap(sitemap_url)

        result = {
            'total_urls': len(urls),
            'urls': urls
        }

        # Filter by criteria if provided
        if 'filter_pattern' in input_data:
            import re
            pattern = re.compile(input_data['filter_pattern'])
            result['urls'] = [u for u in urls if pattern.search(u['url'])]
            result['filtered_count'] = len(result['urls'])

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow sitemap-crawler
  agent sitemap-parser {
    type: temp-script
    language: python
    script: "./scripts/sitemap-crawler.py"
    dependencies: ["requests==2.31.0", "lxml==5.1.0"]
  }

  sitemap-parser(
    sitemap_url="https://example.com/sitemap.xml",
    max_urls=500,
    filter_pattern="/blog/"
  )
end
```

**Input**:
- `sitemap_url` (string): Sitemap XML URL
- `max_urls` (number): Maximum URLs to extract
- `filter_pattern` (string): Regex pattern to filter URLs

**Output**:
```json
{
  "total_urls": 250,
  "urls": [
    {
      "url": "https://example.com/page1",
      "lastmod": "2025-01-08",
      "priority": "0.8"
    }
  ]
}
```

---

## 4. Database Access

### PostgreSQL Client

**Purpose**: Execute queries and manage PostgreSQL databases

**Language**: Python

**Dependencies**:
```
psycopg2-binary==2.9.9
```

**Code**:
```python
import psycopg2
import psycopg2.extras
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    # Connection parameters
    conn_params = {
        'host': input_data['host'],
        'port': input_data.get('port', 5432),
        'database': input_data['database'],
        'user': input_data['user'],
        'password': input_data['password']
    }

    action = input_data['action']

    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        result = {}

        if action == 'query':
            query = input_data['query']
            params = input_data.get('params', None)

            cur.execute(query, params)

            if query.strip().upper().startswith('SELECT'):
                rows = cur.fetchall()
                result = {
                    'rows': [dict(row) for row in rows],
                    'count': len(rows)
                }
            else:
                conn.commit()
                result = {
                    'affected_rows': cur.rowcount,
                    'success': True
                }

        elif action == 'batch_insert':
            table = input_data['table']
            records = input_data['records']

            if records:
                columns = records[0].keys()
                values = [[r[col] for col in columns] for r in records]

                query = f"INSERT INTO {table} ({','.join(columns)}) VALUES ({','.join(['%s'] * len(columns))})"
                cur.executemany(query, values)
                conn.commit()

                result = {
                    'inserted': cur.rowcount,
                    'success': True
                }

        elif action == 'table_info':
            table = input_data['table']

            cur.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = %s
                ORDER BY ordinal_position
            """, (table,))

            columns = cur.fetchall()
            result = {
                'columns': [dict(col) for col in columns]
            }

        cur.close()
        conn.close()

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow postgres-sync
  agent pg-client {
    type: temp-script
    language: python
    script: "./scripts/postgres-client.py"
    dependencies: ["psycopg2-binary==2.9.9"]
  }

  pg-client(
    host="localhost",
    database="mydb",
    user="postgres",
    password="password",
    action="query",
    query="SELECT * FROM users WHERE active = %s",
    params=[true]
  )
end
```

**Input**:
- `host`, `port`, `database`, `user`, `password` (strings): Connection details
- `action` (string): "query", "batch_insert", "table_info"
- Action-specific parameters

**Output**:
```json
{
  "rows": [
    {"id": 1, "name": "John", "active": true}
  ],
  "count": 1
}
```

---

### MongoDB Client

**Purpose**: Interact with MongoDB collections

**Language**: Node.js

**Dependencies**:
```
mongodb@6.3.0
```

**Code**:
```javascript
const { MongoClient } = require('mongodb');

async function main() {
  let input = '';

  process.stdin.on('data', chunk => input += chunk);

  process.stdin.on('end', async () => {
    let client;

    try {
      const { uri, database, collection, action, ...params } = JSON.parse(input);

      client = new MongoClient(uri);
      await client.connect();

      const db = client.db(database);
      const coll = db.collection(collection);

      let result = {};

      switch (action) {
        case 'find':
          const docs = await coll.find(params.filter || {})
            .limit(params.limit || 100)
            .toArray();
          result = { documents: docs, count: docs.length };
          break;

        case 'insert':
          const insertResult = await coll.insertMany(params.documents);
          result = {
            inserted: insertResult.insertedCount,
            ids: Object.values(insertResult.insertedIds)
          };
          break;

        case 'update':
          const updateResult = await coll.updateMany(
            params.filter,
            params.update
          );
          result = {
            matched: updateResult.matchedCount,
            modified: updateResult.modifiedCount
          };
          break;

        case 'delete':
          const deleteResult = await coll.deleteMany(params.filter);
          result = { deleted: deleteResult.deletedCount };
          break;

        case 'aggregate':
          const aggResult = await coll.aggregate(params.pipeline).toArray();
          result = { documents: aggResult };
          break;
      }

      await client.close();
      console.log(JSON.stringify(result));

    } catch (error) {
      if (client) await client.close();
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    }
  });
}

main();
```

**Usage in Workflow**:
```flow
workflow mongodb-sync
  agent mongo-client {
    type: temp-script
    language: node
    script: "./scripts/mongodb-client.js"
    dependencies: ["mongodb@6.3.0"]
  }

  mongo-client(
    uri="mongodb://localhost:27017",
    database="myapp",
    collection="users",
    action="find",
    filter={"active": true},
    limit=50
  )
end
```

**Input**:
- `uri` (string): MongoDB connection URI
- `database` (string): Database name
- `collection` (string): Collection name
- `action` (string): "find", "insert", "update", "delete", "aggregate"
- Action-specific parameters

**Output**:
```json
{
  "documents": [
    {"_id": "507f1f77bcf86cd799439011", "name": "John", "active": true}
  ],
  "count": 1
}
```

---

### SQLite Processor

**Purpose**: Query and manage SQLite databases

**Language**: Python

**Dependencies**:
```
# No external dependencies - uses built-in sqlite3
```

**Code**:
```python
import sqlite3
import json
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    db_path = input_data['db_path']
    action = input_data['action']

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        result = {}

        if action == 'query':
            query = input_data['query']
            params = input_data.get('params', [])

            cur.execute(query, params)

            if query.strip().upper().startswith('SELECT'):
                rows = cur.fetchall()
                result = {
                    'rows': [dict(row) for row in rows],
                    'count': len(rows)
                }
            else:
                conn.commit()
                result = {
                    'affected_rows': cur.rowcount,
                    'success': True
                }

        elif action == 'create_table':
            table_name = input_data['table_name']
            columns = input_data['columns']

            column_defs = ', '.join([f"{col['name']} {col['type']}" for col in columns])
            query = f"CREATE TABLE IF NOT EXISTS {table_name} ({column_defs})"

            cur.execute(query)
            conn.commit()
            result = {'success': True}

        elif action == 'tables':
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row['name'] for row in cur.fetchall()]
            result = {'tables': tables}

        elif action == 'schema':
            table = input_data['table']
            cur.execute(f"PRAGMA table_info({table})")
            columns = cur.fetchall()
            result = {
                'columns': [dict(col) for col in columns]
            }

        cur.close()
        conn.close()

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow sqlite-manager
  agent sqlite-client {
    type: temp-script
    language: python
    script: "./scripts/sqlite-client.py"
  }

  sqlite-client(
    db_path="/data/app.db",
    action="query",
    query="SELECT * FROM products WHERE price < ?",
    params=[100]
  )
end
```

**Input**:
- `db_path` (string): SQLite database file path
- `action` (string): "query", "create_table", "tables", "schema"
- Action-specific parameters

**Output**:
```json
{
  "rows": [
    {"id": 1, "name": "Product A", "price": 50}
  ],
  "count": 1
}
```

---

## 5. File Operations

### Image Processor

**Purpose**: Resize, crop, convert, and manipulate images

**Language**: Python

**Dependencies**:
```
Pillow==10.1.0
```

**Code**:
```python
from PIL import Image, ImageFilter, ImageEnhance
import json
import sys
import io
import base64

def main():
    input_data = json.loads(sys.stdin.read())

    input_path = input_data.get('input_path')
    output_path = input_data.get('output_path')
    action = input_data['action']

    try:
        # Load image
        img = Image.open(input_path)

        result = {}

        if action == 'resize':
            width = input_data.get('width')
            height = input_data.get('height')
            maintain_aspect = input_data.get('maintain_aspect', True)

            if maintain_aspect and width and height:
                img.thumbnail((width, height), Image.Resampling.LANCZOS)
            elif width and height:
                img = img.resize((width, height), Image.Resampling.LANCZOS)
            elif width:
                aspect = img.height / img.width
                img = img.resize((width, int(width * aspect)), Image.Resampling.LANCZOS)
            elif height:
                aspect = img.width / img.height
                img = img.resize((int(height * aspect), height), Image.Resampling.LANCZOS)

            result = {'width': img.width, 'height': img.height}

        elif action == 'crop':
            left = input_data.get('left', 0)
            top = input_data.get('top', 0)
            right = input_data.get('right', img.width)
            bottom = input_data.get('bottom', img.height)

            img = img.crop((left, top, right, bottom))
            result = {'width': img.width, 'height': img.height}

        elif action == 'filter':
            filter_type = input_data['filter_type']

            if filter_type == 'blur':
                img = img.filter(ImageFilter.BLUR)
            elif filter_type == 'sharpen':
                img = img.filter(ImageFilter.SHARPEN)
            elif filter_type == 'grayscale':
                img = img.convert('L')

            result = {'filter_applied': filter_type}

        elif action == 'enhance':
            enhance_type = input_data['enhance_type']
            factor = input_data.get('factor', 1.5)

            if enhance_type == 'brightness':
                enhancer = ImageEnhance.Brightness(img)
            elif enhance_type == 'contrast':
                enhancer = ImageEnhance.Contrast(img)
            elif enhance_type == 'sharpness':
                enhancer = ImageEnhance.Sharpness(img)

            img = enhancer.enhance(factor)
            result = {'enhanced': enhance_type, 'factor': factor}

        elif action == 'convert':
            format_type = input_data['format'].upper()
            if output_path:
                img.save(output_path, format=format_type)
                result = {'format': format_type, 'output': output_path}

        elif action == 'info':
            result = {
                'format': img.format,
                'mode': img.mode,
                'width': img.width,
                'height': img.height,
                'size_bytes': img.size[0] * img.size[1] * len(img.getbands())
            }

        # Save output if path provided and not convert action
        if output_path and action != 'convert' and action != 'info':
            img.save(output_path)
            result['output'] = output_path

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow image-pipeline
  agent image-processor {
    type: temp-script
    language: python
    script: "./scripts/image-processor.py"
    dependencies: ["Pillow==10.1.0"]
  }

  image-processor(
    input_path="/images/photo.jpg",
    output_path="/images/photo_resized.jpg",
    action="resize",
    width=800,
    maintain_aspect=true
  )
end
```

**Input**:
- `input_path` (string): Input image path
- `output_path` (string): Output image path
- `action` (string): "resize", "crop", "filter", "enhance", "convert", "info"
- Action-specific parameters

**Output**:
```json
{
  "width": 800,
  "height": 600,
  "output": "/images/photo_resized.jpg"
}
```

---

### Archive Creator

**Purpose**: Create and extract ZIP and TAR archives

**Language**: Python

**Dependencies**:
```
# No external dependencies - uses built-in zipfile and tarfile
```

**Code**:
```python
import zipfile
import tarfile
import json
import sys
import os

def main():
    input_data = json.loads(sys.stdin.read())

    action = input_data['action']

    try:
        result = {}

        if action == 'create_zip':
            output_path = input_data['output_path']
            files = input_data['files']

            with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for file_info in files:
                    source = file_info['source']
                    arcname = file_info.get('arcname', os.path.basename(source))

                    if os.path.isdir(source):
                        for root, dirs, files_list in os.walk(source):
                            for file in files_list:
                                file_path = os.path.join(root, file)
                                arc_path = os.path.join(arcname, os.path.relpath(file_path, source))
                                zf.write(file_path, arc_path)
                    else:
                        zf.write(source, arcname)

            result = {
                'archive': output_path,
                'size_bytes': os.path.getsize(output_path),
                'success': True
            }

        elif action == 'extract_zip':
            archive_path = input_data['archive_path']
            extract_to = input_data['extract_to']

            with zipfile.ZipFile(archive_path, 'r') as zf:
                zf.extractall(extract_to)
                members = zf.namelist()

            result = {
                'extracted_to': extract_to,
                'files_count': len(members),
                'files': members[:50]  # First 50 files
            }

        elif action == 'create_tar':
            output_path = input_data['output_path']
            files = input_data['files']
            compression = input_data.get('compression', 'gz')

            mode = f'w:{compression}' if compression else 'w'

            with tarfile.open(output_path, mode) as tf:
                for file_info in files:
                    source = file_info['source']
                    arcname = file_info.get('arcname', os.path.basename(source))
                    tf.add(source, arcname=arcname)

            result = {
                'archive': output_path,
                'size_bytes': os.path.getsize(output_path),
                'compression': compression,
                'success': True
            }

        elif action == 'extract_tar':
            archive_path = input_data['archive_path']
            extract_to = input_data['extract_to']

            with tarfile.open(archive_path, 'r:*') as tf:
                tf.extractall(extract_to)
                members = tf.getnames()

            result = {
                'extracted_to': extract_to,
                'files_count': len(members),
                'files': members[:50]
            }

        elif action == 'list':
            archive_path = input_data['archive_path']
            archive_type = input_data.get('type', 'auto')

            if archive_type == 'auto':
                archive_type = 'zip' if archive_path.endswith('.zip') else 'tar'

            if archive_type == 'zip':
                with zipfile.ZipFile(archive_path, 'r') as zf:
                    members = [{'name': info.filename, 'size': info.file_size}
                              for info in zf.filelist]
            else:
                with tarfile.open(archive_path, 'r:*') as tf:
                    members = [{'name': info.name, 'size': info.size}
                              for info in tf.getmembers()]

            result = {
                'archive': archive_path,
                'files_count': len(members),
                'files': members
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow archive-manager
  agent archiver {
    type: temp-script
    language: python
    script: "./scripts/archive-creator.py"
  }

  archiver(
    action="create_zip",
    output_path="/backups/data.zip",
    files=[
      {"source": "/data/folder1", "arcname": "folder1"},
      {"source": "/data/file.txt", "arcname": "file.txt"}
    ]
  )
end
```

**Input**:
- `action` (string): "create_zip", "extract_zip", "create_tar", "extract_tar", "list"
- Action-specific parameters

**Output**:
```json
{
  "archive": "/backups/data.zip",
  "size_bytes": 1048576,
  "success": true
}
```

---

### File Converter

**Purpose**: Convert between file formats (JSON, CSV, YAML, XML)

**Language**: Python

**Dependencies**:
```
pyyaml==6.0.1
pandas==2.1.4
xmltodict==0.13.0
```

**Code**:
```python
import json
import csv
import yaml
import xmltodict
import pandas as pd
import sys

def main():
    input_data = json.loads(sys.stdin.read())

    input_path = input_data.get('input_path')
    output_path = input_data.get('output_path')
    from_format = input_data['from_format']
    to_format = input_data['to_format']

    try:
        # Read input data
        data = None

        if from_format == 'json':
            with open(input_path, 'r') as f:
                data = json.load(f)

        elif from_format == 'csv':
            df = pd.read_csv(input_path)
            data = df.to_dict('records')

        elif from_format == 'yaml':
            with open(input_path, 'r') as f:
                data = yaml.safe_load(f)

        elif from_format == 'xml':
            with open(input_path, 'r') as f:
                data = xmltodict.parse(f.read())

        # Write output data
        result = {}

        if to_format == 'json':
            with open(output_path, 'w') as f:
                json.dump(data, f, indent=2)
            result = {'format': 'json', 'output': output_path}

        elif to_format == 'csv':
            df = pd.DataFrame(data)
            df.to_csv(output_path, index=False)
            result = {'format': 'csv', 'output': output_path, 'rows': len(df)}

        elif to_format == 'yaml':
            with open(output_path, 'w') as f:
                yaml.dump(data, f, default_flow_style=False)
            result = {'format': 'yaml', 'output': output_path}

        elif to_format == 'xml':
            with open(output_path, 'w') as f:
                xml_str = xmltodict.unparse({'root': data}, pretty=True)
                f.write(xml_str)
            result = {'format': 'xml', 'output': output_path}

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow format-converter
  agent file-converter {
    type: temp-script
    language: python
    script: "./scripts/file-converter.py"
    dependencies: ["pyyaml==6.0.1", "pandas==2.1.4", "xmltodict==0.13.0"]
  }

  file-converter(
    input_path="/data/config.json",
    output_path="/data/config.yaml",
    from_format="json",
    to_format="yaml"
  )
end
```

**Input**:
- `input_path` (string): Input file path
- `output_path` (string): Output file path
- `from_format` (string): "json", "csv", "yaml", "xml"
- `to_format` (string): "json", "csv", "yaml", "xml"

**Output**:
```json
{
  "format": "yaml",
  "output": "/data/config.yaml"
}
```

---

## 6. Cloud Services

### AWS S3 Uploader

**Purpose**: Upload, download, and manage files in AWS S3

**Language**: Python

**Dependencies**:
```
boto3==1.34.19
```

**Code**:
```python
import boto3
import json
import sys
import os

def main():
    input_data = json.loads(sys.stdin.read())

    aws_access_key = input_data['aws_access_key_id']
    aws_secret_key = input_data['aws_secret_access_key']
    region = input_data.get('region', 'us-east-1')
    bucket = input_data['bucket']
    action = input_data['action']

    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )

        result = {}

        if action == 'upload':
            local_path = input_data['local_path']
            s3_key = input_data['s3_key']

            s3_client.upload_file(local_path, bucket, s3_key)

            result = {
                'uploaded': s3_key,
                'bucket': bucket,
                'size_bytes': os.path.getsize(local_path),
                'url': f'https://{bucket}.s3.{region}.amazonaws.com/{s3_key}'
            }

        elif action == 'download':
            s3_key = input_data['s3_key']
            local_path = input_data['local_path']

            s3_client.download_file(bucket, s3_key, local_path)

            result = {
                'downloaded': s3_key,
                'local_path': local_path,
                'size_bytes': os.path.getsize(local_path)
            }

        elif action == 'list':
            prefix = input_data.get('prefix', '')
            max_keys = input_data.get('max_keys', 1000)

            response = s3_client.list_objects_v2(
                Bucket=bucket,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat()
                    })

            result = {
                'files': files,
                'count': len(files)
            }

        elif action == 'delete':
            s3_key = input_data['s3_key']

            s3_client.delete_object(Bucket=bucket, Key=s3_key)

            result = {
                'deleted': s3_key,
                'success': True
            }

        elif action == 'presigned_url':
            s3_key = input_data['s3_key']
            expiration = input_data.get('expiration', 3600)

            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': s3_key},
                ExpiresIn=expiration
            )

            result = {
                'url': url,
                'expires_in': expiration
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow s3-uploader
  agent s3-client {
    type: temp-script
    language: python
    script: "./scripts/s3-uploader.py"
    dependencies: ["boto3==1.34.19"]
  }

  s3-client(
    aws_access_key_id="ACCESS_KEY",
    aws_secret_access_key="SECRET_KEY",
    bucket="my-bucket",
    action="upload",
    local_path="/data/file.pdf",
    s3_key="uploads/file.pdf"
  )
end
```

**Input**:
- `aws_access_key_id`, `aws_secret_access_key` (strings): AWS credentials
- `bucket` (string): S3 bucket name
- `region` (string): AWS region
- `action` (string): "upload", "download", "list", "delete", "presigned_url"
- Action-specific parameters

**Output**:
```json
{
  "uploaded": "uploads/file.pdf",
  "bucket": "my-bucket",
  "size_bytes": 524288,
  "url": "https://my-bucket.s3.us-east-1.amazonaws.com/uploads/file.pdf"
}
```

---

### Google Cloud Storage

**Purpose**: Manage files in Google Cloud Storage buckets

**Language**: Python

**Dependencies**:
```
google-cloud-storage==2.14.0
```

**Code**:
```python
from google.cloud import storage
import json
import sys
import os

def main():
    input_data = json.loads(sys.stdin.read())

    # Set credentials from input
    credentials_path = input_data.get('credentials_path')
    if credentials_path:
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path

    bucket_name = input_data['bucket']
    action = input_data['action']

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)

        result = {}

        if action == 'upload':
            local_path = input_data['local_path']
            blob_name = input_data['blob_name']

            blob = bucket.blob(blob_name)
            blob.upload_from_filename(local_path)

            result = {
                'uploaded': blob_name,
                'bucket': bucket_name,
                'size_bytes': os.path.getsize(local_path),
                'url': blob.public_url
            }

        elif action == 'download':
            blob_name = input_data['blob_name']
            local_path = input_data['local_path']

            blob = bucket.blob(blob_name)
            blob.download_to_filename(local_path)

            result = {
                'downloaded': blob_name,
                'local_path': local_path,
                'size_bytes': os.path.getsize(local_path)
            }

        elif action == 'list':
            prefix = input_data.get('prefix', '')
            max_results = input_data.get('max_results', 1000)

            blobs = client.list_blobs(bucket_name, prefix=prefix, max_results=max_results)

            files = []
            for blob in blobs:
                files.append({
                    'name': blob.name,
                    'size': blob.size,
                    'updated': blob.updated.isoformat() if blob.updated else None
                })

            result = {
                'files': files,
                'count': len(files)
            }

        elif action == 'delete':
            blob_name = input_data['blob_name']

            blob = bucket.blob(blob_name)
            blob.delete()

            result = {
                'deleted': blob_name,
                'success': True
            }

        elif action == 'signed_url':
            blob_name = input_data['blob_name']
            expiration = input_data.get('expiration', 3600)

            blob = bucket.blob(blob_name)
            url = blob.generate_signed_url(expiration=expiration)

            result = {
                'url': url,
                'expires_in': expiration
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow gcs-uploader
  agent gcs-client {
    type: temp-script
    language: python
    script: "./scripts/gcs-client.py"
    dependencies: ["google-cloud-storage==2.14.0"]
  }

  gcs-client(
    credentials_path="/path/to/credentials.json",
    bucket="my-bucket",
    action="upload",
    local_path="/data/file.pdf",
    blob_name="uploads/file.pdf"
  )
end
```

**Input**:
- `credentials_path` (string): Path to GCP credentials JSON
- `bucket` (string): GCS bucket name
- `action` (string): "upload", "download", "list", "delete", "signed_url"
- Action-specific parameters

**Output**:
```json
{
  "uploaded": "uploads/file.pdf",
  "bucket": "my-bucket",
  "size_bytes": 524288,
  "url": "https://storage.googleapis.com/my-bucket/uploads/file.pdf"
}
```

---

### Azure Blob Storage

**Purpose**: Manage files in Azure Blob Storage containers

**Language**: Python

**Dependencies**:
```
azure-storage-blob==12.19.0
```

**Code**:
```python
from azure.storage.blob import BlobServiceClient
import json
import sys
import os

def main():
    input_data = json.loads(sys.stdin.read())

    connection_string = input_data['connection_string']
    container_name = input_data['container']
    action = input_data['action']

    try:
        blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        container_client = blob_service_client.get_container_client(container_name)

        result = {}

        if action == 'upload':
            local_path = input_data['local_path']
            blob_name = input_data['blob_name']

            blob_client = container_client.get_blob_client(blob_name)

            with open(local_path, 'rb') as data:
                blob_client.upload_blob(data, overwrite=True)

            result = {
                'uploaded': blob_name,
                'container': container_name,
                'size_bytes': os.path.getsize(local_path),
                'url': blob_client.url
            }

        elif action == 'download':
            blob_name = input_data['blob_name']
            local_path = input_data['local_path']

            blob_client = container_client.get_blob_client(blob_name)

            with open(local_path, 'wb') as download_file:
                download_file.write(blob_client.download_blob().readall())

            result = {
                'downloaded': blob_name,
                'local_path': local_path,
                'size_bytes': os.path.getsize(local_path)
            }

        elif action == 'list':
            prefix = input_data.get('prefix', '')
            max_results = input_data.get('max_results', 1000)

            blobs = container_client.list_blobs(name_starts_with=prefix)

            files = []
            for i, blob in enumerate(blobs):
                if i >= max_results:
                    break
                files.append({
                    'name': blob.name,
                    'size': blob.size,
                    'last_modified': blob.last_modified.isoformat()
                })

            result = {
                'files': files,
                'count': len(files)
            }

        elif action == 'delete':
            blob_name = input_data['blob_name']

            blob_client = container_client.get_blob_client(blob_name)
            blob_client.delete_blob()

            result = {
                'deleted': blob_name,
                'success': True
            }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
```

**Usage in Workflow**:
```flow
workflow azure-uploader
  agent azure-blob-client {
    type: temp-script
    language: python
    script: "./scripts/azure-blob-client.py"
    dependencies: ["azure-storage-blob==12.19.0"]
  }

  azure-blob-client(
    connection_string="DefaultEndpointsProtocol=https;...",
    container="my-container",
    action="upload",
    local_path="/data/file.pdf",
    blob_name="uploads/file.pdf"
  )
end
```

**Input**:
- `connection_string` (string): Azure Storage connection string
- `container` (string): Container name
- `action` (string): "upload", "download", "list", "delete"
- Action-specific parameters

**Output**:
```json
{
  "uploaded": "uploads/file.pdf",
  "container": "my-container",
  "size_bytes": 524288,
  "url": "https://account.blob.core.windows.net/my-container/uploads/file.pdf"
}
```

---

## Usage Tips

### Template Selection
- Choose the appropriate language based on your environment and dependencies
- Python templates are great for data processing and ML tasks
- Node.js templates excel at API interactions and async operations

### Error Handling
- All templates include comprehensive error handling
- Errors are returned as JSON to stderr with exit code 1
- Check the `error` field in the output for troubleshooting

### Customization
- Templates are starting points - modify them for your needs
- Add authentication, retries, rate limiting as needed
- Combine multiple templates in a single workflow

### Best Practices
- Use environment variables for sensitive credentials
- Implement proper timeout handling for long operations
- Add logging for debugging complex workflows
- Test scripts locally before using in workflows

---

## Contributing

To add new templates:
1. Follow the same structure as existing templates
2. Include complete working code with error handling
3. Provide clear usage examples
4. Document all input parameters and output formats
5. Specify exact dependency versions
