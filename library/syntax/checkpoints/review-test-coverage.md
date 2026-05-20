---
name: @review-test-coverage
type: checkpoint
description: Review test coverage quality
---

# Review Test Coverage

Pauses workflow for test coverage review.

## Prompt

Review current test coverage metrics and verify they meet quality thresholds:
- Line coverage > 80% for core modules
- All critical paths covered
- No regressions in coverage compared to baseline

## Usage

implement -> @review-test-coverage -> deploy