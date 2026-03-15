+++
title = "range"
description = "Create range of integers"
weight = 10
+++

```
Array[Int] range(Int)
```

Creates an array of the given length containing sequential integers starting from 0. The length must be >= `0`. If the length is `0`, an empty array is returned.

**Parameters**

1. `Int`: The length of array to create.

**Returns**: An `Array[Int]` containing integers `0..(N-1)`.

Example: test_range.wdl


```wdl
version 1.2

task double {
  input {
    Int n
  }

  command <<< >>>

  output {
    Int d = 2 * n
  }
}

workflow test_range {
  input {
    Int i
  }

  Array[Int] indexes = range(i)
  scatter (idx in indexes) {
    call double { n = idx }
  }

  output {
    Array[Int] result = double.d
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_range.i": 5
}
```

Example output:

```json
{
  "test_range.result": [0, 2, 4, 6, 8]
}
```


</details>

