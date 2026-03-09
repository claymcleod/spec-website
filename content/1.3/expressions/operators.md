+++
title = "Operators"
weight = 20
+++

An expression is a compound statement that consists of literal values, identifiers (references to [declarations](@/1.3/expressions/declarations.md) or call outputs), built-in operators (e.g., `+` or `>=`), and calls to standard library functions.

A "literal" expression is one that consists only of a literal value. For example, `"foo"` is a literal `String` expression and `[1, 2, 3]` is a literal `Array[Int]` expression.

A "simple" expression is one that can be evaluated unambiguously without any knowledge of the runtime context. Literal expressions, operations on literals (e.g., `1 + 2`), and function calls with literal arguments (excluding any functions that read or create `File`s) are all simple expressions. A simple expression cannot refer to any declarations (i.e., it cannot contain identifiers). An execution engine may choose to replace a simple expression with its literal value during static analysis.

<details>
<summary>
Example: expressions_task.wdl

```wdl
version 1.3

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
</summary>
<p>
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
</p>
</details>

## Built-in Operators

WDL provides the standard unary and binary mathematical and logical operators. The following tables list the valid operand and result type combinations for each operator. Using an operator with unsupported types results in an error.

In operations on mismatched numeric types (e.g., `Int` + `Float`), the `Int` is first is coerced to `Float`, and the result type is `Float`. This may result in loss of precision, for example if the `Int` is too large to be represented exactly by a `Float`. A `Float` can be converted to `Int` with the `ceil`, `round`, or `floor` functions.

### Unary Operators

| Operator | RHS Type | Result |
|-|-|-|
| `-` | `Float` | `Float` |
| `-` | `Int` | `Int` |
| `!` | `Boolean` | `Boolean` |

### Binary Operators on Primitive Types

| LHS Type | Operator | RHS Type | Result | Semantics |
|-|-|-|-|-|
| `Boolean` | `==` | `Boolean` | `Boolean` | |
| `Boolean` | `!=` | `Boolean` | `Boolean` | |
| `Boolean` | `\|\|` | `Boolean` | `Boolean` | |
| `Boolean` | `&&` | `Boolean` | `Boolean` | |
| 🗑 `Boolean` | `>` | `Boolean` | `Boolean` | true is greater than false |
| 🗑 `Boolean` | `>=` | `Boolean` | `Boolean` | true is greater than false |
| 🗑 `Boolean` | `<` | `Boolean` | `Boolean` | true is greater than false |
| 🗑 `Boolean` | `<=` | `Boolean` | `Boolean` | true is greater than false |
| `Int` | `+` | `Int` | `Int` | |
| `Int` | `-` | `Int` | `Int` | |
| `Int` | `*` | `Int` | `Int` | |
| `Int` | `/` | `Int` | `Int` | Integer division |
| `Int` | `**` | `Int` | `Int` | Integer exponentiation |
| `Int` | `%` | `Int` | `Int` | Integer division, return remainder |
| `Int` | `==` | `Int` | `Boolean` | |
| `Int` | `!=` | `Int` | `Boolean` | |
| `Int` | `>` | `Int` | `Boolean` | |
| `Int` | `>=` | `Int` | `Boolean` | |
| `Int` | `<` | `Int` | `Boolean` | |
| `Int` | `<=` | `Int` | `Boolean` | |
| 🗑 `Int` | `+` | `String` | `String` | |
| `Int` | `+` | `Float` | `Float` | |
| `Int` | `-` | `Float` | `Float` | |
| `Int` | `*` | `Float` | `Float` | |
| `Int` | `/` | `Float` | `Float` | |
| `Int` | `**` | `Float` | `Float` | |
| `Int` | `==` | `Float` | `Boolean` | |
| `Int` | `!=` | `Float` | `Boolean` | |
| `Int` | `>` | `Float` | `Boolean` | |
| `Int` | `>=` | `Float` | `Boolean` | |
| `Int` | `<` | `Float` | `Boolean` | |
| `Int` | `<=` | `Float` | `Boolean` | |
| `Float` | `+` | `Float` | `Float` | |
| `Float` | `-` | `Float` | `Float` | |
| `Float` | `*` | `Float` | `Float` | |
| `Float` | `/` | `Float` | `Float` | |
| `Float` | `**` | `Float` | `Float` | |
| `Float` | `%` | `Float` | `Float` | |
| `Float` | `==` | `Float` | `Boolean` | |
| `Float` | `!=` | `Float` | `Boolean` | |
| `Float` | `>` | `Float` | `Boolean` | |
| `Float` | `>=` | `Float` | `Boolean` | |
| `Float` | `<` | `Float` | `Boolean` | |
| `Float` | `<=` | `Float` | `Boolean` | |
| 🗑 `Float` | `+` | `String` | `String` | |
| `Float` | `+` | `Int` | `Float` | |
| `Float` | `-` | `Int` | `Float` | |
| `Float` | `*` | `Int` | `Float` | |
| `Float` | `/` | `Int` | `Float` | |
| `Float` | `**` | `Int` | `Float` | |
| `Float` | `%` | `Int` | `Float` | |
| `Float` | `==` | `Int` | `Boolean` | |
| `Float` | `!=` | `Int` | `Boolean` | |
| `Float` | `>` | `Int` | `Boolean` | |
| `Float` | `>=` | `Int` | `Boolean` | |
| `Float` | `<` | `Int` | `Boolean` | |
| `Float` | `<=` | `Int` | `Boolean` | |
| `String` | `+` | `String` | `String` | Concatenation |
| `String` | `+` | `File` | `File` | |
| `String` | `==` | `String` | `Boolean` | Unicode comparison |
| `String` | `!=` | `String` | `Boolean` | Unicode comparison |
| `String` | `>` | `String` | `Boolean` | Unicode comparison |
| `String` | `>=` | `String` | `Boolean` | Unicode comparison |
| `String` | `<` | `String` | `Boolean` | Unicode comparison |
| `String` | `<=` | `String` | `Boolean` | Unicode comparison |
| 🗑 `String` | `+` | `Int` | `String` | |
| 🗑 `String` | `+` | `Float` | `String` | |
| `File` | `==` | `File` | `Boolean` | |
| `File` | `!=` | `File` | `Boolean` | |
| `File` | `==` | `String` | `Boolean` | |
| `File` | `!=` | `String` | `Boolean` | |
| 🗑 `File` | `+` | `File` | `File` | append file paths - error if second path is not relative |
| 🗑 `File` | `+` | `String` | `File` | append file paths - error if second path is not relative |
| `Directory` | `==` | `Directory` | `Boolean` | |
| `Directory` | `!=` | `Directory` | `Boolean` | |
| `Directory` | `==` | `String` | `Boolean` | |
| `Directory` | `!=` | `String` | `Boolean` | |

Boolean operator evaluation is minimal (or "short-circuiting"), meaning that:

1. For `A && B`, if `A` evalutes to `false` then `B` is not evaluated
2. For `A || B`, if `A` evaluates to `true` then `B` is not evaluated.

WDL `String`s are compared by the unicode values of their corresponding characters. Character `a` is less than character `b` if it has a lower unicode value.

`File` and `Directory` values are canonicalized when the value is created. Two `File` or `Directory` values that refer to the same underlying resource are considered equal, even if they were initialized from different string representations. For example, `/home/user/file.txt` and `/home/user/../user/file.txt` refer to the same file and compare as equal. Similarly, for `Directory` values, trailing slashes are ignored when determining equality (e.g., `/home/user/dir` and `/home/user/dir/` are equal). Equality relationships between `File` and `Directory` values are preserved throughout workflow execution, including before and after task input localization.

When comparing a `File` or `Directory` to a `String`, the `String` is first coerced to `File` or `Directory` (and thus canonicalized) before the comparison is performed.

<details>
<summary>
Example: file_directory_equality.wdl

```wdl
version 1.3

