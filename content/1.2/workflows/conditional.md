+++
title = "Conditional Statement"
description = "Conditional execution of workflow elements"
weight = 90
+++
A conditional statement consists of the `if` keyword, followed by a `Boolean` expression and a body of (potentially nested) statements. The conditional body is only evaluated if the conditional expression evaluates to `true`.

After evaluation of the conditional has completed, each declaration or call output in the conditional body is exposed in the enclosing context as an optional declaration. In other words, for a declaration or call output `T <name>` within a conditional body, a declaration `T? <name>` is implicitly available outside of the conditional body. If the expression evaluated to `true`, and thus the body of the conditional was evaluated, then the value of each exposed declaration is the same as its original value inside the conditional body. If the expression evaluated to `false` and thus the body of the conditional was not evaluated, then the value of each exposed declaration is `None`.

The scoping rules for conditionals are similar to those for scatters - declarations or call outputs inside a conditional body are accessible within that conditional and any nested statements.

In the example below, `Int j` is accessible anywhere in the conditional body, and `Int? j` is an optional that is accessible outside of the conditional anywhere in `workflow test_conditional`.

Example: test_conditional.wdl


```wdl
version 1.2

task gt_three {
  input {
    Int i
  }

  command <<< >>>

  output {
    Boolean valid = i > 3
  }
}

workflow test_conditional {
  input {
    Boolean do_scatter = true
    Array[Int] scatter_range = [1, 2, 3, 4, 5]
  }

  if (do_scatter) {
    Int j = 2

    scatter (i in scatter_range) {
      call gt_three { i = i + j }
      
      if (gt_three.valid) {
        Int result = i * j
      }

      # `result` is accessible here as an optional
      Int result2 = if defined(result) then select_first([result]) else 0
    }
  }
  
  # Here there is an implicit `Array[Int?]? result` declaration, since
  # `result` is inside a conditional inside a scatter inside a conditional.
  # We can "unwrap" the other optional using select_first.
  Array[Int?] maybe_results = select_first([result, []])

  output {
    Int? j_out = j
    # We can unwrap the inner optional using select_all to get rid of all
    # the `None` values in the array.
    Array[Int] result_array = select_all(maybe_results)

    # Here we reference the implicit declaration of result2, which is
    # created from an `Int` declaration inside a scatter inside a
    # conditional, and so becomes an optional array.
    Array[Int]? maybe_result2 = result2
  }
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{
  "test_conditional.result_array": [4, 6, 8, 10],
  "test_conditional.maybe_result2": [0, 4, 6, 8, 10],
  "test_conditional.j_out": 2
}
```


</details>

WDL has no `else` keyword. To mimic an `if-else` statement, you would simply use two conditionals with inverted boolean expressions. A common idiom is to use `select_first` to select a value from either the `if` or the `if not` body, whichever one is defined.

Example: if_else.wdl


```wdl
version 1.2

task greet {
  input {
    String time
  }

  command <<<
  printf "Good ~{time} buddy!"
  >>>

  output {
    String greeting = read_string(stdout())
  }
}

workflow if_else {
  input {
    Boolean is_morning = false
  }
  
  # the body *is not* evaluated since 'b' is false
  if (is_morning) {
    call greet as morning { input: time = "morning" }
  }

  # the body *is* evaluated since !b is true
  if (!is_morning) {
    call greet as afternoon { input: time = "afternoon" }
  }

  output {
    String greeting = select_first([morning.greeting, afternoon.greeting])
  }
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{
  "if_else.greeting": "Good afternoon buddy!"
}
```


</details>

It is impossible to have a multi-level optional type, e.g., `Int??`. The outputs of a conditional are only ever single-level optionals, even when there are nested conditionals.

Example: nested_if.wdl


```wdl
version 1.2

import "if_else.wdl"

workflow nested_if {
  input {
    Boolean morning
    Boolean friendly
  }

  if (morning) {
    if (friendly) {
      call if_else.greet { input: time = "morning" }
    }
  }

  output {
    # Even though it's within a nested conditional, greeting
    # has a type of `String?` rather than `String??`
    String? greeting_maybe = greet.greeting

    # Similarly, `select_first` produces a `String`, not a `String?`
    String greeting = select_first([greet.greeting, "hi"])
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "nested_if.morning": true,
  "nested_if.friendly": false
}
```

Example output:

```json
{
  "nested_if.greeting_maybe": null,
  "nested_if.greeting": "hi"
}
```


</details>
