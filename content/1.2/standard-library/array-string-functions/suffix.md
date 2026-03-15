+++
title = "suffix"
description = "Add suffix to strings"
weight = 20
+++

```
Array[String] suffix(String, Array[P])
```

Adds a suffix to each element of the input array of primitive values. Equivalent to evaluating `"~{array[i]}~{suffix}"` for each `i` in `range(length(array))`.

**Parameters**

1. `String`: The suffix to append to each element in the array.
2. `Array[P]`: Array with a primitive element type.

**Returns**: An `Array[String]` the suffixed elements of the input array.

Example: test_suffix.wdl


```wdl
version 1.2

workflow test_suffix {
  Array[String] env1 = ["key1=value1", "key2=value2", "key3=value3"]
  Array[Int] env2 = [1, 2, 3]

  output {
    Array[String] env1_suffix = suffix(".txt", env1)
    Array[String] env2_suffix = suffix(".0", env2)
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
  "test_suffix.env1_suffix": ["key1=value1.txt", "key2=value2.txt", "key3=value3.txt"],
  "test_suffix.env2_suffix": ["1.0", "2.0", "3.0"]
}
```


</details>

Example: test_suffix_fail.wdl


```wdl
version 1.2

workflow test_suffix_fail {
  Array[Array[String]] env3 = [["a", "b], ["c", "d"]]
  # this fails with an error - env3 element type is not primitive
  Array[String] bad = suffix("-z", env3)
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

