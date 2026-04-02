+++
title = "ceil"
description = "Round up to nearest integer"
weight = 1020
+++

```
Int ceil(Float)
```

Rounds a floating point number **up** to the next higher integer.

**Parameters**:

1. `Float`: the number to round.

**Returns**: An integer.

Example: test_ceil.wdl


```wdl
version 1.1

workflow test_ceil {
  input {
    Int i1
  }

  Int i2 = i1 + 1
  Float f1 = i1
  Float f2 = i1 + 0.1

  output {
    Array[Boolean] all_true = [ceil(f1) == i1, ceil(f2) == i2]
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_ceil.i1": 2
}
```

Example output:

```json
{
  "test_ceil.all_true": [true, true]
}
```


</details>