task check_equality {
  input {
    File file_a
    File file_b
    Directory dir_a
    Directory dir_b
  }

  command <<<
  # The execution engine localizes equal files once
  # so file_a and file_b will have the same path
  if [ "~{file_a}" = "~{file_b}" ]; then
    echo "true" > files_equal.txt
  else
    echo "false" > files_equal.txt
  fi

  if [ "~{dir_a}" = "~{dir_b}" ]; then
    echo "true" > dirs_equal.txt
  else
    echo "false" > dirs_equal.txt
  fi
  >>>

  output {
    Boolean task_files_equal = read_boolean("files_equal.txt")
    Boolean task_dirs_equal = read_boolean("dirs_equal.txt")
  }
}

workflow file_directory_equality {
  input {
    File file_a
    File file_b
    Directory dir_a
    Directory dir_b
  }

  # After canonicalization, these compare as equal
  Boolean files_eq = file_a == file_b
  Boolean dirs_eq = dir_a == dir_b

  call check_equality {
    file_a = file_a,
    file_b = file_b,
    dir_a = dir_a,
    dir_b = dir_b
  }

  output {
    Boolean workflow_files_equal = files_eq
    Boolean workflow_dirs_equal = dirs_eq
    Boolean task_files_equal = check_equality.task_files_equal
    Boolean task_dirs_equal = check_equality.task_dirs_equal
  }
}
```
</summary>
<p>
Example input:

```json
{
  "file_directory_equality.file_a": "data/hello.txt",
  "file_directory_equality.file_b": "data/../data/hello.txt",
  "file_directory_equality.dir_a": "data/testdir/",
  "file_directory_equality.dir_b": "data/testdir"
}
```

Example output:

```json
{
  "file_directory_equality.workflow_files_equal": true,
  "file_directory_equality.workflow_dirs_equal": true,
  "file_directory_equality.task_files_equal": true,
  "file_directory_equality.task_dirs_equal": true
}
```
</p>
</details>

In this example, `file_a` and `file_b` use different string representations (`tests/data/hello.txt` vs `tests/data/../data/hello.txt`) but both canonicalize to the same path and compare as equal at workflow scope. When passed to the task, the execution engine localizes the file once, and both `file_a` and `file_b` in the task reference the same localized path. Similarly, `dir_a` includes a trailing slash while `dir_b` does not, but they canonicalize to the same directory and are localized once.

Except for `String + File`, all concatenations between `String` and non-`String` types are deprecated and will be removed in WDL 2.0. The same effect can be achieved using [string interpolation](@/1.3/expressions/string-interpolation.md).

### Equality of Compound Types

| LHS Type | Operator | RHS Type | Result |
|-|-|-|-|
| `Array` | `==` | `Array` | `Boolean` |
| `Array` | `!=` | `Array` | `Boolean` |
| `Map` | `==` | `Map` | `Boolean` |
| `Map` | `!=` | `Map` | `Boolean` |
| `Pair` | `==` | `Pair` | `Boolean` |
| `Pair` | `!=` | `Pair` | `Boolean` |
| `Struct` | `==` | `Struct` | `Boolean` |
| `Struct` | `!=` | `Struct` | `Boolean` |
| `Object` | `==` | `Object` | `Boolean` |
| `Object` | `!=` | `Object` | `Boolean` |

In general, two compound values are equal if-and-only-if all of the following are true:

1. They are of the same type.
2. They are the same length.
3. All of their contained elements are equal.

Since `Array`s and `Map`s are ordered, the order of their elements are also compared. For example:

<details>
<summary>
Example: array_map_equality.wdl

```wdl
version 1.3

