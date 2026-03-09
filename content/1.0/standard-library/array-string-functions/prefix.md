+++
title = "prefix"
description = "Add prefix to strings"
weight = 10
+++

```
Array[String] prefix(String, Array[X])
```

Given a `String` and an `Array[X]` where `X` is a primitive type, the `prefix` function returns an array of strings comprised of each element of the input array prefixed by the specified prefix string.

**Parameters**

1. `String`: The prefix to prepend to each element in the array.
2. `Array[X]`: Array with a primitive element type.

**Returns**: An `Array[String]` with the prefixed elements of the input array.

<details>
<summary>
Example: prefix_example.wdl

```wdl
Array[String] env = ["key1=value1", "key2=value2", "key3=value3"]
Array[String] env_param = prefix("-e ", env) # ["-e key1=value1", "-e key2=value2", "-e key3=value3"]

Array[Integer] env2 = [1, 2, 3]
Array[String] env2_param = prefix("-f ", env2) # ["-f 1", "-f 2", "-f 3"]
```
</summary>
</details>
