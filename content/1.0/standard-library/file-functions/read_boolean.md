+++
title = "read_boolean"
description = "Read a boolean from a file"
weight = 120
+++

```
Boolean read_boolean(String|File)
```

The `read_boolean()` function takes a file path which is expected to contain 1 line with 1 Boolean value (either "true" or "false" on it). This function returns that Boolean value.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the file to read.

**Returns**: A `Boolean` value read from the file.
