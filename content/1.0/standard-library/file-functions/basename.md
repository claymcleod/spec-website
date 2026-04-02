+++
title = "basename"
description = "Get file basename"
weight = 3010
+++

```
String basename(String)
```

This function returns the basename of a file path passed to it: `basename("/path/to/file.txt")` returns `"file.txt"`.

Also supports an optional parameter, suffix to remove: `basename("/path/to/file.txt", ".txt")` returns `"file"`.

**Parameters**

1. `String`: The file path from which to extract the basename.
2. `String`: (Optional) A suffix to remove from the basename.

**Returns**: A `String` containing the basename of the file path.
