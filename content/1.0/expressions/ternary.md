+++
title = "Ternary (if-then-else)"
weight = 30
+++

## If then else

This is an operator that takes three arguments, a condition expression, an if-true expression and an if-false expression. The condition is always evaluated. If the condition is true then the if-true value is evaluated and returned. If the condition is false, the if-false expression is evaluated and returned. The return type of the if-then-else should be the same, regardless of which side is evaluated or runtime problems might occur.

Examples:

- Choose whether to say "good morning" or "good afternoon":

```wdl
Boolean morning = ...
String greeting = "good " + if morning then "morning" else "afternoon"
```

- Choose how much memory to use for a task:

```wdl
Int array_length = length(array)
runtime {
  memory: if array_length > 100 then "16GB" else "8GB"
}
```