workflow array_map_equality {
  output {
    # arrays and maps with the same elements in the same order are equal
    Boolean is_true1 = [1, 2, 3] == [1, 2, 3]
    Boolean is_true2 = {"a": 1, "b": 2} == {"a": 1, "b": 2}

    # arrays and maps with the same elements in different orders are not equal
    Boolean is_false1 = [1, 2, 3] == [2, 1, 3]
    Boolean is_false2 = {"a": 1, "b": 2} == {"b": 2, "a": 1}
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
  "array_map_equality.is_true1": true,
  "array_map_equality.is_true2": true,
  "array_map_equality.is_false1": false,
  "array_map_equality.is_false2": false
}
```
</p>
</details>

Type coercion can be employed to compare values of different but compatible types.

<details>
<summary>
Example: compare_coerced.wdl

```wdl
version 1.3

workflow compare_coerced {
  Array[Int] i = [1, 2, 3]
  Array[Float] f1 = i
  Array[Float] f2 = [1.0, 2.0, 3.0]

  output {
    # Ints are automatically coerced to Floats for comparison
    Boolean is_true = f1 == f2
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
  "compare_coerced.is_true": true
}
```
</p>
</details>

### Equality and Inequality Comparison of Optional Types

The equality and inequality operators are exceptions to the general rules on coercion of optional types. Either or both operands of an equality or inequality comparison can be optional, considering that `None` is equal to itself but no other value.

<details>
<summary>
Example: compare_optionals.wdl

```wdl
version 1.3

workflow compare_optionals {
  Int i = 1
  Int? j = 1
  Int? k = None

  output {
    # equal values of the same type are equal even if one is optional
    Boolean is_true1 = i == j
    # k is undefined (None), and so is only equal to None
    Boolean is_true2 = k == None
    # these comparisons are valid and evaluate to false
    Boolean is_false1 = i == k
    Boolean is_false2 = j == k
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
  "compare_optionals.is_true1": true,
  "compare_optionals.is_true2": true,
  "compare_optionals.is_false1": false,
  "compare_optionals.is_false2": false
}
```
</p>
</details>
