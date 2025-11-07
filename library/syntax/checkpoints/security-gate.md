---
name: @security-gate
type: checkpoint
description: Security approval checkpoint
---

# Security Gate

Pauses workflow for security review approval.

## Prompt
Review security findings. Verify no critical vulnerabilities before proceeding.

## Usage
scan -> @security-gate -> deploy
