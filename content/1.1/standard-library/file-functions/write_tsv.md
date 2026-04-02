+++
title = "write_tsv"
description = "Write TSV file"
weight = 3140
+++

```
File write_tsv(Array[Array[String]])
```

Writes a tab-separated value (TSV) file with one line for each element in a `Array[Array[String]]`. Each element is concatenated into a single tab-delimited string. Each line is terminated by the newline (`\n`) character. If the `Array` is empty, an empty file is written.

**Parameters**

1. `Array[Array[String]]`: An array of rows, where each row is an array of column values.

**Returns**: A `File`.

Example: write_tsv_task.wdl


```wdl
version 1.1

task write_tsv {
  input {
    Array[Array[String]] array = [["one", "two", "three"], ["un", "deux", "trois"]]
  }

  command <<<
    cut -f 1 ~{write_tsv(array)}
  >>>

  output {
    Array[String] ones = read_lines(stdout())
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
  "write_tsv.ones": ["one", "un"]
}
```


</details>

The actual command line might look like:

```sh
cut -f 1 /local/fs/tmp/array.tsv
```

And `/local/fs/tmp/array.tsv` would contain:

```txt
one\ttwo\tthree
un\tdeux\ttrois
```
