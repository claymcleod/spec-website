+++
title = "select_all"
description = "Select all non-None values from array"
weight = 90
+++

```
Array[X] select_all(Array[X?])
```

Filters the input `Array` of optional values by removing all `None` values. The elements in the output `Array` are in the same order as the input `Array`. If the input array is empty or contains only `None` values, an empty array is returned.

**Parameters**

1. `Array[X?]`: `Array` of optional values.

**Returns**: an `Array` of all non-`None` values in the input array.

Example: test_select_all.wdl


```wdl
version 1.1

workflow test_select_all {
  input {
    Int? maybe_five = 5
    Int? maybe_four_but_is_not = None
    Int? maybe_three = 3
  }

  Array[Int] fivethree = select_all([maybe_five, maybe_four_but_is_not, maybe_three])
  Array[Int] expected = [5, 3]

  output {
    Boolean is_true = fivethree == expected
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
  "test_select_all.is_true": true
}
```


</details>
