+++
title = "squote"
description = "Single-quote each element of an array"
weight = 4040
+++

```
Array[String] squote(Array[P])
```

Adds single-quotes (`'`) around each element of the input array of primitive values. Equivalent to evaluating `"'~{array[i]}'"` for each `i` in `range(length(array))`.

**Parameters**

1. `Array[P]`: Array with a primitive element type.

**Returns**: An `Array[String]` the single-quoted elements of the input array.

Example: test_squote.wdl


```wdl
version 1.3

workflow test_squote {
  Array[String] env1 = ["key1=value1", "key2=value2", "key3=value3"]
  Array[Int] env2 = [1, 2, 3]

  output {
    Array[String] env1_quoted =  squote(env1)
    Array[String] env2_quoted = squote(env2)
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
  "test_squote.env1_quoted": ["'key1=value1'", "'key2=value2'", "'key3=value3'"],
  "test_squote.env2_quoted": ["'1'", "'2'", "'3'"]
}
```


</details>
