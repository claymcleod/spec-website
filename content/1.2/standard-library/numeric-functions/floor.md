+++
title = "floor"
description = "Round down to nearest integer"
weight = 10
+++

```
Int floor(Float)
```

Rounds a floating point number **down** to the next lower integer.

**Parameters**:

1. `Float`: the number to round.

**Returns**: An integer.

Example: test_floor.wdl


```wdl
version 1.2

workflow test_floor {
  input {
    Int i1
  }

  Int i2 = i1 - 1
  Float f1 = i1
  Float f2 = i1 - 0.1
  
  output {
    Array[Boolean] all_true = [floor(f1) == i1, floor(f2) == i2]
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_floor.i1": 2
}

```
Example output:

```json
{
  "test_floor.all_true": [true, true]
}
```


</details>

