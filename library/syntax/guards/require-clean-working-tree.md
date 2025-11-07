---
name: require-clean-working-tree
type: guard
description: Ensure no uncommitted changes before workflow
---

# Require Clean Working Tree

Checks that git working tree is clean before proceeding.

## Check
```bash
git status --porcelain
```
Returns empty output

## Error
Uncommitted changes detected. Commit or stash changes before running this workflow.

## Usage
require-clean-working-tree -> build -> test -> deploy
