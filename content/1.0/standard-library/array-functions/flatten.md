+++
title = "flatten"
description = "Flatten a nested array"
weight = 60
+++

```
Array[X] flatten(Array[Array[X]])
```

Given an array of arrays, the `flatten` function concatenates all the member arrays in the order of appearance to give the result. It does not deduplicate the elements. Arrays nested more deeply than 2 must be flattened twice (or more) to get down to an unnested `Array[X]`.

**Parameters**

1. `Array[Array[X]]`: A nested array to flatten.

**Returns**: An `Array[X]` containing all elements from the nested arrays in order.

Example: flatten_example.wdl


```wdl
Array[Array[Integer]] ai2D = [[1, 2, 3], [1], [21, 22]]
Array[Integer] ai = flatten(ai2D)   # [1, 2, 3, 1, 21, 22]

Array[Array[File]] af2D = [["/tmp/X.txt"], ["/tmp/Y.txt", "/tmp/Z.txt"], []]
Array[File] af = flatten(af2D)   # ["/tmp/X.txt", "/tmp/Y.txt", "/tmp/Z.txt"]

Array[Array[Pair[Float,String]]] aap2D = [[(0.1, "mouse")], [(3, "cat"), (15, "dog")]]

Array[Pair[Float,String]] ap = flatten(aap2D) # [(0.1, "mouse"), (3, "cat"), (15, "dog")]
```


<details>
<summary></summary>


The last example (`aap2D`) is useful because `Map[X, Y]` can be coerced to `Array[Pair[X, Y]]`.


</details>
