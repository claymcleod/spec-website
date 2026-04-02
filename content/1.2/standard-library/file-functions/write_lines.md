+++
title = "write_lines"
description = "Write array to file as lines"
weight = 3120
+++

```
File write_lines(Array[String])
```

Writes a file with one line for each element in a `Array[String]`. All lines are terminated by the newline (`\n`) character (following the [POSIX standard](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap03.html#tag_03_206)). If the `Array` is empty, an empty file is written.

**Parameters**

1. `Array[String]`: Array of strings to write.

**Returns**: A `File`.

Example: write_lines_task.wdl


```wdl
version 1.2

task write_lines {
  input {
    Array[String] array = ["first", "second", "third"]
  }

  command <<<
    paste -s -d'\t' ~{write_lines(array)}
  >>>

  output {
    String s = read_string(stdout())
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
{}
```

Example output:

```json
{
  "write_lines.s": "first\tsecond\tthird"
}
```


</details>

The actual command line might look like:

```sh
paste -s -d'\t' /local/fs/tmp/array.txt
```

And `/local/fs/tmp/array.txt` would contain:

`first\nsecond\nthird`

