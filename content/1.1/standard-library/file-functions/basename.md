+++
title = "basename"
description = "Get base filename"
weight = 10
+++

```
String basename(String, [String])
```

Returns the "basename" of a file - the name after the last directory separator in the path.

The optional second parameter specifies a literal suffix to remove from the file name. If the file name does not end with the specified suffix then it is ignored.

**Parameters**

1. `String`: Path of the file. The argument can be a `File` or `String`.
2. `String`: (Optional) Suffix to remove from the file name.

**Returns**: The file's basename as a `String`.

<details>
<summary>
Example: test_basename.wdl

```wdl
version 1.1

workflow test_basename {
  output {
    Boolean is_true1 = basename("/path/to/file.txt") == "file.txt"
    Boolean is_true2 = basename("/path/to/file.txt", ".txt") == "file"
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
  "test_basename.is_true2": true
}
```
</p>
</details>
