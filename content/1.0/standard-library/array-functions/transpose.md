+++
title = "transpose"
description = "Transpose a 2D array"
weight = 20
+++

```
Array[Array[X]] transpose(Array[Array[X]])
```

Given a two dimensional array argument, the `transpose` function transposes the two dimensional array according to the standard matrix transpose rules. For example `transpose( ((0, 1, 2), (3, 4, 5)) )` will return the rotated two-dimensional array: `((0, 3), (1, 4), (2, 5))`.

**Parameters**

1. `Array[Array[X]]`: A two-dimensional array to transpose.

**Returns**: An `Array[Array[X]]` with rows and columns swapped.
