+++
title = "read_object"
description = "Read a two-row TSV file as an object"
weight = 100
+++

```
Object read_object(File)
```

Reads a tab-separated value (TSV) file representing the names and values of the members of an `Object`. There must be exactly two rows, and each row must have the same number of elements, otherwise an error is raised. Trailing end-of-line characters (`\r` and `\n`) are removed from each line.

The first row specifies the object member names. The names in the first row must be unique; if there are any duplicate names, an error is raised.

The second row specifies the object member values corresponding to the names in the first row. All of the `Object`'s values are of type `String`.

**Parameters**

1. `File`: Path of the two-row TSV file to read.

**Returns**: An `Object`, with as many members as there are unique names in the TSV.

<details>
<summary>
Example: read_object_task.wdl

```wdl
version 1.3

task read_object {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    CODE
  >>>

  output {
    Object my_obj = read_object(stdout())
  }

  requirements {
    container: "python:latest"
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
  "read_object.my_obj": {
    "key_0": "value_0",
    "key_1": "value_1",
    "key_2": "value_2"
  }
}
```
</p>
</details>

The command outputs the following lines to stdout:

```
key_0\tkey_1\tkey_2
value_0\tvalue_1\tvalue_2
```

Which are read into an `Object` with the following members:

| Attribute | Value |
|-|-|
| key_0 | "value_0" |
| key_1 | "value_1" |
| key_2 | "value_2" |
