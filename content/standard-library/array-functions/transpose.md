+++
title = "transpose"
description = "Transpose array"
weight = 20
+++

```
Array[Array[X]] transpose(Array[Array[X]])
```

Transposes a two-dimensional array according to the standard matrix transposition rules, i.e. each row of the input array becomes a column of the output array. The input array must be square - i.e., every row must have the same number of elements - or an error is raised. If either the inner or the outer array is empty, an empty array is returned.

**Parameters**

1. `Array[Array[X]]`: A `M*N` two-dimensional array.

**Returns**: A `N*M` two-dimensional array (`Array[Array[X]]`) containing the transposed input array.

<details>
<summary>
Example: test_transpose.wdl

```wdl
version 1.2

workflow test_transpose {
  # input array is 2 rows * 3 columns
  Array[Array[Int]] input_array = [[0, 1, 2], [3, 4, 5]]
  # output array is 3 rows * 2 columns
  Array[Array[Int]] expected_output_array = [[0, 3], [1, 4], [2, 5]]
  
  output {
    Array[Array[Int]] out = transpose(input_array) 
    Array[Array[Int]] expected = expected_output_array
    Boolean is_true = out == expected
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
  "test_transpose.out": [[0, 3], [1, 4], [2, 5]],
  "test_transpose.expected": [[0, 3], [1, 4], [2, 5]],
  "test_transpose.is_true": true
}
```
</p>
</details>

