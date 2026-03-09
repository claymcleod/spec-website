+++
title = "read_float"
description = "Read a float from a file"
weight = 110
+++

```
Float read_float(String|File)
```

The `read_float()` function takes a file path which is expected to contain 1 line with 1 floating point number on it. This function returns that float.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the file to read.

**Returns**: A `Float` value read from the file.
