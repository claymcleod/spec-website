+++
title = "length"
description = "Get length of collection"
weight = 20
+++

```
Int length(Array[X]|Map[X, Y]|Object|String)
```

Returns the length of the input argument as an `Int`:

* For an `Array[X]` argument: the number of elements in the array.
* For a `Map[X, Y]` argument: the number of items in the map.
* For an `Object` argument: the number of key-value pairs in the object.
* For a `String` argument: the number of characters in the string.

**Parameters**

1. `Array[X]`|`Map[X, Y]`|`Object`|`String`: A collection or string whose elements are to be counted.

**Returns**: The length of the collection/string as an `Int`.

<details>
<summary>
Example: test_length.wdl

```wdl
version 1.2

workflow test_length {
  Array[Int] xs = [1, 2, 3]
  Array[String] ys = ["a", "b", "c"]
  Array[String] zs = []
  Map[String, Int] m = {"a": 1, "b": 2}
  String s = "ABCDE"

  output {
    Int xlen = length(xs)
    Int ylen = length(ys)
    Int zlen = length(zs)
    Int mlen = length(m)
    Int slen = length(s)
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
  "test_length.xlen": 3,
  "test_length.ylen": 3,
  "test_length.zlen": 0,
  "test_length.mlen": 2,
  "test_length.slen": 5
}
```
</p>
</details>

# Input and Output Formats

WDL uses [JSON](https://www.json.org) as its native serialization format for task and workflow inputs and outputs. The specifics of these formats are described below.

All WDL implementations are required to support the standard JSON input and output formats. WDL compliance testing is performed using test cases whose inputs and expected outputs are given in these formats. A WDL implementation may choose to provide additional input and output mechanisms so long as they are documented, and/or tools are provided to interconvert between engine-specific input and the standard JSON format, to foster interoperability between tools in the WDL ecosystem.

