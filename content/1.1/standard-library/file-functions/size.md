+++
title = "size"
description = "Get file size"
weight = 3040
+++

```
Float size(File?|Array[File?], [String])
```

Determines the size of a file, or the sum total of the sizes of files in an array. The files may be optional values; `None` values have a size of `0.0`. By default, the size is returned in bytes unless the optional second argument is specified with a [unit](@/1.1/tasks/runtime.md#units-of-storage).

If the size cannot be represented in the specified unit because the resulting value is too large to fit in a `Float`, an error is raised. It is recommended to use a unit that will always be large enough to handle any expected inputs without numerical overflow.

**Parameters**

1. `File?|Array[File?]`: A file, or array of files, for which to determine the size.
2. `String`: (Optional) The unit of storage; defaults to 'B'.

**Returns**: The size of the file(s) as a `Float`.

Example: file_sizes_task.wdl


```wdl
version 1.1

task file_sizes {
  command <<<
    printf "this file is 22 bytes\n" > out.txt
  >>>

  File? missing_file = None

  output {
    File created_file = "out.txt"
    Float missing_file_bytes = size(missing_file, "B") # 0.0
    Float created_file_bytes = size(created_file, "B") # 22.0
    Float multi_file_kb = size([created_file, missing_file], "K") # 0.022
  }

  runtime {
    container: "ubuntu:latest"
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
  "file_sizes.created_file": "out.txt",
  "file_sizes.missing_file_bytes": 0.0,
  "file_sizes.created_file_bytes": 22.0,
  "file_sizes.multi_file_kb": 0.022
}
```


</details>
