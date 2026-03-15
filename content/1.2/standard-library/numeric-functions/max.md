+++
title = "max"
description = "Return maximum of two numbers"
weight = 50
+++

This function has four variants:

```
* Int max(Int, Int)
* Float max(Int, Float)
* Float max(Float, Int)
* Float max(Float, Float)
```

Returns the larger of two values. If both values are `Int`s, the return value is an `Int`, otherwise it is a `Float`.

**Parameters**:

1. `Int|Float`: the first number to compare.
2. `Int|Float`: the second number to compare.

**Returns**: The larger of the two arguments.

Example: test_max.wdl


```wdl
version 1.2

workflow test_max {
  input {
    Int value1
    Float value2
  }

  output {
    # these two expressions are equivalent
    Float max1 = if value1 > value2 then value1 else value2
    Float max2 = max(value1, value2)
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_max.value1": 1,
  "test_max.value2": 2.0
}
```

Example output:

```json
{
  "test_max.max1": 2.0,
  "test_max.max2": 2.0
}
```


</details>

