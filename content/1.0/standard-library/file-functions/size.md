+++
title = "size"
description = "Get file size"
weight = 3040
+++

```
Float size(File, [String])
```

Given a `File` and a `String` (optional), returns the size of the file in Bytes or in the unit specified by the second argument.

Supported units are KiloByte ("K", "KB"), MegaByte ("M", "MB"), GigaByte ("G", "GB"), TeraByte ("T", "TB") as well as their [binary version](https://en.wikipedia.org/wiki/Binary_prefix) "Ki" ("KiB"), "Mi" ("MiB"), "Gi" ("GiB"), "Ti" ("TiB"). Default unit is Bytes ("B").

**Parameters**

1. `File`: The file for which to determine the size.
2. `String`: (Optional) The unit of storage; defaults to `"B"`.

**Returns**: The size of the file as a `Float`.

### Acceptable compound input types

Varieties of the `size` function also exist for the following compound types. The `String` unit is always treated the same as above. Note that to avoid numerical overflow, very long arrays of files should probably favor larger units.

- `Float size(File?, [String])`: Returns the size of the file, if specified, or `0.0` otherwise.
- `Float size(Array[File], [String])`: Returns the sum of sizes of the files in the array.
- `Float size(Array[File?], [String])`: Returns the sum of sizes of all specified files in the array.

Example: file_size_task.wdl

```wdl
task example {
  input {
    File input_file
  }

  command {
    echo "this file is 22 bytes" > created_file
  }

  output {
    Float input_file_size = size(input_file)
    Float created_file_size = size("created_file") # 22.0
    Float created_file_size_in_KB = size("created_file", "K") # 0.022
  }
}
```

