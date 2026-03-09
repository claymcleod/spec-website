+++
title = "read_json"
description = "Read a JSON file"
weight = 80
+++

```
mixed read_json(String|File)
```

The `read_json()` function takes one parameter, which is a file-like object (`String`, `File`) and returns a data type which matches the data structure in the JSON file. The mapping of JSON type to WDL type is:

|JSON Type|WDL Type|
|-|-|
|object|`Map[String, ?]`|
|array|`Array[?]`|
|number|`Int` or `Float`|
|string|`String`|
|boolean|`Boolean`|
|null|???|

If the parameter is a `String`, this is assumed to be a local file path relative to the current working directory of the task.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the JSON file to read.

**Returns**: A WDL value corresponding to the JSON data structure.

<details>
<summary>
Example: read_json_task.wdl

```wdl
task do_stuff {
  input {
    File file
  }
  command {
    python do_stuff.py ${file}
  }
  output {
    Map[String, String] output_table = read_json("./results/file_list.json")
  }
}
```
</summary>
</details>
