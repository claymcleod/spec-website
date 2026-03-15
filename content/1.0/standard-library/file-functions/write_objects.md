+++
title = "write_objects"
description = "Write an Array of Objects as a TSV file"
weight = 170
+++

```
File write_objects(Array[Object])
```

Given any `Array[Object]`, this will write out a 2+ row, n-column TSV file with each object's attributes and values.

**Parameters**

1. `Array[Object]`: The array of objects to write.

**Returns**: A `File` containing the objects' attributes as headers and values as data rows in TSV format.

Example: write_objects_task.wdl


```wdl
task test {
  input {
    Array[Object] in
  }
  command <<<
    /bin/do_work --obj=~{write_objects(in)}
  >>>
  output {
    File results = stdout()
  }
}
```


<details>
<summary></summary>


If `in` were to have the value:

|Index|Attribute|Value|
|-|-|-|
|0|key_1|"value_1"|
| |key_2|"value_2"|
| |key_3|"value_3"|
|1|key_1|"value_4"|
| |key_2|"value_5"|
| |key_3|"value_6"|
|2|key_1|"value_7"|
| |key_2|"value_8"|
| |key_3|"value_9"|

The command would instantiate to:

```
/bin/do_work --obj=/path/to/input.tsv
```

Where `/path/to/input.tsv` would contain:

```
key_1	key_2	key_3
value_1	value_2	value_3
value_4	value_5	value_6
value_7	value_8	value_9
```


</details>
