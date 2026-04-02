+++
title = "read_objects"
description = "Read a multi-row TSV as an Array of Objects"
weight = 3200
+++

```
Array[Object] read_objects(String|File)
```

Given a file-like object that contains a header row and one or more data rows in TSV format, this function will turn that into an `Array[Object]`.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of a TSV file with a header row and data rows.

**Returns**: An `Array[Object]` with each data row represented as an Object.

Example: read_objects_task.wdl


```wdl
task test {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    CODE
  >>>
  output {
    Array[Object] my_obj = read_objects(stdout())
  }
}
```


<details>
<summary></summary>


The command will output to stdout the following:

```
key_1	key_2	key_3
value_1	value_2	value_3
value_1	value_2	value_3
value_1	value_2	value_3
```

Which would be turned into an `Array[Object]` in WDL that would look like this:

|Index|Attribute|Value|
|-|-|-|
|0|key_1|"value_1"|
| |key_2|"value_2"|
| |key_3|"value_3"|
|1|key_1|"value_1"|
| |key_2|"value_2"|
| |key_3|"value_3"|
|2|key_1|"value_1"|
| |key_2|"value_2"|
| |key_3|"value_3"|


</details>
