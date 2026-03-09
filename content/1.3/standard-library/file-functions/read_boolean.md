+++
title = "read_boolean"
description = "Read a file as a boolean"
weight = 55
+++

```
Boolean read_boolean(File)
```

Reads a file that contains a single line containing only a boolean value and (optional) whitespace. If the non-whitespace content of the line is "true" or "false", that value is returned as a `Boolean`. If the file is empty or does not contain a single boolean, an error is raised. The comparison is case- and whitespace-insensitive.

**Parameters**

1. `File`: Path of the file to read.

**Returns**: A `Boolean`.

<details>
<summary>
Example: read_bool_task.wdl

```wdl
version 1.3

task read_bool {
  command <<<
  printf "  true  \n" > true_file
  printf "  FALSE  \n" > false_file
  >>>

  output {
    Boolean b1 = read_boolean("true_file")
    Boolean b2 = read_boolean("false_file")
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
  "read_bool.b1": true,
  "read_bool.b2": false
}
```
</p>
</details>
