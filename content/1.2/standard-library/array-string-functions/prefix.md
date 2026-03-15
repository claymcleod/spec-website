+++
title = "prefix"
description = "Add prefix to strings"
weight = 10
+++

```
Array[String] prefix(String, Array[P])
```

Adds a prefix to each element of the input array of primitive values. Equivalent to evaluating `"~{prefix}~{array[i]}"` for each `i` in `range(length(array))`.

**Parameters**

1. `String`: The prefix to prepend to each element in the array.
2. `Array[P]`: Array with a primitive element type.

**Returns**: An `Array[String]` with the prefixed elements of the input array.

Example: test_prefix.wdl


```wdl
version 1.2

workflow test_prefix {
  Array[String] env1 = ["key1=value1", "key2=value2", "key3=value3"]
  Array[Int] env2 = [1, 2, 3]

  output {
    Array[String] env1_prefixed = prefix("-e ", env1)
    Array[String] env2_prefixed = prefix("-f ", env2)
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
  "test_prefix.env1_prefixed": ["-e key1=value1", "-e key2=value2", "-e key3=value3"],
  "test_prefix.env2_prefixed": ["-f 1", "-f 2", "-f 3"]
}
```


</details>

Example: test_prefix_fail.wdl


```wdl
version 1.2

workflow test_prefix_fail {
  Array[Array[String]] env3 = [["a", "b], ["c", "d"]]
  # this fails with an error - env3 element type is not primitive
  Array[String] bad = prefix("-x ", env3)
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

