+++
title = "length"
description = "Get length of an array"
weight = 50
+++

```
Integer length(Array[X])
```

Given an Array, the `length` function returns the number of elements in the Array as an Integer.

**Parameters**

1. `Array[X]`: The array whose length to determine.

**Returns**: An `Integer` representing the number of elements in the array.

Example: length_example.wdl

```wdl
Array[Int] xs = [ 1, 2, 3 ]
Array[String] ys = [ "a", "b", "c" ]
Array[String] zs = [ ]

Integer xlen = length(xs) # 3
Integer ylen = length(ys) # 3
Integer zlen = length(zs) # 0
```

