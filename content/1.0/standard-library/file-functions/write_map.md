+++
title = "write_map"
description = "Write a Map as a TSV file"
weight = 150
+++

```
File write_map(Map[String, String])
```

Given something that's compatible with `Map[String, String]`, this writes a TSV file of the data structure.

**Parameters**

1. `Map[String, String]`: The map to write.

**Returns**: A `File` containing the map data in two-column TSV format.

<details>
<summary>
Example: write_map_task.wdl

```wdl
task example {
  Map[String, String] map = {"key1": "value1", "key2": "value2"}
  command {
    ./script --map=${write_map(map)}
  }
}
```
</summary>
<p>

If this task were run, the command might look like:

```
./script --tsv=/local/fs/tmp/map.tsv
```

And `/local/fs/tmp/map.tsv` would contain:

```
key1	value1
key2	value2
```

</p>
</details>
