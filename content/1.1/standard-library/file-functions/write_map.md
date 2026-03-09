+++
title = "write_map"
description = "Write map to TSV file"
weight = 160
+++

```
File write_map(Map[String, String])
```

Writes a tab-separated value (TSV) file with one line for each element in a `Map[String, String]`. Each element is concatenated into a single tab-delimited string of the format `~{key}\t~{value}`. Each line is terminated by the newline (`\n`) character. If the `Map` is empty, an empty file is written.

Since `Map`s are ordered, the order of the lines in the file is guaranteed to be the same order that the elements were added to the `Map`.

**Parameters**

1. `Map[String, String]`: A `Map`, where each element will be a row in the generated file.

**Returns**: A `File`.

<details>
<summary>
Example: write_map_task.wdl

```wdl
version 1.1

task write_map {
  input {
    Map[String, String] map = {"key1": "value1", "key2": "value2"}
  }

  command <<<
    cut -f 1 ~{write_map(map)}
  >>>

  output {
    Array[String] keys = read_lines(stdout())
  }

  runtime {
    container: "ubuntu:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{}
```

Example output:

```json
{
  "write_map.keys": ["key1", "key2"]
}
```
</p>
</details>

The actual command line might look like:

```sh
cut -f 1 /local/fs/tmp/map.tsv
```

And `/local/fs/tmp/map.tsv` would contain:

```txt
key1\tvalue1
key2\tvalue2
```
