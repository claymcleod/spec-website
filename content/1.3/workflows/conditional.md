+++
title = "Conditional Statement"
weight = 60
+++

A conditional statement consists of one or more conditional clauses, each having an associated body. The types of conditional statement clauses are:

* A required `if` clause with an associated expression that evaluates to a
  `Boolean`. The `if` clause must be first in the conditional expression.
* Zero or more `else if` clauses, each with an associated expression that
  evaluates to a `Boolean`. If present, `else if` clauses must follow the `if`
  clause and be before the optional `else` clause.
* At most, one `else` clause with no associated expression. The `else` clause
  must be last in the conditional expression.

When a conditional statement is evaluated, each conditional clause is evaluated sequentially; for each `if` and `else if` clause, the expression is evaluated—if the result of the evaluation is `true`, the body of that clause is evaluated and the entire conditional statement suspends further evaluation. If none of the `if` or `else if` clauses execute and we reach the final `else` clause, the `else` clause is executed and the conditional suspends further evaluation.

The declarations and call outputs promoted to the parent scope depend on a union of the scopes for each conditional statement clause:

- Declarations and call outputs that are made available under every condition, including the exhaustive `else` clause, are promoted to the parent scope as their declared type.
- Declarations and call outputs that are missing from one or more clauses, are declared as optional in one or more clauses, or are missing from the exhaustive `else` clause are promoted to the parent scope as optional versions of their declared type.

Simply put, types that are guaranteed to be evaluated in all cases are promoted as themselves whereas types that may not be evaluated (or are declared as optional in one of the clauses) are promoted as the optional equivalent of themselves. The result is a set of declarations and call outputs available in the parent scope that concretely represent the union of all scopes of the conditional statement. Any declaration in the union map that does not evaluate in a conditional statement clause's body is set to `None`. Further, when finding common types across scopes, the type declared in the earliest conditional statement clause is used as the base type. If a declaration that _would_ be promoted to a parent scope conflicts with an existing name in the parent scope, an error should be returned.

The following algorithm is _one_ correct way to implement the functionality described above. It is provided to illustrate the concept, but implementations that achieve the correct result using a different algorithm are still correct.

1. Create a new map of declaration names to types. Traverse all clauses in the conditional statement, gathering the declarations in the scope into a mapping of declaration names to types. For each clause:
  * Reconcile the declaration names and their associated types in the map.
    * If the name _isn't_ already in the map, insert the name into the map and assign the type seen.
    * If the name _is_ already in the map, update the mapped type to a common type between the current declaration's type and the type stored in the map. If there is no common type, emit an error.
2. Perform a second pass through each clause in the conditional statement. For each name in the map created in step 1, if that name is _not_ seen in the current clause's scope, mark that type as optional.
3. If there is no `else` clause, mark every type in the map as optional.

Consider this illustrative example.

```wdl
if (...) {
  String a = "foo"
  String b = "foo"
  String always_available = "foo"
  String bad = "foo"
  call sayHello {}
} else if (...) {
  # If this clause executes, both `a` and `b` will be `None`.
  String? b = None
  String c = "bar"
  String always_available = "bar"
  Int bad = 1
  call sayHello {}
} else {
  String a = "baz"
  String b = "baz"
  String c = "baz"
  String always_available = "baz"
  String bad = "baz"
  call sayHello {}
}

# Both `a` and `b` can be `None` or unevaluated, so they both promote as a `String?`.
# `c` is missing from the first scope, so it must also be marked as `String?`.
# `always_available` is always available, so it will be promoted as a `String`.
# `bad` will return an error, as there is no common type between a `String` and an `Int`.
# `sayHello` is run in every clause, so its outputs will be available in the parent scope as non-optionals.
```

#### Scoping Rules

The scoping rules for conditionals are similar to those for scatters—declarations or call outputs inside a conditional body are accessible within that conditional and any nested statements.

In the example below, `Int j` is accessible anywhere in the conditional body, and `Int? j` is an optional that is accessible outside of the conditional anywhere in `workflow test_conditional`.

<details>
<summary>
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
</summary>
<p>
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
</p>
</details>

<details>
<summary>
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
