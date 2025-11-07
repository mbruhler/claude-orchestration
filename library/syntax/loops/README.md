# Custom Loops

Custom loops are retry patterns with specific behavior beyond simple retry.

## Format

```markdown
---
name: loop-name
type: loop
params: [param1, param2]
description: What retry behavior this provides
---

# Loop Name

Detailed explanation of the retry pattern.

## Pattern
The workflow pattern using {flow} placeholder:
@try -> {flow} (if failed)~> retry-logic -> @try

## Parameters
- param1: Description of parameter
- param2: Description of parameter

## Usage
loop-name(args): step1 -> step2
```

## Built-in Loops

- `@try` - Simple retry loop
- `@retry` - Retry with checkpoint

Create custom loops when you need:
- Exponential backoff
- Conditional retry logic
- Complex retry patterns
- Parameterized retry behavior

## Examples

See `retry-with-backoff.md` for an exponential backoff example.
