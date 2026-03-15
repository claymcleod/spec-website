+++
title = "as_map"
description = "Convert pairs to map"
weight = 20
+++

```
Map[P, Y] as_map(Array[Pair[P, Y]])
```

Converts an `Array` of `Pair`s into a `Map` in which the left elements of the `Pair`s are the keys and the right elements the values. All the keys must be unique, or an error is raised. The order of the key/value pairs in the output `Map` is the same as the order of the `Pair`s in the `Array`.

**Parameters**

1. `Array[Pair[P, Y]]`: Array of `Pair`s to convert to a `Map`.

**Returns**: `Map[P, Y]` of the elements in the input array.

Example: test_as_map.wdl


```wdl
version 1.2

workflow test_as_map {
  input {
    Array[Pair[String, Int]] x = [("a", 1), ("c", 3), ("b", 2)]
    Array[Pair[String, Pair[File,File]]] y = [("a", ("data/cities.txt", "data/comment.txt")), ("b", ("data/hello.txt", "data/greetings.txt"))]
    Map[String, Int] expected1 = {"a": 1, "c": 3, "b": 2}
    Map[String, Pair[File, File]] expected2 = {"a": ("data/cities.txt", "data/comment.txt"), "b": ("data/hello.txt", "data/greetings.txt")}
  }

  output {
    Boolean is_true1 = as_map(x) == expected1
    Boolean is_true2 = as_map(y) == expected2
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
  "test_as_map.is_true1": true,
  "test_as_map.is_true2": true
}
```


</details>

Example: test_as_map_fail.wdl


```wdl
version 1.2

workflow test_as_map_fail {
  # this fails with an error - the "a" key is duplicated
  Boolean bad = as_map([("a", 1), ("a", 2)])
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

