+++
title = "cross"
description = "Cross product of two arrays"
weight = 40
+++

```
Array[Pair[X,Y]] cross(Array[X], Array[Y])
```

Given any two arrays, the `cross` function returns the cross product of those arrays in the form of an array of `Pair` objects.

**Parameters**

1. `Array[X]`: The first array.
2. `Array[Y]`: The second array.

**Returns**: An `Array[Pair[X,Y]]` containing every possible pairing of elements from the two input arrays.

Example: cross_example.wdl

```wdl
Array[Int] xs = [ 1, 2, 3 ]
Array[String] zs = [ "d", "e" ]

Array[Pair[Int, String]] crossed = cross(xs, zs) # i.e. crossed = [ (1, "d"), (1, "e"), (2, "d"), (2, "e"), (3, "d"), (3, "e") ]
```

