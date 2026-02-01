+++
title = "round"
description = "Round to nearest integer"
weight = 30
+++

```
Int round(Float)
```

Rounds a floating point number to the nearest integer based on standard rounding rules ("round half up").

**Parameters**:

1. `Float`: the number to round.

**Returns**: An integer.

<details>
<summary>
Example: test_round.wdl

```wdl
version 1.2

workflow test_round {
  input {
    Int i1
  }

  Int i2 = i1 + 1
  Float f1 = i1 + 0.49
  Float f2 = i1 + 0.50
  
  output {
    Array[Boolean] all_true = [round(f1) == i1, round(f2) == i2]
  }
}
```
</summary>
<p>
Example input:

```json
{
  "test_round.i1": 2
}
```

Example output:

```json
{
  "test_round.all_true": [true, true]
}
```
</p>
</details>

