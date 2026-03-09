+++
title = "basename"
description = "Get base filename"
weight = 10
+++

```
String basename(File, [String])
String basename(Directory, [String])
```

Returns the "basename" of a file or directory - the name after the last directory separator in the path. 

The optional second parameter specifies a literal suffix to remove from the file name. If the file name does not end with the specified suffix then it is ignored.

**Parameters**

1. `File|Directory`: Path of the file or directory to read. If the argument is a `String`, it is assumed to be a local file path relative to the current working directory of the task.
2. `String`: (Optional) Suffix to remove from the file name.

**Returns**: The file's basename as a `String`.

<details>
<summary>
Example: test_basename.wdl

```wdl
version 1.2

workflow test_basename {
  output {
    Boolean is_true1 = basename("/path/to/file.txt") == "file.txt"
    Boolean is_true2 = basename("/path/to/file.txt", ".txt") == "file"
    Boolean is_true3 = basename("/path/to/dir") == "dir" 
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
  "test_basename.is_true1": true,
  "test_basename.is_true2": true,
  "test_basename.is_true3": true
}
```
</p>
</details>

