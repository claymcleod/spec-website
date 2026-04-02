+++
title = "values"
description = "Get map values"
weight = 6050
+++
```
Array[Y] values(Map[P, Y])
```

Returns an `Array` of the values from the input `Map`, in the same order as the elements in the map. If the map is empty, an empty array is returned.

**Parameters**

1. `Map[P, Y]`: `Map` from which to extract values.

**Returns**: `Array[Y]` of the input `Map`s values.

Example

Example: test_values.wdl


```wdl
version 1.2

task add {
  input {
    Int x
    Int y
  }

  Int z = x + y

  command <<<
  echo "~{x} + ~{y} = ~{z}"
  >>>

  output {
    Int sum = z
  }
}

workflow test_values {
  input {
    Map[String, Pair[Int, Int]] str_to_ints = {
      "a": (1, 2),
      "b": (3, 4)
    }
  }
  
  scatter (ints in values(str_to_ints)) {
    call add { x=ints.left, y=ints.right }
  }
  
  output {
    Array[Int] sums = add.sum
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
  "test_values.sums": [3, 7]
}
```


</details>
