+++
title = "zip"
description = "Zip arrays together"
weight = 40
+++

```
Array[Pair[X,Y]] zip(Array[X], Array[Y])
```

Creates an array of `Pair`s containing the [dot product](https://en.wikipedia.org/wiki/Dot_product) of two input arrays, i.e., the elements at the same indices in each array `X[i]` and `Y[i]` are combined together into (`X[i]`, `Y[i]`) for each `i` in `range(length(X))`. The input arrays must have the same lengths or an error is raised. If the input arrays are empty, an empty array is returned.

**Parameters**

1. `Array[X]`: The first array of length `N`.
2. `Array[Y]`: The second array of length `N`.

**Returns**: An `Array[Pair[X, Y]]` of length `N`.

Example: test_zip.wdl


```wdl
version 1.2

workflow test_zip {
  Array[Int] xs = [1, 2, 3]
  Array[String] ys = ["a", "b", "c"]
  Array[Pair[Int, String]] expected = [(1, "a"), (2, "b"), (3, "c")]
  
  output {
    Boolean is_true = zip(xs, ys) == expected
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
  "test_zip.is_true": true
}
```


</details>

Example: test_zip_fail.wdl


```wdl
version 1.2

workflow test_zip_fail {
  Array[Int] xs = [1, 2, 3]
  Array[String] zs = ["d", "e"]
  # this fails with an error - xs and zs are not the same length
  Array[Pair[Int, String]] bad = zip(xs, zs)
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>

