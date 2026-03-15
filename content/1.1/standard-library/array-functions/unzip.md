+++
title = "unzip"
description = "Split array of pairs into pair of arrays"
weight = 60
+++
```
Pair[Array[X], Array[Y]] unzip(Array[Pair[X, Y]])
```

Creates a `Pair` of `Arrays`, the first containing the elements from the `left` members of an `Array` of `Pair`s, and the second containing the `right` members. If the array is empty, a pair of empty arrays is returned. This is the inverse of the `zip` function.

**Parameters**

1. `Array[Pair[X, Y]]`: The `Array` of `Pair`s of length `N` to unzip.

**Returns**: A `Pair[Array[X], Array[Y]]` where each `Array` is of length `N`.

Example: test_unzip.wdl


```wdl
version 1.1

workflow test_unzip {
  Array[Pair[Int, String]] int_str_arr = [(0, "hello"), (42, "goodbye")]
  Map[String, Int] m = {"a": 0, "b": 1, "c": 2}
  Pair[Array[String], Array[Int]] keys_and_values = unzip(as_pairs(m))
  Pair[Array[Int], Array[String]] expected1 = ([0, 42], ["hello", "goodbye"])
  Array[String] expected_keys = ["a", "b", "c"]
  Array[Int] expected_values = [0, 1, 2]
  
  output {
    Boolean is_true1 = unzip(int_str_arr) == expected1
    Boolean is_true2 = keys_and_values.left == expected_keys
    Boolean is_true3 = keys_and_values.right == expected_values
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
  "test_unzip.is_true1": true,
  "test_unzip.is_true2": true,
  "test_unzip.is_true3": true
}
```


</details>
