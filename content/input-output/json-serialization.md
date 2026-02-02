+++
title = "JSON Serialization of WDL Types"
weight = 40
+++

### Primitive Types

All primitive WDL types serialize naturally to JSON values:

| WDL Type    | JSON Type |
| ----------- | --------- |
| `Int`       | `number`  |
| `Float`     | `number`  |
| `Boolean`   | `boolean` |
| `String`    | `string`  |
| `File`      | `string`  |
| `Directory` | `string`  |
| `None`      | `null`    |

JSON has a single numeric type - it does not differentiate between integral and floating point values. A JSON `number` is always deserialized to a WDL `Float`, which may then be [coerced](@/types/type-conversion.md) to an `Int` if necessary.

JSON does not have a specific type for filesystem paths, but a WDL `String` may be coerced to a `File` if necessary.

### Array

Arrays are represented naturally in JSON using the `array` type. Each array element is serialized recursively into its JSON format.

When a JSON `array` is deserialized to WDL, each element of the array must be coercible to a common type.

### Struct and Object

`Struct`s and `Object`s are represented naturally in JSON using the `object` type. Each WDL `Struct` or `Object` member value is serialized recursively into its JSON format.

A JSON `object` is deserialized to a WDL `Object` value, and each member value is deserialized to its most likely WDL type. The WDL `Object` may then be coerced to a `Struct` or `Map` type if necessary.

### Pair

There is no natural or unambiguous serialization of a `Pair` to JSON. Attempting to serialize a `Pair` results in an error. A `Pair` must first be converted to a serializable type, e.g., using one of the following suggested methods.

#### Pair to Array

A `Pair[X, X]` may be converted to a two-element array.

<details>
<summary>
Example: pair_to_array.wdl

```wdl
version 1.2

workflow pair_to_array {
  Pair[Int, Int] p = (1, 2)
  Array[Int] a = [p.left, p.right]
  # We can convert back to Pair as needed
  Pair[Int, Int] p2 = (a[0], a[1])

  output {
    Array[Int] aout = a
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
  "pair_to_array.aout": [1, 2]
}
```
</p>
</details>

#### Pair to Struct

A `Pair[X, Y]` may be converted to a struct with two members `X left` and `Y right`.

<details>
<summary>
Example: pair_to_struct.wdl

```wdl
version 1.2

struct StringIntPair {
  String l
  Int r
}

workflow pair_to_struct {
  Pair[String, Int] p = ("hello", 42)
  StringIntPair s = StringIntPair {
    l: p.left,
    r: p.right
  }
  # We can convert back to Pair as needed
  Pair[String, Int] p2 = (s.l, s.r)

  output {
    StringIntPair sout = s
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
  "pair_to_struct.sout": {
    "l": "hello",
    "r": 42
  }
}
```
</p>
</details>

### Map

A `Map[String, X]` may be serialized to a JSON `object` by the same mechanism as a WDL `Struct` or `Object`. This value will be deserialized to a WDL `Object`, after which it may be coerced to a `Map`.

There is no natural or unambiguous serialization of a `Map` with a non-`String` key type. Attempting to serialize a `Map` with a non-`String` key type results in an error. A `Map` with non-`String` keys must first be converted to a serializable type, e.g., using one of the following suggested methods.

#### Map to Struct

A `Map[P, Y]` can be converted to a `Struct` with two array members: `Array[X] keys` and `Array[Y] values`. This is the suggested approach.

<details>
<summary>
Example: map_to_struct2.wdl

```wdl
version 1.2

struct IntStringMap {
  Array[Int] keys
  Array[String] values
}

workflow map_to_struct2 {
  Map[Int, String] m = {0: "a", 1: "b"}
  Array[Pair[Int, String]] int_string_pairs = as_pairs(m)
  Pair[Array[Int], Array[String]] int_string_arrays = unzip(int_string_pairs)

  IntStringMap s = IntStringMap {
    keys: int_string_arrays.left,
    values: int_string_arrays.right
  }

  # We can convert back to Map
  Map[Int, String] m2 = as_map(zip(s.keys, s.values))
  
  output {
    IntStringMap sout = s
    Boolean is_equal = m == m2
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
  "map_to_struct2.sout": {
    "keys": [0, 1],
    "values": ["a", "b"]
  },
  "map_to_struct2.is_equal": true
}
```
</p>
</details>

#### Map to Array

A `Map[P, P]` can be converted to an array of `Pair`s. Each pair can then be converted to a serializable format using one of the methods described in the previous section. This approach is less desirable as it requires the use of a `scatter`.

<details>
<summary>
Example: map_to_array.wdl

```wdl
version 1.2

workflow map_to_array {
  Map[Int, Int] m = {0: 7, 1: 42}
  Array[Pair[Int, Int]] int_int_pairs = as_pairs(m)

  scatter (p in int_int_pairs) {
    Array[Int] a = [p.left, p.right]
  }

  output {
    Array[Array[Int]] aout = a
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
  "map_to_array.aout": [[0, 7], [1, 42]]
}
```
</p>
</details>
