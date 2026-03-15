+++
title = "min"
description = "Return the smaller of two values"
weight = 40
+++

This function has four choices:

```
* Int min(Int, Int)
* Float min(Int, Float)
* Float min(Float, Int)
* Float min(Float, Float)
```

Returns the smaller of two values. If both values are `Int`s, the return value is an `Int`, otherwise it is a `Float`.

**Parameters**:

1. `Int|Float`: the first number to compare.
2. `Int|Float`: the second number to compare.

**Returns**: The smaller of the two arguments.

Example: test_min.wdl


```wdl
version 1.3

workflow test_min {
  input {
    Int value1
    Float value2
  }

  output {
    # these two expressions are equivalent
    Float min1 = if value1 < value2 then value1 else value2
    Float min2 = min(value1, value2)
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_min.value1": 1,
  "test_min.value2": 2.0
}
```

Example output:

```json
{
  "test_min.min1": 1.0,
  "test_min.min2": 1.0
}
```


</details>
