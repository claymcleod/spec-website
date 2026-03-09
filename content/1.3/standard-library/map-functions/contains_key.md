+++
title = "contains_key"
description = "Test whether a collection contains a key"
weight = 40
+++

*as of version 1.2*

```
* Boolean contains_key(Map[P, Y], P)
* Boolean contains_key(Object, String)
* Boolean contains_key(Map[String, Y]|Struct|Object, Array[String])
```

Given a key-value type collection (`Map`, `Struct`, or `Object`) and a key, tests whether the collection contains an entry with the given key.

This function has three choices:

1. `Boolean contains_key(Map[P, Y], P)`: Tests whether the `Map` has an entry with the given key. If `P` is an optional type (e.g., `String?`), then the second argument may be `None`.
2. `Boolean contains_key(Object, String)`: Tests whether the `Object` has an entry with the given name.
3. `Boolean contains_key(Map[String, Y]|Struct|Object, Array[String])`: Tests recursively for the presence of a compound key within a nested collection.

For the third choice, the first argument is a collection that may be nested to any level, i.e., contain values that are collections, which themselves may contain collections, and so on. The second argument is an array of keys that are resolved recursively. If the value associated with any except the last key in the array is `None` or not a collection type, this function returns `false`.

For example, if the first argument is a `Map[String, Map[String, Int]]` and the second argument is `["foo", "bar"]`, then the outer `Map` is tested for the presence of key "foo", and if it is present, then its value is tested for the presence of key "bar". This only tests for the presence of the named element, *not* whether or not it is `defined`.

**Parameters**

1. `Map[P, Y]`|`Struct`|`Object`: Collection to search for the key.
2. `P|Array[String]`: The key to search. If the first argument is a `Map`, then the key must be of the same type as the `Map`'s key type. If the `Map`'s key type is optional then the key may also be optional. If the first argument is a `Map[String, Y]`, `Struct`, or `Object`, then the key may be either a `String` or `Array[String]`.

**Returns**: `true` if the collection contains the key, otherwise false.

**Example**

<details>
  <summary>
  Example: test_contains_key.wdl

  ```wdl
  version 1.3

  struct Person {
    String name
    Map[String, String] details
  }

  workflow test_contains_key {
    input {
      Map[String, Int] m
      String key1
      String key2
      Person p1
      Person p2
    }

    output {
      Int? i1 = if contains_key(m, key1) then m[key1] else None
      Int? i2 = if contains_key(m, key2) then m[key2] else None

      String? phone1 = if contains_key(p1.details, "phone") then p1.details["phone"] else None
      String? phone2 = if contains_key(p2.details, "phone") then p2.details["phone"] else None

    }
  }
  ```
  </summary>
  <p>
  Example input:

  ```json
  {
    "test_contains_key.m": {"a": 1, "b": 2},
    "test_contains_key.key1": "a",
    "test_contains_key.key2": "c",
    "test_contains_key.p1": {
      "name": "John",
      "details": {
        "phone": "123-456-7890"
      }
    },
    "test_contains_key.p2": {
      "name": "Agent X",
      "details": {
      }
    }
  }
  ```

  Example output:

  ```json
  {
    "test_contains_key.i1": 1,
    "test_contains_key.i2": null,
    "test_contains_key.phone1": "123-456-7890",
    "test_contains_key.phone2": null
  }
  ```
  </p>
</details>
