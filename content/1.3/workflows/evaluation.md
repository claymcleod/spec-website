+++
title = "Evaluation"
weight = 20
+++

As with tasks, declarations can appear in the body of a workflow in any order. Expressions in workflows can reference the outputs of calls, including in input declarations. For example:

Example: input_ref_call.wdl


```wdl
version 1.3

task double {
  input {
    Int int_in
  }

  command <<< >>>

  output {
    Int out = int_in * 2
  }
}

workflow input_ref_call {
  input {
    Int x
    Int y = d1.out
  }

  call double as d1 { int_in = x }
  call double as d2 { int_in = y }

  output {
    Int result = d2.out
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "input_ref_call.x": 5
}
```

Example output:

```json
{
  "input_ref_call.result": 20
}
```


</details>

The control flow of this workflow changes depending on whether the value of `y` is provided as an input or it's initializer expression is evaluated:

* If an input value is provided for `y` then it receives that value immediately and `d2` may start running as soon as the workflow starts.
* In no input value is provided for `y` then it will need to wait for `d1` to complete before it is assigned.

### Conditional Scoping

The scoping rules for conditionals are similar to those for scatters—declarations or call outputs inside a conditional body are accessible within that conditional and any nested statements.

In the example below, `Int j` is accessible anywhere in the conditional body, and `Int? j` is an optional that is accessible outside of the conditional anywhere in `workflow test_conditional`.

Example: test_conditional.wdl


```wdl
version 1.3

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
  "test_conditional.j_out": 2,
  "test_conditional.result_array": [4, 6, 8, 10],
  "test_conditional.maybe_result2": [0, 4, 6, 8, 10],
  "test_conditional.j_out": 2
}
```


</details>

Example: if_else.wdl


```wdl
version 1.3

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

  if (is_morning) {
    call greet { input: time = "morning" }
  } else {
    call greet { input: time = "afternoon" }
  }

  output {
    String greeting = greet.greeting
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
version 1.3

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
