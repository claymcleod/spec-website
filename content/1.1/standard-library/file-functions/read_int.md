+++
title = "read_int"
description = "Read file as integer"
weight = 3080
+++

```
Int read_int(File)
```

Reads a file that contains a single line containing only an integer and (optional) whitespace. If the line contains a valid integer, that value is returned as an `Int`. If the file is empty or does not contain a single integer, an error is raised.

**Parameters**

1. `File`: Path of the file to read.

**Returns**: An `Int`.

Example: read_int_task.wdl


```wdl
version 1.1

task read_int {
  command <<<
  printf "  1  \n" > int_file
  >>>

  output {
    Int i = read_int("int_file")
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
  "read_int.i": 1
}
```


</details>
