+++
title = "Ternary Operator (if-then-else)"
description = "Conditional expression evaluation"
weight = 50
+++

This operator takes three arguments: a condition expression, an if-true expression, and an if-false expression. The condition is always evaluated. If the condition is `true` then the if-true value is evaluated and returned. If the condition is `false`, the if-false expression is evaluated and returned. The if-true and if-false expressions must return values of the same type, such that the value of the if-then-else is the same regardless of which side is evaluated.

Example: ternary.wdl


```wdl
version 1.2

task mem {
  input {
    Array[String] array
  }

  Int array_length = length(array)
  # choose how much memory to use for a task
  String memory = if array_length > 100 then "2GB" else "1GB"

  command <<<
  >>>

  requirements {
    memory: memory
  }
}

workflow ternary {
  input {
    Boolean morning
  }

  call mem { array = ["x", "y", "z"] }

  output {
    # Choose whether to say "good morning" or "good afternoon"
    String greeting = "good ~{if morning then "morning" else "afternoon"}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "ternary.morning": true
}
```

Example output:

```json
{
  "ternary.greeting": "good morning"
}
```


</details>
