+++
title = "chunk"
description = "Split an array into sub-arrays of a given size"
weight = 5070
+++

*as of version 1.2*

```
Array[Array[X]] chunk(Array[X], Int)
```

Given an array and a length *n*, splits the array into consecutive, non-overlapping arrays of *n* elements. If the length of the array is not a multiple *n* then the final sub-array will have `length(array) % n` elements.

**Parameters**

1. `Array[X]`: The array to split. May be empty.
2. `Int`: The desired length of the sub-arrays. Must be > 0.

**Returns**: An array of sub-arrays, where each sub-array is of length `N` except possibly the last one.

Example: chunk_array.wdl


```wdl
version 1.3
workflow chunk_array {
  Array[String] s1 = ["a", "b", "c", "d", "e", "f"]
  Array[String] s2 = ["a", "b", "c", "d", "e"]
  Array[String] s3 = ["a", "b"]
  Array[String] s4 = []

  scatter (a in chunk(s1, 3)) {
    String concat = sep("", a)
  }

  output {
    Boolean is_reversible = s1 == flatten(chunk(s1, 3))
    Array[Array[String]] o1 = chunk(s1, 3)
    Array[Array[String]] o2 = chunk(s2, 3)
    Array[Array[String]] o3 = chunk(s3, 3)
    Array[Array[String]] o4 = chunk(s4, 3)
    Array[String] concats = concat
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
  "chunk_array.is_reversible": true,
  "chunk_array.o1": [["a", "b", "c"], ["d", "e", "f"]],
  "chunk_array.o2": [["a", "b", "c"], ["d", "e"]],
  "chunk_array.o3": [["a", "b"]],
  "chunk_array.o4": [],
  "chunk_array.concats": ["abc", "def"]
}
```


</details>
