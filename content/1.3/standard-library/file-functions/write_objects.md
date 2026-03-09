+++
title = "write_objects"
description = "Write an array of objects or structs to a TSV file"
weight = 115
+++

```
File write_objects(Array[Struct|Object])
```

Writes a tab-separated value (TSV) file with the contents of a `Array[Struct]` or `Array[Object]`. All elements of the `Array` must have the same member names, or an error is raised.

The file contains `N+1` tab-delimited lines, where `N` is the number of elements in the `Array`. The first line is the names of the `Struct`/`Object` members, and the subsequent lines are the corresponding values for each element. Each line is terminated by a newline (`\n`) character. The lines are written in the same order as the elements in the `Array`. The ordering of the columns is the same as the order in which the `Struct`'s members are defined; the column ordering for `Object`s is unspecified. If the `Array` is empty, an empty file is written.

The member values must be serializable to strings, meaning that only primitive types are supported. Attempting to write a `Struct` or `Object` that has a compound member value results in an error.

**Parameters**

1. `Array[Struct|Object]`: An array of objects to write.

**Returns**: A `File`.

<details>
<summary>
Example: write_objects_task.wdl

```wdl
version 1.3

task write_objects {
  input {
    Array[Object] obj_array
  }

  command <<<
    cut -f 1 ~{write_objects(obj_array)}
  >>>

  output {
    Array[String] results = read_lines(stdout())
  }
}
```
</summary>
<p>
Example input:

```json
{
  "write_objects.obj_array": [
    {
      "key_1": "value_1",
      "key_2": "value_2",
      "key_3": "value_3"
    },
    {
      "key_1": "value_4",
      "key_2": "value_5",
      "key_3": "value_6"
    },
    {
      "key_1": "value_7",
      "key_2": "value_8",
      "key_3": "value_9"
    }
  ]
}
```

Example output:

```json
{
  "write_objects.results": ["key_1", "value_1", "value_4", "value_7"]
}
```
</p>
</details>

The actual command line might look like:

```sh
cut -f 1 /path/to/input.tsv
```

If `obj_array` has the items:

| Index | Attribute | Value |
|-|-|-|
| 0 | key_1 | "value_1" |
| | key_2 | "value_2" |
| | key_3 | "value_3" |
| 1 | key_1 | "value_4" |
| | key_2 | "value_5" |
| | key_3 | "value_6" |
| 2 | key_1 | "value_7" |
| | key_2 | "value_8" |
| | key_3 | "value_9" |

The `/path/to/input.tsv` will contain:

```
key_1\tkey_2\tkey_3
value_1\tvalue_2\tvalue_3
value_4\tvalue_5\tvalue_6
value_7\tvalue_8\tvalue_9
```
