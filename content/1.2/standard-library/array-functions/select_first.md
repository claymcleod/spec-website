+++
title = "select_first"
description = "Select first defined value"
weight = 90
+++
```
X select_first(Array[X?]+)
X select_first(Array[X?], X)
```

Selects the first - i.e., left-most - non-`None` value from an `Array` of optional values. The optional second parameter provides a default value that is returned if the array is empty or contains only `None` values. If the default value is not provided and the array is empty or contains only `None` values, then an error is raised.

**Parameters**

1. `Array[X?]+`: Non-empty `Array` of optional values.
2. `X`: (Optional) The default value.

**Returns**: The first non-`None` value in the input array, or the default value if it is provided and the array does not contain any non-`None` values.

Example: test_select_first.wdl


```wdl
version 1.2

workflow test_select_first {
  input {
    Int? maybe_five = 5
    Int? maybe_four_but_is_not = None
    Int? maybe_three = 3
  }

  output {
    # all of these statements evaluate to 5
    Int fiveA = select_first([maybe_five, maybe_four_but_is_not, maybe_three])
    Int fiveB = select_first([maybe_four_but_is_not, maybe_five, maybe_three])
    Int fiveC = select_first([], 5)
    Int fiveD = select_first([None], 5)
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
  "test_select_first.fiveA": 5,
  "test_select_first.fiveB": 5,
  "test_select_first.fiveC": 5,
  "test_select_first.fiveD": 5
}
```


</details>

Example: select_first_only_none_fail.wdl


```wdl
version 1.2

workflow select_first_only_none_fail {
  Int? maybe_four_but_is_not = None
  Int result = select_first([maybe_four_but_is_not])  # error! array contains only None values
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>

Example: select_first_empty_fail.wdl


```wdl
version 1.2

workflow select_first_empty_fail {
  Int check = select_first([])  # error! array is empty
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>
