+++
title = "Compound Types"
sort_by = "weight"
description = "<code>Array</code>, <code>Pair</code>, <code>Map</code>, and <code>Struct</code> types"
weight = 30
transparent = true
+++

A compound type is one that contains nested types, i.e. it is *parameterized* by other types. The following compound types can be constructed. In the examples below `P` represents any of the primitive types above, and `X` and `Y` represent any valid type (including nested compound types).

## Array[X]

An `Array` represents an ordered list of elements that are all of the same type. An array is insertion ordered, meaning the order in which elements are added to the `Array` is preserved.

An array value can be initialized with an array literal - a comma-separated list of values in brackets (`[]`). A specific zero-based index of an `Array` can be accessed by placing the index in brackets after the declaration name. Accessing a non-existent index of an `Array` results in an error.

Example: array_access.wdl


  ```wdl
  version 1.1

  workflow array_access {
    input {
      Array[String] strings
      Int index
    }

    output {
      String s = strings[index]
    }
  }
  ```


<details>
<summary></summary>


Example input:

  ```json
  {
    "array_access.strings": ["hello", "world"],
    "array_access.index": 0
  }
  ```

  Example output:

  ```json
  {
    "array_access.s": "hello"
  }
  ```


</details>

Example: empty_array_fail.wdl


  ```wdl
  version 1.1

  workflow empty_array_fail {
    Array[Int] empty = []

    output {
      # this causes an error - trying to access a non-existent array element
      Int i = empty[0]
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
  {}
  ```

  Test config:

  ```json
  {
    "fail": true
  }
  ```


</details>

An `Array` may have an empty value (i.e. an array of length zero), unless it is declared using `+`, the non-empty postfix quantifier, which represents a constraint that the `Array` value must contain one-or-more elements. For example, the following task operates on an `Array` of `String`s and it requires at least one string to function:

Example: sum_task.wdl


```wdl
version 1.1

task sum {
  input {
    Array[String]+ ints
  }

  command <<<
  printf "~{sep(" ", ints)}" | awk '{tot=0; for(i=1;i<=NF;i++) tot+=$i; print tot}'
  >>>

  output {
    Int total = read_int(stdout())
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "sum.ints": ["0", "1", "2"]
}
```

Example output:

```json
{
  "sum.total": 3
}
```


</details>

Recall that a type may have an optional postfix quantifier (`?`), which means that its value may be undefined. The `+` and `?` postfix quantifiers can be combined to declare an `Array` that is either undefined or non-empty, i.e. it can have any value *except* the empty array.

Attempting to assign an empty array literal to a non-empty `Array` declaration results in an error. Otherwise, the non-empty assertion is only checked at runtime: binding an empty array to an `Array[T]+` input or function argument is a runtime error.

Example: non_empty_optional.wdl


```wdl
version 1.1

workflow non_empty_optional {
  output {
    # array that must contain at least one Float
    Array[Float]+ nonempty1 = [0.0]
    # array that must contain at least one Int? (which may have an undefined value)
    Array[Int?]+ nonempty2 = [None, 1]
    # array that can be undefined or must contain at least one Int
    Array[Int]+? nonempty3 = None
    Array[Int]+? nonempty4 = [0]
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
  "non_empty_optional.nonempty1": [0.0],
  "non_empty_optional.nonempty2": [null, 1],
  "non_empty_optional.nonempty3": null,
  "non_empty_optional.nonempty4": [0]
}
```


</details>

Example: non_empty_optional_fail.wdl


```wdl
version 1.1

workflow non_empty_optional_fail {
  # these both cause an error - can't assign empty array value to non-empty Array type
  Array[Boolean]+ nonempty3 = []
  Array[Int]+? nonempty6 = []
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

For more details see the section on [Input Type Constraints](@/1.1/tasks/inputs.md#input-type-constraints).

## Pair[X, Y]

A `Pair` represents two associated values, which may be of different types. In other programming languages, a `Pair` might be called a "two-tuple".

A `Pair` can be initialized with a pair literal - a comma-separated pair of values in parentheses (`()`). The components of a `Pair` value are accessed using its `left` and `right` accessors.

Example: test_pairs.wdl


```wdl
version 1.1

workflow test_pairs {
  Pair[Int, Array[String]] data = (5, ["hello", "goodbye"])

  output {
    Int five = data.left  # evaluates to 5
    String hello = data.right[0]  # evaluates to "hello"
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
  "test_pairs.five": 5,
  "test_pairs.hello": "hello"
}
```


</details>

## Map[P, Y]

A `Map` represents an associative array of key-value pairs. All of the keys must be of the same (primitive) type, and all of the values must be of the same type, but keys and values can be different types.

A `Map` can be initialized with a map literal - a comma-separated list of key-value pairs in braces (`{}`), where key-value pairs are delimited by `:`. The value of a specific key can be accessed by placing the key in brackets after the declaration name. Accessing a non-existent key of a `Map` results in an error.

Example: test_map.wdl


```wdl
version 1.1

workflow test_map {
  Map[Int, Int] int_to_int = {1: 10, 2: 11}
  Map[String, Int] string_to_int = { "a": 1, "b": 2 }
  Map[File, Array[Int]] file_to_ints = {
    "data/cities.txt": [0, 1, 2],
    "data/hello.txt": [9, 8, 7]
  }

  output {
    Int ten = int_to_int[1]  # evaluates to 10
    Int b = string_to_int["b"]  # evaluates to 2
    Array[Int] ints = file_to_ints["data/cities.txt"]  # evaluates to [0, 1, 2]
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
  "test_map.ten": 10,
  "test_map.b": 2,
  "test_map.ints": [0, 1, 2]
}
```


</details>

Example: test_map_fail.wdl


```wdl
version 1.1

workflow test_map_fail {
  Map[String, Int] string_to_int = { "a": 1, "b": 2 }
  Int c = string_to_int["c"]  # error - "c" is not a key in the map
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

A `Map` is insertion-ordered, meaning the order in which elements are added to the `Map` is preserved, for example when [converting a `Map` to an array of `Pair`s](@/1.1/standard-library/map-functions/as_pairs.md).

Example: test_map_ordering.wdl


```wdl
version 1.1

workflow test_map_ordering {
  # declaration using a map literal
  Map[Int, Int] int_to_int = { 2: 5, 1: 10 }

  scatter (ints in as_pairs(int_to_int)) {
    Array[Int] i = [ints.left, ints.right]
  }

  output {
    # evaluates to [[2, 5], [1, 10]]
    Array[Array[Int]] ints = i
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
  "test_map_ordering.ints": [[2, 5], [1, 10]]
}
```


</details>
