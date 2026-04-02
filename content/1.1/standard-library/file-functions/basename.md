+++
title = "basename"
description = "Get base filename"
weight = 3010
+++
```
String basename(File, [String])
```

Returns the "basename" of a file - the name after the last directory separator in the file's path. 

The optional second parameter specifies a literal suffix to remove from the file name.

**Parameters**

1. `File`: Path of the file to read.
2. `String`: (Optional) Suffix to remove from the file name.
 
**Returns**: The file's basename as a `String`.

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


<details>
<summary></summary>


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


</details>
