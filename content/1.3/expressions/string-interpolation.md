+++
title = "Expression Placeholders and String Interpolation"
description = "String interpolation, placeholder syntax, and expression coercion"
weight = 60
+++

Any WDL string expression may contain one or more "placeholders" of the form `~{*expression*}`, each of which contains a single expression. Placeholders of the form `${*expression*}` may also be used interchangably, but their use is discouraged for reasons discussed in the [command section](@/1.3/tasks/command.md) and may be deprecated in a future version of the specification.

When a string expression is evaluated, its placeholders are evaluated first, and their values are then substituted for the placeholders in the containing string.

Example: placeholders.wdl


```wdl
version 1.3

workflow placeholders {
  input {
    Int i = 3
    String start
    String end
    String instr
  }

  output {
    String s = "~{1 + i}"
    String cmd = "grep '~{start}...~{end}' ~{instr}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "placeholders.start": "h",
  "placeholders.end": "o",
  "placeholders.instr": "hello"
}
```

Example output:

```json
{
  "placeholders.cmd": "grep 'h...o' hello",
  "placeholders.s": "4"
}
```


</details>

In the above example, `command` would be parsed and evaluated as:

1. `grep '`: literal string
2. `~{start}`: identifier expression, replaced with the value of `start`
3. `...`: literal string
4. `~{end}`: identifier expression, replaced with the value of `end`
5. `' `: literal string
6. `~{input}`: identifier expression, replaced with the value of `input`
7. Final string value created by concatenating 1-6

Placeholders may contain other placeholders to any level of nesting, and placeholders are evaluated recursively in a depth-first manner. Placeholder expressions are anonymous, i.e., they have no name and thus cannot be referenced by other expressions, but they can reference declarations and call outputs.

Example: nested_placeholders.wdl


```wdl
version 1.3

workflow nested_placeholders {
  input {
    Int i
    Boolean b
  }

  output {
    String s = "~{if b then '~{1 + i}' else '0'}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "nested_placeholders.i": 3,
  "nested_placeholders.b": true
}
```

Example output:

```json
{
  "nested_placeholders.s": "4"
}
```


</details>

Placeholders are evaluated in multi-line strings exactly the same as in regular strings. Common leading whitespace is stripped from a multi-line string *before* placeholder expressions are evaluated.

Example: multiline_string_placeholders.wdl


  ```wdl
  version 1.3

  workflow multiline_string_placeholders {
      String spaces = "  "
      String name = "Henry"
      String company = "Acme"

    output {
      # This string evaluates to: "  Hello Henry,\n  Welcome to Acme!"
      # The string still has spaces because the placeholders are evaluated after removing the
      # common leading whitespace.
      String multi_line = <<<
        ~{spaces}Hello ~{name},
        ~{spaces}Welcome to ~{company}!
      >>>
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
    "multiline_string_placeholders.multi_line": "  Hello Henry,\n  Welcome to Acme!"
  }
  ```


</details>

## Expression Placeholder Coercion

The result of evaluating an expression in a placeholder must ultimately be converted to a string in order to take the place of the placeholder in the command script. This is immediately possible for WDL primitive types due to automatic conversions ("coercions") that occur only within the context of string interpolation:

- `String` is substituted directly.
- `File` is substituted as if it were a `String`.
- `Directory` is substituted as if it were a `String`. The resulting string does not have a trailing slash.
- `Int` is formatted without leading zeros (unless the value is `0`), and with a leading `-` if the value is negative.
- `Float` is printed in the style `[-]ddd.dddddd`, with 6 digits after the decimal point.
- `Boolean` is converted to the "stringified" version of its literal value, i.e., `true` or `false`.

Compound types cannot be implicitly converted to `String`s. To convert an `Array` to a `String`, use the [`sep`](@/1.3/standard-library/array-string-functions/sep.md) function: `~{sep(",", str_array)}`. See the guide on [WDL value serialization](@/1.3/appendices/appendix-a.md) for more details and examples.

If an expression within a placeholder evaluates to `None`, and either causes the entire placeholder to evaluate to `None` or causes an error, then the placeholder is replaced by the empty string.

Example: placeholder_coercion.wdl


```wdl
version 1.3

workflow placeholder_coercion {
  input {
    File x
  }
  String x_as_str = x
  Int? i = None

  output {
    Boolean is_true1 = "~{"abc"}" == "abc"
    Boolean is_true2 = "~{x}" == x_as_str
    Boolean is_true3 = "~{5}" == "5"
    Boolean is_true4 = "~{3.141}" == "3.141000"
    Boolean is_true5 = "~{3.141 * 1E-10}" == "0.000000"
    Boolean is_true6 = "~{3.141 * 1E10}" == "31410000000.000000"
    Boolean is_true7 = "~{i}" == ""
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "placeholder_coercion.x": "data/hello.txt"
}
```

Example output:

```json
{
  "placeholder_coercion.is_true1": true,
  "placeholder_coercion.is_true2": true,
  "placeholder_coercion.is_true3": true,
  "placeholder_coercion.is_true4": true,
  "placeholder_coercion.is_true5": true,
  "placeholder_coercion.is_true6": true,
  "placeholder_coercion.is_true7": true
}
```


</details>

Example: placeholder_none.wdl


  ```wdl
  version 1.3

  workflow placeholder_none {
    output {
      String? foo = None
      # The expression in this string results in an error (calling `select_first` on an array
      # containing no non-`None` values) and so the placeholder evaluates to the empty string and
      # `s` evalutes to: "Foo is "
      String s = "Foo is ~{select_first([foo])}"
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
    "placeholder_none.foo": null,
    "placeholder_none.s": "Foo is "
  }
  ```


</details>

## Concatenation of Optional Values

Within expression placeholders the string concatenation operator (`+`) gains the ability to operate on optional values. When applied to two non-optional operands, the result is a non-optional `String`. However, if either operand has an optional type, then the concatenation has type `String?`, and the runtime result is `None` if either operand is `None` (which is then replaced with the empty string).

Example: concat_optional.wdl


```wdl
version 1.3

workflow concat_optional {
  input {
    String salutation = "hello"
    String? name1
    String? name2 = "Fred"
  }

  output {
    # since name1 is undefined, the evaluation of the expression in the placeholder fails, and the
    # value of greeting1 = "nice to meet you!"
    String greeting1 = "~{salutation + ' ' + name1 + ' '}nice to meet you!"

    # since name2 is defined, the evaluation of the expression in the placeholder succeeds, and the
    # value of greeting2 = "hello Fred, nice to meet you!"
    String greeting2 = "~{salutation + ' ' + name2 + ', '}nice to meet you!"
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
  "concat_optional.greeting1": "nice to meet you!",
  "concat_optional.greeting2": "hello Fred, nice to meet you!"
}
```


</details>

Among other uses, concatenation of optionals can be used to facilitate the formulation of command-line flags.

Example: flags_task.wdl


```wdl
version 1.3

task flags {
  input {
    File infile
    String pattern
    Int? max_matches
  }

  command <<<
    # If `max_matches` is `None`, the command
    # grep -m ~{max_matches} ~{pattern} ~{infile}
    # would evaluate to
    # 'grep -m <pattern> <infile>', which would be an error.

    # Instead, make both the flag and the value conditional on `max_matches`
    # being defined.
    grep ~{"-m " + max_matches} ~{pattern} ~{infile} | wc -l
  >>>

  output {
    Int num_matches = read_int(stdout())
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "flags.infile": "data/greetings.txt",
  "flags.pattern": "world"
}
```

Example output:

```json
{
  "flags.num_matches": 2
}
```


</details>
