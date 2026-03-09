+++
title = "read_float"
description = "Read file as float"
weight = 90
+++

```
Float read_float(File)
```

Reads a file that contains only a numeric value and (optional) whitespace. If the line contains a valid floating point number, that value is returned as a `Float`. If the file is empty or does not contain a single float, an error is raised.

**Parameters**

1. `File`: Path of the file to read.

**Returns**: A `Float`.

<details>
<summary>
Example: read_float_task.wdl

```wdl
version 1.1

task read_float {
  command <<<
  printf "  1  \n" > int_file
  printf "  2.0  \n" > float_file
  >>>

  output {
    Float f1 = read_float("int_file")
    Float f2 = read_float("float_file")
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
  "read_float.f1": 1.0,
  "read_float.f2": 2.0
}
```
</p>
</details>
