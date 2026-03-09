+++
title = "keys"
description = "Get the keys from a map, struct, or object"
weight = 30
+++

```
Array[P] keys(Map[P, Y])
Array[String] keys(Struct|Object)
```

Given a key-value type collection (`Map`, `Struct`, or `Object`), returns an `Array` of the keys from the input collection, in the same order as the elements in the collection.

When the argument is a `Struct`, the returned array will contain the keys in the same order they appear in the struct definition. When the argument is an `Object`, the returned array has no guaranteed order.

When the input `Map` or `Object` is empty, an empty array is returned.

**Parameters**

1. `Map[P, Y]`|`Struct`|`Object`: Collection from which to extract keys.

**Returns**: `Array[P]` of the input collection's keys. If the input is a `Struct` or `Object`, then the returned array will be of type `Array[String]`.

<details>
<summary>
Example: test_keys.wdl

```wdl
version 1.3

struct Name {
  String first
  String last
}

workflow test_keys {
  input {
    Map[String, Int] x = {"a": 1, "b": 2, "c": 3}
    Map[String, Pair[File, File]] str_to_files = {
      "a": ("data/questions.txt", "data/answers.txt"),
      "b": ("data/request.txt", "data/response.txt")
    }
    Name name = Name {
      first: "John",
      last: "Doe"
    }
  }

  scatter (item in as_pairs(str_to_files)) {
    String key = item.left
  }

  Array[String] str_to_files_keys = key
  Array[String] expected = ["a", "b", "c"]
  Array[String] expectedKeys = ["first", "last"]

  output {
    Boolean is_true1 = length(keys(x)) == 3 && keys(x) == expected
    Boolean is_true2 = str_to_files_keys == keys(str_to_files)
    Boolean is_true3 = length(keys(name)) == 2 && keys(name) == expectedKeys
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
  "test_keys.is_true2": true,
  "test_keys.is_true3": true
}
```
</p>
</details>
