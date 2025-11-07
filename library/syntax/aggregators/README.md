# Custom Aggregators

Custom aggregators define how to combine results from parallel execution branches.

## Format

```markdown
---
name: aggregator-name
description: How this aggregator combines results
behavior: Step-by-step aggregation behavior
---

# Aggregator Name

Detailed explanation of the aggregation strategy.

## Behavior
1. Collect results from all parallel branches
2. Apply aggregation logic
3. Produce single output
4. Handle edge cases (ties, conflicts, etc.)

## Usage
[branch1 || branch2 || branch3] aggregator-name next-step
```

## Built-in Aggregators

- Default merge - Combines all outputs
- First success - Takes first successful result

Create custom aggregators when you need:
- Voting mechanisms
- Weighted results
- Conflict resolution
- Custom merge logic
- Deduplication strategies

## Examples

See `merge-with-vote.md` for a majority-vote aggregator example.
