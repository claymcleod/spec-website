+++
title = "write_json"
description = "Write a WDL value to a JSON file"
weight = 95
+++

```
File write_json(X)
```

Writes a JSON file with the serialized form of a WDL value. The following WDL types can be serialized:

| WDL Type | JSON Type |
|-|-|
| `Struct` | object |
| `Object` | object |
| `Map[String, X]` | object |
| `Array[X]` | array |
| `Int` | number |
| `Float` | number |
| `String` | string |
| `File` | string |
| `Boolean` | boolean |
| `None` | null |

When serializing compound types, all nested types must be serializable or an error is raised.

**Parameters**

1. `X`: A WDL value of a supported type.

**Returns**: A `File`.

Example: write_json_fail.wdl


```wdl
version 1.3

workflow write_json_fail {
  Pair[Int, Map[Int, String]] x = (1, {2: "hello"})
  # this fails with an error - Map with Int keys is not serializable
  File f = write_json(x)
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>

Example: write_json_task.wdl


```wdl
version 1.3

task write_json {
  input {
    Map[String, String] map = {"key1": "value1", "key2": "value2"}
  }

  command <<<
    python <<CODE
    import json
    import sys
    with open("~{write_json(map)}") as js:
      d = json.load(js)
    json.dump(list(d.keys()), sys.stdout)
    CODE
  >>>

  output {
    Array[String] keys = read_json(stdout())
  }

  requirements {
    container: "python:latest"
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
  "write_json.keys": ["key1", "key2"]
}
```


</details>

The actual command line might look like:

```sh
python <<CODE
import json
with open("local/fs/tmp/map.json") as js:
  d = json.load(js)
  print(list(d.keys()))
CODE
```

And `/local/fs/tmp/map.json` would contain:

Each line is terminated by the newline (`\n`) character.
```json
{
  "key1": "value1",
  "key2": "value2"
}
```
