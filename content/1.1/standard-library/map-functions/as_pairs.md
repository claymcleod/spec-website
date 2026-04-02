+++
title = "as_pairs"
description = "Convert map to pairs"
weight = 6010
+++
```
Array[Pair[P, Y]] as_pairs(Map[P, Y])
```

Converts a `Map` into an `Array` of `Pair`s. Since `Map`s are ordered, the output array will always have elements in the same order they were added to the `Map`.

**Parameters**

1. `Map[P, Y]`: `Map` to convert to `Pair`s.

**Returns**: Ordered `Array` of `Pair`s, where each pair contains the key (left) and value (right) of a `Map` element.

Example: test_as_pairs.wdl


```wdl
version 1.1

workflow test_as_pairs {
  Map[String, Int] x = {"a": 1, "c": 3, "b": 2}
  Map[String, Pair[File, File]] y = {"a": ("data/questions.txt", "data/answers.txt"), "b": ("data/request.txt", "data/response.txt")}
  Array[Pair[String, Int]] expected1 = [("a", 1), ("c", 3), ("b", 2)]
  Array[Pair[File, String]] expected2 = [("data/questions.txt", "a"), ("data/request.txt", "b")]
  Map[File, String] expected3 = {"data/questions.txt": "a", "data/request.txt": "b"}

  scatter (item in as_pairs(y)) {
    String s = item.left
    Pair[File, File] files = item.right
    Pair[File, String] bams = (files.left, s)
  }
  
  Map[File, String] bam_to_name = as_map(bams)

  output {
    Boolean is_true1 = as_pairs(x) == expected1
    Boolean is_true2 = bams == expected2
    Boolean is_true3 = bam_to_name == expected3
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
  "test_as_pairs.is_true1": true,
  "test_as_pairs.is_true2": true,
  "test_as_pairs.is_true3": true
}
```


</details>
