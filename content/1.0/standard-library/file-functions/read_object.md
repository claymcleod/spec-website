+++
title = "read_object"
description = "Read a two-row TSV as an Object"
weight = 3190
+++

```
Object read_object(String|File)
```

Given a file-like object that contains a 2-row and n-column TSV file, this function will turn that into an Object.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of a 2-row, n-column TSV file to read.

**Returns**: An `Object` with attributes and values from the file.

Example: read_object_task.wdl


```wdl
task test {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    CODE
  >>>
  output {
    Object my_obj = read_object(stdout())
  }
}
```


<details>
<summary></summary>


The command will output to stdout the following:

```
key_1	key_2	key_3
value_1	value_2	value_3
```

Which would be turned into an `Object` in WDL that would look like this:

|Attribute|Value|
|-|-|
|key_1|"value_1"|
|key_2|"value_2"|
|key_3|"value_3"|


</details>
