+++
title = "read_map"
description = "Read two-column TSV as map"
weight = 150
+++

```
Map[String, String] read_map(File)
```

Reads a tab-separated value (TSV) file representing a set of pairs. Each row must have exactly two columns, e.g., `col1\tcol2`. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

Each pair is added to a `Map[String, String]` in order. The values in the first column must be unique; if there are any duplicate keys, an error is raised.

If the file is empty, an empty map is returned.

**Parameters**

1. `File`: Path of the two-column TSV file to read.

**Returns**: A `Map[String, String]`, with one element for each row in the TSV file.

Example: read_map_task.wdl


```wdl
version 1.1

task read_map {
  command <<<
    printf "key1\tvalue1\n"
    printf "key2\tvalue2\n"
  >>>

  output {
    Map[String, String] mapping = read_map(stdout())
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
  "read_map.mapping": {
    "key1": "value1",
    "key2": "value2"
  }
}
```


</details>
