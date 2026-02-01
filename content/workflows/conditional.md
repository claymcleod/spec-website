+++
title = "Conditional Statement"
description = "Conditional execution of workflow elements"
weight = 90
+++

A conditional statement consists of the `if` keyword, followed by a `Boolean` expression and a body of (potentially nested) statements. The conditional body is only evaluated if the conditional expression evaluates to `true`.

After evaluation of the conditional has completed, each declaration or call output in the conditional body is exposed in the enclosing context as an optional declaration. In other words, for a declaration or call output `T <name>` within a conditional body, a declaration `T? <name>` is implicitly available outside of the conditional body. If the expression evaluated to `true`, and thus the body of the conditional was evaluated, then the value of each exposed declaration is the same as its original value inside the conditional body. If the expression evaluated to `false` and thus the body of the conditional was not evaluated, then the value of each exposed declaration is `None`.

The scoping rules for conditionals are similar to those for scatters - declarations or call outputs inside a conditional body are accessible within that conditional and any nested statements.

In the example below, `Int j` is accessible anywhere in the conditional body, and `Int? j` is an optional that is accessible outside of the conditional anywhere in `workflow test_conditional`.

<details>
<summary>
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
</summary>
<p>
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
</p>
</details>

WDL has no `else` keyword. To mimic an `if-else` statement, you would simply use two conditionals with inverted boolean expressions. A common idiom is to use `select_first` to select a value from either the `if` or the `if not` body, whichever one is defined.

<details>
<summary>
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
</summary>
<p>
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
</p>
</details>

It is impossible to have a multi-level optional type, e.g., `Int??`. The outputs of a conditional are only ever single-level optionals, even when there are nested conditionals.

<details>
<summary>
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
</summary>
<p>
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
</p>
</details>

# Standard Library

The following functions are available to be called in WDL expressions. The signature of each function is given as `R func_name(T1, T2, ...)`, where `R` is the return type and `T1`, `T2`, ... are the parameter types. All function parameters must be specified in order, and all function parameters are required, with the exception that the last parameter(s) of some functions is optional (denoted by the type in brackets `[]`).

A function is called using the following syntax: `R' val = func_name(arg1, arg2, ...)`, where `R'` is a type that is coercible from `R`, and `arg1`, `arg2`, ... are expressions whose types are coercible to `T1`, `T2`, ...

A function may be generic, which means that one or more of its parameters and/or its return type are generic. These functions are defined using letters (e.g. `X`, `Y`) for the type parameters, and the bounds of each type parameter is specified in the function description.

A function may be polymorphic, which means it is actually multiple functions ("variants") with the same name but different signatures. Such a function may be defined using `|` to denote the set of alternative valid types for one or more of its parameters, or it may have each variant defined separately.

Functions are grouped by their argument types and restrictions. Some functions may be restricted as to where they may be used. An unrestricted function may be used in any expression.

Functions that are new in this version of the specification are denoted by ✨, and deprecated functions are denoted by 🗑.

