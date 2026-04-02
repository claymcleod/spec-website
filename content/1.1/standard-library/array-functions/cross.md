+++
title = "cross"
description = "Compute cross product of two arrays"
weight = 5030
+++

```
Array[Pair[X,Y]] cross(Array[X], Array[Y])
```

Creates an array of `Pair`s containing the [cross product](https://en.wikipedia.org/wiki/Cross_product) of two input arrays, i.e., each element in the first array is paired with each element in the second array.

Given `Array[X]` of length `M`, and `Array[Y]` of length `N`, the cross product is `Array[Pair[X, Y]]` of length `M*N` with the following elements: `[(X0, Y0), (X0, Y1), ..., (X0, Yn-1), (X1, Y0), ..., (X1, Yn-1), ..., (Xm-1, Yn-1)]`. If either of the input arrays is empty, an empty array is returned.

**Parameters**

1. `Array[X]`: The first array of length `M`.
2. `Array[Y]`: The second array of length `N`.

**Returns**: An `Array[Pair[X, Y]]` of length `M*N`.

Example: test_cross.wdl


```wdl
version 1.1

workflow test_cross {
  Array[Int] xs = [1, 2, 3]
  Array[String] ys = ["a", "b"]
  Array[Pair[Int, String]] expected = [
    (1, "a"), (1, "b"), (2, "a"), (2, "b"), (3, "a"), (3, "b")
  ]

  output {
    Boolean is_true = cross(xs, ys) == expected
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
  "test_cross.is_true": true
}
```


</details>
