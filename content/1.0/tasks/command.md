+++
title = "Command Section"
weight = 30
+++

## Command Section

The `command` section is the *task section* that starts with the keyword 'command', and is enclosed in either curly braces `{ ... }` or triple angle braces `<<< ... >>>`.
It defines a shell command which will be run in the execution environment after all of the inputs are staged and before the outputs are evaluated.
The body of the command also allows placeholders for the parts of the command line that need to be filled in.

Expression placeholders are denoted by `${...}` or `~{...}` depending on whether they appear in a `command { }` or `command <<< >>>` body styles.

### Expression Placeholders

Expression placeholders differ depending on the command section style:

|Command Body Style|Placeholder Style|
|-|-|
|`command { ... }`|`~{}` (preferred) or `${}`|
|`command <<< >>>`|`~{}` only|

These placeholders contain a single expression which will be evaluated using inputs or declarations available in the task.
The placeholders are then replaced in the command script with the result of the evaluation.

For example a command might reference an input to the task, like this:

```wdl
task test {
  input {
    String flags
  }
  command {
    ps ~{flags}
  }
}
```

In this case `flags` within the `${...}` is a variable lookup expression referencing the `flags` input string.
The expression can also be more complex, like a function call: `write_lines(some_array_value)`

Here is the same example using the `command <<<` style:

```wdl
task test {
  String flags
  command <<<
    ps ~{flags}
  >>>
}
```

> **NOTE**: the expression result must ultimately be converted to a string in order to take the place of the placeholder in the command script.
This is immediately possible for WDL primitive types (e.g. not `Array`, `Map`, or `Object`).
To place an array into the command block a separater character must be specified using `sep` (eg `${sep=", " int_array}`).

As another example, consider how the parser would parse the following command:

```
grep '${start}...${end}' ${input}
```

This command would be parsed as:

* `grep '` - literal string
* `${start}` - lookup expression to the variable `start`
* `...` - literal string
* `${end}` - lookup expression to the variable `end`
* `' ` - literal string
* `${input}` - lookup expression to the variable `input`

### Alternative Heredoc Syntax

Sometimes a command is sufficiently long enough or might use `{` characters that using a different set of delimiters would make it more clear. In this case, enclose the command in `<<<`...`>>>`, as follows:

```wdl
task heredoc {
  input {
    File in
  }

  command<<<
  python <<CODE
    with open("${in}") as fp:
      for line in fp:
        if not line.startswith('#'):
          print(line.strip())
  CODE
  >>>
}
```

Parsing of this command should be the same as the prior section describes.

### Stripping Leading Whitespace

Any text inside of the `command` section, after instantiated, should have all *common leading whitespace* removed. In the `task heredoc` example in the previous section, if the user specifies a value of `/path/to/file` as the value for `File in`, then the command should be:

```python
python <<CODE
  with open("/path/to/file") as fp:
    for line in fp:
      if not line.startswith('#'):
        print(line.strip())
CODE
```

The 2-spaces that were common to each line were removed.

If the user mixes tabs and spaces, the behavior is undefined. A warning is suggested, and perhaps a convention of 4 spaces per tab. Other implementations might return an error in this case.
