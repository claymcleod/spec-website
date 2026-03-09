+++
title = "Syntax"
description = "WDL syntax rules: whitespace, comments, keywords, and literals"
sort_by = "weight"
weight = 15
+++

WDL files are encoded in UTF-8, with no byte order mark (BOM).

## Whitespace

Whitespace may be used anywhere in a WDL document. Whitespace has no meaning in WDL, and is effectively ignored.

The following characters are treated as whitespace:

| Name | Dec | Hex |
|-|-|-|
| Space | 32 | `\x20` |
| Tab | 9 | `\x09` |
| CR | 13 | `\x0D` |
| LF | 10 | `\x0A` |

## Comments

Comments can be used to provide helpful information such as workflow usage, requirements, copyright, etc. A comment is prepended by `#` and can be placed at the start of a line or at the end of any line of WDL code. Any text following the `#` will be completely ignored by the execution engine, with one exception: within the `command` section, *ALL* text will be included in the evaluated script - even lines prepended by `#`.

There is no special syntax for multi-line comments - simply use a `#` at the start of each line.

<details>
  <summary>
  Example: workflow_with_comments.wdl

  ```wdl
  # Comments are allowed before version
  version 1.1

  # This is how you
  # write a long
  # multiline
  # comment

  task task_with_comments {
    input {
      Int number  # This comment comes after a variable declaration
    }

    # This comment will not be included within the command
    command <<<
      # This comment WILL be included within the command after it has been parsed
      echo ~{number * 2}
    >>>

    output {
      Int result = read_int(stdout())
    }

    runtime {
      container: "ubuntu:latest"
    }
  }

  workflow workflow_with_comments {
    input {
      Int number
    }

    # You can have comments anywhere in the workflow
    call task_with_comments { input: number }

    output { # You can also put comments after braces
      Int result = task_with_comments.result
    }
  }
  ```
  </summary>
  <p>
  Example input:

  ```json
  {
    "workflow_with_comments.number": 1
  }
  ```

  Example output:

  ```json
  {
    "workflow_with_comments.result": 2
  }
  ```
  </p>
</details>

## Reserved Keywords

The following (case-sensitive) language keywords are reserved and cannot be used to name declarations, calls, tasks, workflows, import namespaces, struct types, or aliases.

```
Array
Boolean
File
Float
Int
Map
None
Object
Pair
String
alias
as
call
command
else
false
if
in
import
input
left
meta
object
output
parameter_meta
right
runtime
scatter
struct
task
then
true
version
workflow
```

The following keywords should also be considered as reserved - they are not used in the current version of the specification, but they will be used in a future version:

```
Directory
hints
requirements
```

## Literals

Task and workflow inputs may be passed in from an external source, or they may be specified in the WDL document itself using literal values. Input, output, and other declaration values may also be constructed at runtime using [expressions](@/1.1/expressions/_index.md) that consist of literals, identifiers (references to [declarations](@/1.1/expressions/declarations.md) or [call](@/1.1/workflows/call.md) outputs), built-in [operators](@/1.1/expressions/operator-precedence.md), and [standard library functions](@/1.1/standard-library/_index.md).
