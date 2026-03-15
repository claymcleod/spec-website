+++
title = "read_objects"
description = "Read a TSV file as an array of objects"
weight = 105
+++

```
Array[Object] read_objects(File)
```

Reads a tab-separated value (TSV) file representing the names and values of the members of any number of `Object`s. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

The first line of the file must be a header row with the names of the object members. The names in the first row must be unique; if there are any duplicate names, an error is raised.

There are any number of additional rows, where each additional row contains the values of an object corresponding to the member names. Each row in the file must have the same number of fields as the header row. All of the `Object`'s values are of type `String`.

If the file is empty or contains only a header line, an empty array is returned.

**Parameters**

1. `File`: Path of the TSV file to read.

**Returns**: An `Array[Object]`, with `N-1` elements, where `N` is the number of rows in the file.

Example: read_objects_task.wdl


```wdl
version 1.3

task read_objects {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_A{}".format(i) for i in range(3)]))
    print('\t'.join(["value_B{}".format(i) for i in range(3)]))
    print('\t'.join(["value_C{}".format(i) for i in range(3)]))
    CODE
  >>>

  output {
    Array[Object] my_obj = read_objects(stdout())
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
  "read_objects.my_obj": [
    {
      "key_0": "value_A0",
      "key_1": "value_A1",
      "key_2": "value_A2"
    },
    {
      "key_0": "value_B0",
      "key_1": "value_B1",
      "key_2": "value_B2"
    },
    {
      "key_0": "value_C0",
      "key_1": "value_C1",
      "key_2": "value_C2"
    }
  ]
}
```


</details>

The command outputs the following lines to stdout:

```
key_0\tkey_1\tkey_3
value_A0\tvalue_A1\tvalue_A2
value_B0\tvalue_B1\tvalue_B2
value_C0\tvalue_C1\tvalue_C2
```

Which are read into an `Array[Object]` with the following elements:

| Index | Attribute | Value |
|-|-|-|
| 0 | key_0 | "value_A0" |
| | key_1 | "value_A1" |
| | key_2 | "value_A2" |
| 1 | key_0 | "value_B0" |
| | key_1 | "value_B1" |
| | key_2 | "value_B2" |
| 2 | key_0 | "value_C0" |
| | key_1 | "value_C1" |
| | key_2 | "value_C2" |
