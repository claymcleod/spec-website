+++
title = "Expressions"
description = "Expression syntax, operators, and evaluation rules"
weight = 25
sort_by = "weight"
+++

An expression is a compound statement that consists of literal values, identifiers (references to [declarations](@/1.1/expressions/declarations.md) or [call](@/1.1/workflows/call.md) outputs), [built-in operators](@/1.1/expressions/operators.md) (e.g., `+` or `>=`), and calls to [standard library functions](@/1.1/standard-library/_index.md).

A "literal" expression is one that consists only of a literal value. For example, `"foo"` is a literal `String` expression and `[1, 2, 3]` is a literal `Array[Int]` expression.

A "simple" expression is one that can be evaluated unambiguously without any knowledge of the runtime context. Literal expressions, operations on literals (e.g., `1 + 2`), and function calls with literal arguments (excluding any functions that read or create `File`s) are all simple expressions. A simple expression cannot refer to any declarations (i.e., it cannot contain identifiers). An execution engine may choose to replace a simple expression with its literal value during static analysis.

Example: expressions_task.wdl


```wdl
version 1.1

task expressions {
  input {
    Int x
  }

  command <<<
  printf "hello" > hello.txt
  >>>

  output {
    # simple expressions
    Float f = 1 + 2.2
    Boolean b = if 1 > 2 then true else false
    Map[String, Int] m = as_map(zip(["a", "b", "c"], [1, 2, 3]))

    # non-simple expressions
    Int i = x + 3  # requires knowing the value of x
    # requires reading a file that might only exist at runtime
    String s = read_string("hello.txt")
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "expressions.x": 5
}
```

Example output:

```json
{
  "expressions.f": 3.2,
  "expressions.b": false,
  "expressions.m": {
    "a": 1,
    "b": 2,
    "c": 3
  },
  "expressions.i": 8,
  "expressions.s": "hello"
}
```


</details>
