+++
title = "collect_by_key"
description = "Collect values by key"
weight = 60
+++

```
Map[P, Array[Y]] collect_by_key(Array[Pair[P, Y]])
```

Given an `Array` of `Pair`s, creates a `Map` in which the right elements of the `Pair`s are grouped by the left elements. In other words, the input `Array` may have multiple `Pair`s with the same key. Rather than causing an error (as would happen with [`as_map`](@/standard-library/map-functions/as_map.md)), all the values with the same key are grouped together into an `Array`.

The order of the keys in the output `Map` is the same as the order of their first occurrence in the input `Array`. The order of the elements in the `Map` values is the same as their order of occurrence in the input `Array`.

**Parameters**

1. `Array[Pair[P, Y]]`: `Array` of `Pair`s to group.

**Returns**: `Map` of keys to `Array`s of values.

<details>
<summary>
Example: test_collect_by_key.wdl

```wdl
version 1.2

workflow test_collect_by_key {
  input {
    Array[Pair[String, Int]] x = [("a", 1), ("b", 2), ("a", 3)]
    Array[Pair[String, Pair[File, File]]] y = [
      ("a", ("data/questions.txt", "data/answers.txt")),
      ("b", ("data/request.txt", "data/response.txt")),
      ("a", ("data/wizard.txt", "data/spell.txt"))
    ]
    Map[String, Array[Int]] expected1 = {"a": [1, 3], "b": [2]}
    Map[String, Array[Pair[File, File]]] expected2 = {
      "a": [("data/questions.txt", "data/answers.txt"), ("data/wizard.txt", "data/spell.txt")],
      "b": [("data/request.txt", "data/response.txt")]
    }
  }

  output {
    Boolean is_true1 = collect_by_key(x) == expected1
    Boolean is_true2 = collect_by_key(y) == expected2
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
  "test_collect_by_key.is_true1": true,
  "test_collect_by_key.is_true2": true
}
```
</p>
</details>

