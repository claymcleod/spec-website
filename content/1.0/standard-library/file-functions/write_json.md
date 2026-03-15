+++
title = "write_json"
description = "Write a value as a JSON file"
weight = 180
+++

```
File write_json(mixed)
```

Given something with any type, this writes the JSON equivalent to a file. See the type mapping table in the definition of `read_json()`.

**Parameters**

1. `mixed`: Any WDL value to serialize as JSON.

**Returns**: A `File` containing the JSON representation of the input value.

Example: write_json_task.wdl


```wdl
task example {
  input {
    Map[String, String] map = {"key1": "value1", "key2": "value2"}
  }
  command {
    ./script --map=${write_json(map)}
  }
}
```


<details>
<summary></summary>


If this task were run, the command might look like:

```
./script --tsv=/local/fs/tmp/map.json
```

And `/local/fs/tmp/map.json` would contain:

```json
{
  "key1": "value1",
  "key2": "value2"
}
```


</details>
