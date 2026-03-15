+++
title = "write_lines"
description = "Write an array of strings to a file"
weight = 130
+++

```
File write_lines(Array[String])
```

Given something that's compatible with `Array[String]`, this writes each element to its own line on a file, with newline `\n` characters as line separators.

**Parameters**

1. `Array[String]`: The array of strings to write.

**Returns**: A `File` containing each element of the array on its own line.

Example: write_lines_task.wdl


```wdl
task example {
  Array[String] array = ["first", "second", "third"]
  command {
    ./script --file-list=${write_lines(array)}
  }
}
```


<details>
<summary></summary>


If this task were run, the command might look like:

```
./script --file-list=/local/fs/tmp/array.txt
```

And `/local/fs/tmp/array.txt` would contain:

```
first
second
third
```


</details>
