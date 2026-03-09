+++
title = "keys"
description = "Extract keys from a map"
weight = 30
+++

<span class="wdl-badge wdl-badge-new">New in 1.1</span>

```
Array[P] keys(Map[P, Y])
```

Creates an `Array` of the keys from the input `Map`, in the same order as the elements in the map.

**Parameters**

1. `Map[P, Y]`: `Map` from which to extract keys.

**Returns**: `Array[P]` of the input `Map`s keys.

<details>
<summary>
Example: test_keys.wdl

```wdl
version 1.1

workflow test_keys {
  input {
    Map[String,Int] x = {"a": 1, "b": 2, "c": 3}
    Map[String, Pair[File, File]] str_to_files = {
      "a": ("data/questions.txt", "data/answers.txt"),
      "b": ("data/request.txt", "data/response.txt")
    }
  }

  scatter (item in as_pairs(str_to_files)) {
    String key = item.left
  }

  Array[String] str_to_files_keys = key
  Array[String] expected = ["a", "b", "c"]

  output {
    Boolean is_true1 = keys(x) == expected
    Boolean is_true2 = str_to_files_keys == keys(str_to_files)
  }
}
```
</summary>
<p>
Example input:

```json
{}
```

Example output:

```json
{
  "test_keys.is_true1": true,
  "test_keys.is_true2": true
}
```
</p>
</details>
