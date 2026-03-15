+++
title = "read_tsv"
description = "Read TSV file"
weight = 130
+++

```
Array[Array[String]] read_tsv(File)
Array[Object] read_tsv(File, true)
Array[Object] read_tsv(File, Boolean, Array[String])
```

Reads a tab-separated value (TSV) file as an `Array[Array[String]]` representing a table of values. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

This function has three variants:

1. `Array[Array[String]] read_tsv(File, [false])`: Returns each row of the table as an `Array[String]`. There is no requirement that the rows of the table are all the same length.
2. `Array[Object] read_tsv(File, true)`: The second parameter must be `true` and specifies that the TSV file contains a header line. Each row is returned as an `Object` with its keys determined by the header (the first line in the file) and its values as `String`s. All rows in the file must be the same length and the field names in the header row must be valid `Object` field names, or an error is raised.
3. `Array[Object] read_tsv(File, Boolean, Array[String])`: The second parameter specifies whether the TSV file contains a header line, and the third parameter is an array of field names that is used to specify the field names to use for the returned `Object`s. If the second parameter is `true`, the specified field names override those in the file's header (i.e., the header line is ignored).

If the file is empty, an empty array is returned.

If the entire contents of the file can not be read for any reason, the calling task or workflow fails with an error. Examples of failure include, but are not limited to, not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation-imposed file size limits.

**Parameters**

1. `File`: The TSV file to read.
2. `Boolean`: (Optional) Whether to treat the file's first line as a header.
3. `Array[String]`: (Optional) An array of field names. If specified, then the second parameter is also required.

**Returns**: An `Array` of rows in the TSV file, where each row is an `Array[String]` of fields or an `Object` with keys determined by the second and third parameters and `String` values.

Example: read_tsv_task.wdl


```wdl
version 1.2

task read_tsv {
  command <<<
    {
      printf "row1\tvalue1\n"
      printf "row2\tvalue2\n"
      printf "row3\tvalue3\n"
    } >> data.no_headers.tsv

    {
      printf "header1\theader2\n"
      printf "row1\tvalue1\n"
      printf "row2\tvalue2\n"
      printf "row3\tvalue3\n"
    } >> data.headers.tsv
  >>>

  output {
    Array[Array[String]] output_table = read_tsv("data.no_headers.tsv")
    Array[Object] output_objs1 = read_tsv("data.no_headers.tsv", false, ["name", "value"])
    Array[Object] output_objs2 = read_tsv("data.headers.tsv", true)
    Array[Object] output_objs3 = read_tsv("data.headers.tsv", true, ["name", "value"])
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
  "read_tsv.output_table": [
    ["row1", "value1"],
    ["row2", "value2"],
    ["row3", "value3"]
  ],
  "read_tsv.output_objs1": [
    {
      "name": "row1",
      "value": "value1"
    },
    {
      "name": "row2",
      "value": "value2"
    },
    {
      "name": "row3",
      "value": "value3"
    }
  ],
  "read_tsv.output_objs2": [
    {
      "header1": "row1",
      "header2": "value1"
    },
    {
      "header1": "row2",
      "header2": "value2"
    },
    {
      "header1": "row3",
      "header2": "value3"
    }
  ],  
  "read_tsv.output_objs3": [
    {
      "name": "row1",
      "value": "value1"
    },
    {
      "name": "row2",
      "value": "value2"
    },
    {
      "name": "row3",
      "value": "value3"
    }
  ]
}
```


</details>

