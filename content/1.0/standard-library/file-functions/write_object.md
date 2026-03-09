+++
title = "write_object"
description = "Write an Object as a TSV file"
weight = 160
+++

```
File write_object(Object)
```

Given any `Object`, this will write out a 2-row, n-column TSV file with the object's attributes and values.

**Parameters**

1. `Object`: The object to write.

**Returns**: A `File` containing the object's attributes as headers and values as data in TSV format.

<details>
<summary>
Example: write_object_task.wdl

```wdl
task test {
  Object input
  command <<<
    /bin/do_work --obj=~{write_object(input)}
  >>>
  output {
    File results = stdout()
  }
}
```
</summary>
<p>

If `input` were to have the value:

|Attribute|Value|
|-|-|
|key_1|"value_1"|
|key_2|"value_2"|
|key_3|"value_3"|

The command would instantiate to:

```
/bin/do_work --obj=/path/to/input.tsv
```

Where `/path/to/input.tsv` would contain:

```
key_1	key_2	key_3
value_1	value_2	value_3
```

</p>
</details>
