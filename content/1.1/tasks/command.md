+++
title = "Command Section"
description = "Defining the Bash script template for task execution"
weight = 30
+++

The `command` section is the only required task section. It defines the command template that is evaluated to produce a Bash script that is executed within the task's container. Specifically, the commands are executed after all of the inputs are staged and before the outputs are evaluated.

There are two different syntaxes that can be used to define the command section:

```wdl
# HEREDOC style - this way is preferred
command <<< ... >>>

# older style - may be preferable in some cases
command { ... }
```

There may be any number of commands within a command section. Commands are not modified by the execution engine, with the following exceptions:
- Common leading whitespace is [stripped](#stripping-leading-whitespace)
- String interpolation is performed on the entire command section to replace [expression placeholders](#expression-placeholders) with their actual values.

The characters that must be escaped within a command section are different from those that must be escaped in regular strings:

* Unescaped newlines (`\n`) are allowed.
* An unescaped backslash (`\`) may appear as the last character on a line - this is treated as a line continuation.
* In a HEREDOC-style command section, if there are exactly three consecutive right-angle brackets (`>>>`), then at least one of them must be escaped, e.g. `\>>>`.
* In the older-style command section, any right brace (`}`) that is not part of an expression placeholder must be escaped.

## Expression Placeholders

The body of the command section (the command "template") can be though of as a single string expression, which (like all string expressions) may contain placeholders.

There are two different syntaxes that can be used to define command expression placeholders, depending on which style of command section definition is used:

| Command Definition Style | Placeholder Style          |
| ------------------------ | -------------------------- |
| `command <<< >>>`        | `~{}` only                 |
| `command { ... }`        | `~{}` (preferred) or `${}` |

Note that the `~{}` and `${}` styles may be used interchangeably in other string expressions.

Any valid WDL expression may be used within a placeholder. For example, a command might reference an input to the task. The expression can also be more complex, such as a function call.

<details>
<summary>
Example: test_placeholders_task.wdl

```wdl
version 1.1

task test_placeholders {
  input {
    File infile
  }

  command <<<
    # The `read_lines` function reads the lines from a file into an
    # array. The `sep` function concatenates the lines with a space
    # (" ") delimiter. The resulting string is then printed to stdout.
    printf "~{sep(" ", read_lines(infile))}"
  >>>

  output {
    # The `stdout` function returns a file with the contents of stdout.
    # The `read_string` function reads the entire file into a String.
    String result = read_string(stdout())
  }
}
```
</summary>
<p>
Example input:

```json
{
  "test_placeholders.infile": "data/greetings.txt"
}
```

Example output:

```json
{
  "test_placeholders.result": "hello world hi_world hello nurse"
}
```
</p>
</details>

In this case, `infile` within the `~{...}` placeholder is an identifier expression referencing the value of the `infile` input parameter that was specified at runtime. Since `infile` is a `File` declaration, the execution engine will have staged whatever file was referenced by the caller such that it is available on the local file system, and will have replaced the original value of the `infile` parameter with the path to the file on the local filesystem.

In most cases, the `~{}` style of placeholder is preferred, to avoid ambiguity between WDL placeholders and Bash variables, which are of the form `$name` or `${name}`. If the `command { ... }` style is used, then `${name}` is always interpreted as a WDL placeholder, so care must be taken to only use `$name` style Bash variables. If the `command <<< ... >>>` style is used, then only `~{name}` is interpreted as a WDL placeholder, so either style of Bash variable may be used.

<details>
<summary>
Example: bash_variables_fail_task.wdl

```wdl
version 1.1

task bash_variables {
  input {
    String str
  }

  command {
    # store value of WDL declaration "str" to Bash variable "s"
    s=${str}
    # echo the string referenced by Bash variable "s"
    printf $s
    # this causes an error since "s" is not a WDL declaration
    printf ${s}
  }
}
```
</summary>
<p>
Example input:

```json
{
  "bash_variables.str": "hello"
}
```

Example output:

```json
{}
```

Test config:

```json
{
  "fail": true
}
```
</p>
</details>

Like any other WDL string, the command section is subject to the rules of [string interpolation](#expression-placeholders): all placeholders must contain expressions that are valid when analyzed statically, and that can be converted to a `String` value when evaluated dynamically. However, the evaluation of placeholder expressions during command instantiation is more lenient than typical dynamic evaluation as described in Expression Placeholder Coercion.

The implementation is *not* responsible for interpreting the contents of the command section to check that it is a valid Bash script, ignore comment lines, etc. For example, in the following task the `greeting` declaration is commented out, so `greeting` is not a valid identifier in the task's scope. However, the placeholder in the command section refers to `greeting`, so the implementation will raise an error during static analysis. The fact that the placeholder occurs in a commented line of the Bash script doesn't matter.

<details>
<summary>
Example: bash_comment_fail_task.wdl

```wdl
version 1.1

task bash_comment {
  # String greeting = "hello"

  command <<<
  # printf "~{greeting} John!"
  >>>
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
{}
```

Test config:

```json
{
  "fail": true
}
```
</p>
</details>

## Stripping Leading Whitespace

When a command template is evaluated, the execution engine first strips out all *common leading whitespace*.

For example, consider a task that calls the `python` interpreter with an in-line Python script:

<details>
<summary>
Example: python_strip_task.wdl

```wdl
version 1.1

task python_strip {
  input {
    File infile
  }

  command<<<
  python <<CODE
  with open("~{infile}") as fp:
    for line in fp:
      if not line.startswith('#'):
        print(line.strip())
  CODE
  >>>

  output {
    Array[String] lines = read_lines(stdout())
  }

  runtime {
    container: "python:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "python_strip.infile": "data/comment.txt"
}
```

Example output:

```json
{
  "python_strip.lines": ["A", "B", "C"]
}
```
</p>
</details>

Given an `infile` value of `/path/to/file`, the execution engine will produce the following Bash script, which has removed the two spaces that were common to the beginning of each line:

```sh
python <<CODE
with open("/path/to/file") as fp:
  for line in fp:
    if not line.startswith('#'):
      print(line.strip())
CODE
```

When leading whitespace is a mix of tabs and spaces, the execution engine should issue a warning and leave the whitespace unmodified.
