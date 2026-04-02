+++
title = "read_string"
description = "Read a string from a file"
weight = 3070
+++

```
String read_string(String|File)
```

The `read_string()` function takes a file path which is expected to contain 1 line with 1 string on it. This function returns that string.

No trailing newline characters should be included.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the file to read.

**Returns**: A `String` value read from the file.
