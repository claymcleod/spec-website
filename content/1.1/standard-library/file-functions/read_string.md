+++
title = "read_string"
description = "Read file as string"
weight = 3070
+++

```
String read_string(File)
```

Reads an entire file as a `String`, with any trailing end-of-line characters (`\r` and `\n`) stripped off. If the file is empty, an empty string is returned.

If the file contains any internal newline characters, they are left in tact.

**Parameters**

1. `File`: Path of the file to read.

**Returns**: A `String`.

Example: read_string_task.wdl


```wdl
version 1.1

task read_string {
  # this file will contain "this\nfile\nhas\nfive\nlines\n"
  File f = write_lines(["this", "file", "has", "five", "lines"])

  command <<<
  cat ~{f}
  >>>

  output {
    # s will contain "this\nfile\nhas\nfive\nlines"
    String s = read_string(stdout())
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
  "read_string.s": "this\nfile\nhas\nfive\nlines"
}
```


</details>
