+++
title = "zip"
description = "Zip two arrays into pairs"
weight = 30
+++

```
Array[Pair[X,Y]] zip(Array[X], Array[Y])
```

Given any two arrays, the `zip` function returns the dot product of those arrays in the form of an array of `Pair` objects.

**Parameters**

1. `Array[X]`: The first array.
2. `Array[Y]`: The second array.

**Returns**: An `Array[Pair[X,Y]]` where each element pairs corresponding elements from the two input arrays.

Example: zip_example.wdl

```wdl
Array[Int] xs = [ 1, 2, 3 ]
Array[String] ys = [ "a", "b", "c" ]

Array[Pair[Int, String]] zipped = zip(xs, ys)     # i.e.  zipped = [ (1, "a"), (2, "b"), (3, "c") ]
```

