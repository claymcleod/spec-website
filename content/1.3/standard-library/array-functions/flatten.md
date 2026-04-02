+++
title = "flatten"
description = "Flatten a nested array"
weight = 5080
+++

```
Array[X] flatten(Array[Array[X]])
```

Flattens a nested `Array[Array[X]]` by concatenating all of the element arrays, in order, into a single array. The function is not recursive - e.g. if the input is `Array[Array[Array[Int]]]` then the output will be `Array[Array[Int]]`. The elements in the concatenated array are *not* deduplicated.

**Parameters**

1. `Array[Array[X]]`: A nested array to flatten.

**Returns**: An `Array[X]` containing the concatenated elements of the input array.

Example: test_flatten.wdl


```wdl
version 1.3

workflow test_flatten {
  input {
    Array[Array[Int]] ai2D = [[1, 2, 3], [1], [21, 22]]
    Array[Array[File]] af2D = [["data/cities.txt"], ["data/wizard.txt", "data/spell.txt"], []]
    Array[Array[Pair[Float, String]]] aap2D = [[(0.1, "mouse")], [(3, "cat"), (15, "dog")]]
    Map[Float, String] f2s = as_map(flatten(aap2D))
    Array[Array[Array[Int]]] ai3D = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
    Array[Int] expected1D = [1, 2, 3, 1, 21, 22]
    Array[File] expected2D = ["data/cities.txt", "data/wizard.txt", "data/spell.txt"]
    Array[Array[Int]] expected3D = [[1, 2], [3, 4], [5, 6], [7, 8]]
    Array[Pair[Float, String]] expectedArray = [(0.1, "mouse"), (3.0, "cat"), (15.0, "dog")]
    Map[Float, String] expectedMap = {0.1: "mouse", 3.0: "cat", 15.0: "dog"}
  }

  output {
    Boolean is_true1 = flatten(ai2D) == expected1D
    Boolean is_true2 = flatten(af2D) == expected2D
    Boolean is_true3 = flatten(aap2D) == expectedArray
    Boolean is_true4 = flatten(ai3D) == expected3D
    Boolean is_true5 = f2s == expectedMap
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
  "test_flatten.is_true1": true,
  "test_flatten.is_true2": true,
  "test_flatten.is_true3": true,
  "test_flatten.is_true4": true,
  "test_flatten.is_true5": true
}
```


</details>
