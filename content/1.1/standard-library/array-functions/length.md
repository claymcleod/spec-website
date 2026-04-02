+++
title = "length"
description = "Get the length of an array"
weight = 5090
+++

```
Int length(Array[X])```

Returns the number of elements in an array as an `Int`.

**Parameters**

1. `Array[X]`: An array with any element type.

**Returns**: The length of the array as an `Int`.

Example: test_length.wdl


```wdl
version 1.1

workflow test_length {
  Array[Int] xs = [1, 2, 3]
  Array[String] ys = ["a", "b", "c"]
  Array[String] zs = []

  output {
    Int xlen = length(xs) # 3
    Int ylen = length(ys) # 3
    Int zlen = length(zs) # 0
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
  "test_length.xlen": 3,
  "test_length.ylen": 3,
  "test_length.zlen": 0
}
```


</details>
