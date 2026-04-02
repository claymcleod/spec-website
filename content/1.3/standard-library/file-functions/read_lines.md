+++
title = "read_lines"
description = "Read a file as an array of lines"
weight = 3110
+++

```
Array[String] read_lines(File)
```

Reads each line of a file as a `String`, and returns all lines in the file as an `Array[String]`. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

The order of the lines in the returned `Array[String]` is the order in which the lines appear in the file.

If the file is empty, an empty array is returned.

**Parameters**

1. `File`: Path of the file to read.

**Returns**: An `Array[String]` representation of the lines in the file.

Example: grep_task.wdl


```wdl
version 1.3

task grep {
  input {
    String pattern
    File file
  }

  command <<<
    grep '~{pattern}' ~{file}
  >>>

  output {
    Array[String] matches = read_lines(stdout())
  }

  requirements {
    container: "ubuntu:latest"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "grep.pattern": "world",
  "grep.file": "data/greetings.txt"
}
```

Example output:

```json
{
  "grep.matches": [
    "hello world",
    "hi_world"
  ]
}
```


</details>
