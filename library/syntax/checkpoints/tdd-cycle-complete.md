---
name: @tdd-cycle-complete
type: checkpoint
description: TDD cycle completion verification
---

# TDD Cycle Complete

Confirms a complete red-green-refactor cycle was executed.

## Prompt

Verify the TDD cycle:
- Red: Test written and failing before implementation
- Green: Minimal implementation passing the test
- Refactor: Code improved without changing behavior

## Usage

write-test -> implement -> @tdd-cycle-complete -> next-feature