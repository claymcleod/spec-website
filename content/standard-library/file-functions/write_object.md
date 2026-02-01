+++
title = "write_object"
description = "Write object to file"
weight = 210
+++

```
File write_object(Struct|Object)
```

Writes a tab-separated value (TSV) file with the contents of a `Object` or `Struct`. The file contains two tab-delimited lines. The first line is the names of the members, and the second line is the corresponding values. Each line is terminated by the newline (`\n`) character. The ordering of the columns is unspecified.

The member values must be serializable to strings, meaning that only primitive types are supported. Attempting to write a `Struct` or `Object` that has a compound member value results in an error.

**Parameters**

1. `Struct|Object`: An object to write.

**Returns**: A `File`.

<details>
<summary>
Example: write_object_task.wdl

```wdl
version 1.2

task write_object {
  input {
    Object obj
  }

  command <<<
    cut -f 1 ~{write_object(obj)}
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
  "write_object.obj": {
    "key_1": "value_1",
    "key_2": "value_2",
    "key_3": "value_3"
  }
}
```

Example output:

```json
{
  "write_object.results": ["key_1", "value_1"]
}
```
</p>
</details>

The actual command line might look like:

```sh
cut -f 1 /path/to/input.tsv
```

If `obj` has the following members:

| Attribute | Value     |
| --------- | --------- |
| key_1     | "value_1" |
| key_2     | "value_2" |
| key_3     | "value_3" |

Then `/path/to/input.tsv` will contain:

```
key_1\tkey_2\tkey_3
value_1\tvalue_2\tvalue_3
```

