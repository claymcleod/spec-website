+++
title = "size"
description = "Get file size"
weight = 3040
+++

```
Float size(File|File?, [String])
Float size(Directory|Directory?, [String])
Float size(X|X?, [String])
```

Determines the size of a file, directory, or the sum total sizes of the files/directories contained within a compound value. The files may be optional values; `None` values have a size of `0.0`. By default, the size is returned in bytes unless the optional second argument is specified with a [unit](@/1.2/tasks/requirements.md#units-of-storage)

In the second variant of the `size` function, the parameter type `X` represents any compound type that contains `File` or `File?` nested at any depth.

If the size cannot be represented in the specified unit because the resulting value is too large to fit in a `Float`, an error is raised. It is recommended to use a unit that will always be large enough to handle any expected inputs without numerical overflow.

**Parameters**

1. `File|File?|Directory|Directory?|X|X?`: A file, directory, or a compound value containing files/directories, for which to determine the size.
2. `String`: (Optional) The unit of storage; defaults to 'B'.

**Returns**: The size of the files/directories as a `Float`.

Example: file_sizes_task.wdl


```wdl
version 1.2

task file_sizes {
  command <<<
    printf "this file is 22 bytes\n" > out.txt
  >>>

  File? missing_file = None

  output {
    File created_file = "out.txt"
    Float missing_file_bytes = size(missing_file, "B") 
    Float created_file_bytes = size(created_file, "B")
    Float multi_file_kb = size([created_file, missing_file], "K") # 0.022

    Map[String, Pair[Int, File?]] nested = {
      "a": (10, created_file),
      "b": (50, missing_file)
    }
    Float nested_bytes = size(nested)
  }
  
  requirements {
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
  "file_sizes.multi_file_kb": 0.022,
  "file_size.nested": {
    "a": (10, "out.txt"),
    "b": (50, null)
  }
  "file_sizes.nested_bytes": 22.0
}
```


</details>

