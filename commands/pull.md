---
description: Pull a community workflow from the orchestration registry or GitHub
---

# Pulling Workflows

Downloads a workflow from the community registry or directly from a GitHub repository and saves it to your local workspace.

## Arguments: {{ARGS}}

The workflow identifier to pull. This can be:
1. A name from the official registry (e.g. `tdd-autopilot`)
2. A direct GitHub path (e.g. `username/repo/path/to/workflow.flow`)

## Execution Process

### Phase 1: Determine Source
Check the argument to see if it's a direct GitHub path (contains a `/`) or a registry name (no `/`).

### Phase 2: Fetch Registry (If applicable)
If it's a registry name, fetch the official registry index using bash:
```bash
curl -s https://raw.githubusercontent.com/mbruhler/claude-orchestration/main/registry/index.json
```
Parse the JSON and find the URL for the requested workflow. If not found, show an error and list available workflows.

### Phase 3: Construct Raw URL (If direct GitHub path)
If the user provided `username/repo/workflow.flow`, convert it to a raw GitHub URL:
`https://raw.githubusercontent.com/username/repo/main/workflow.flow`
(You may need to ask the user if the branch is `main` or `master` if the first attempt fails).

### Phase 4: Download the Workflow
Use `curl` or `wget` to download the file content.
Save the downloaded content into the `./examples/` directory in the current working directory, using the workflow's filename.

```bash
mkdir -p ./examples
curl -sL "<URL>" -o "./examples/<workflow-name>.flow"
```

### Phase 5: Confirm
Display a success message to the user:
```
✅ Successfully pulled workflow: <workflow-name>
Saved to: ./examples/<workflow-name>.flow

To run it, type:
/orchestration:run ./examples/<workflow-name>.flow
```
