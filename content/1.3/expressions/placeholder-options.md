+++
title = "Expression Placeholder Options"
description = "Deprecated placeholder formatting options"
weight = 70
+++

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span>

Expression placeholder options are `option="value"` pairs that precede the expression within an expression placeholder and customize the interpolation of the WDL value into the containing string expression.

There are three options available. An expression placeholder may have at most one option.

* [`sep`](#sep): convert an array to a string using a delimiter; e.g., `~{sep=", " array_value}`.
* [`true` and `false`](#true-and-false): substitute a value depending on whether a boolean expression is `true` or `false`; e.g., `~{true="--yes" false="--no" boolean_value}`.
* [`default`](#default): substitute a default value for an undefined expression; e.g., `~{default="foo" optional_value}`.

**Expression placeholder options are deprecated and will be removed in WDL 2.0**. In the sections below, each type of placeholder option is described in more detail, including how to replicate its behavior using future-proof syntax.

## `sep`

`sep` is interpreted as the separator string used to join together the elements of an array. `sep` is only valid if the expression evaluates to an `Array`.

For example, given a declaration `Array[Int] numbers = [1, 2, 3]`, the expression `"python script.py ~{sep=',' numbers}"` yields the value: `python script.py 1,2,3`.

Alternatively, if the command were `"python script.py ~{sep=' ' numbers}"` it would evaluate to: `python script.py 1 2 3`.

Requirements:

* `sep` MUST accept only a string as its value
* `sep` is only allowed if the type of the expression is `Array[P]`

The `sep` option can be replaced with a call to the [`sep`](@/1.3/standard-library/array-string-functions/sep.md) function:

<details>
<summary>
Example: sep_option_to_function.wdl

```wdl
version 1.3

workflow sep_option_to_function {
  input {
    Array[String] str_array
    Array[Int] int_array
  }

  output {
    Boolean is_true1 = "~{sep(' ', str_array)}" == "~{sep=' ' str_array}"
    Boolean is_true2 = "~{sep(',', quote(int_array))}" == "~{sep=',' quote(int_array)}"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "sep_option_to_function.str_array": ["A", "B", "C"],
  "sep_option_to_function.int_array": [1, 2, 3]
}
```

Example output:

```json
{
  "sep_option_to_function.is_true1": true,
  "sep_option_to_function.is_true2": true
}
```

Test config:

```json
{
  "tags": ["deprecated"]
}
```
</p>
</details>

## `true` and `false`

`true` and `false` convert an expression that evaluates to a `Boolean` into a string literal when the result is `true` or `false`, respectively.

For example, `"~{true='--enable-foo' false='--disable-foo' allow_foo}"` evaluates the expression `allow_foo` as an identifier and, depending on its value, replaces the entire expression placeholder with either `--enable-foo` or `--disable-foo`.

Both `true` and `false` cases are required. If one case should insert no value then an empty string literal is used, e.g. `"~{true='--enable-foo' false='' allow_foo}"`.

Requirements:

* `true` and `false` values MUST be string literals.
* `true` and `false` are only allowed if the type of the expression is `Boolean`
* Both `true` and `false` cases are required.

The `true` and `false` options can be replaced with the use of an if-then-else expression:

<details>
<summary>
Example: true_false_ternary_task.wdl

```wdl
version 1.3

task true_false_ternary {
  input {
    String message
    Boolean newline
  }

  command <<<
    # these two commands have the same result
    printf "~{message}~{true="\n" false="" newline}" > result1
    printf "~{message}~{if newline then "\n" else ""}" > result2
  >>>

  output {
    Boolean is_true = read_string("result1") == read_string("result2")
  }
}
```
</summary>
<p>
Example input:

```json
{
  "true_false_ternary.message": "hello world",
  "true_false_ternary.newline": false
}
```

Example output:

```json
{
  "true_false_ternary.is_true": true
}
```

Test config:

```json
{
  "tags": ["deprecated"]
}
```
</p>
</details>

## `default`

The `default` option specifies a value to substitute for an optional-typed expression with an undefined value.

Requirements:

* The type of the default value must match the type of the expression
* The type of the expression must be optional, i.e., it must have a `?` postfix quantifier

The `default` option can be replaced in several ways - most commonly with an `if-then-else` expression or with a call to the [`select_first`](@/1.3/standard-library/array-functions/select_first.md) function.

<details>
<summary>
Example: default_option_task.wdl

```wdl
version 1.3

task default_option {
  input {
    String? s
  }

  command <<<
    printf ~{default="foobar" s} > result1
    printf ~{if defined(s) then "~{select_first([s])}" else "foobar"} > result2
    printf ~{select_first([s, "foobar"])} > result3
  >>>

  output {
    Boolean is_true1 = read_string("result1") == read_string("result2")
    Boolean is_true2 = read_string("result1") == read_string("result3")
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
  "default_option.is_true1": true,
  "default_option.is_true2": true
}
```
</p>
</details>
