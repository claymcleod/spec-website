+++
title = "read_tsv"
description = "Read TSV file"
weight = 130
+++

```
Array[Array[String]] read_tsv(File)
```

Reads a tab-separated value (TSV) file as an `Array[Array[String]]` representing a table of values. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

There is no requirement that the rows of the table are all the same length.

If the file is empty, an empty array is returned.

**Parameters**

1. `File`: Path of the TSV file to read.

**Returns**: An `Array` of rows in the TSV file, where each row is an `Array[String]` of fields.

<details>
<summary>
Example: read_tsv_task.wdl

```wdl
version 1.1

task read_tsv {
  command <<<
    {
      printf "row1\tvalue1\n"
      printf "row2\tvalue2\n"
      printf "row3\tvalue3\n"
    } >> data.tsv
  >>>

  output {
    Array[Array[String]] output_table = read_tsv("data.tsv")
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
  "read_tsv.output_table": [
    ["row1", "value1"],
    ["row2", "value2"],
    ["row3", "value3"]
  ]
}
```
</p>
</details>
