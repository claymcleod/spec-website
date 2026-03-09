+++
title = "read_int"
description = "Read an integer from a file"
weight = 90
+++

```
Int read_int(String|File)
```

The `read_int()` function takes a file path which is expected to contain 1 line with 1 integer on it. This function returns that integer.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed.

**Parameters**

1. `String|File`: Path of the file to read.

**Returns**: An `Int` value read from the file.
