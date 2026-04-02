+++
title = "select_first"
description = "Select first non-None value from array"
weight = 5100
+++

```
X select_first(Array[X?]+)
```

Selects the first - i.e. left-most - non-`None` value from an `Array` of optional values. It is an error if the array is empty, or if the array only contains `None` values.

**Parameters**

1. `Array[X?]+`: Non-empty `Array` of optional values.

**Returns**: The first non-`None` value in the input array.

Example: test_select_first.wdl


```wdl
version 1.1

workflow test_select_first {
  input {
    Int? maybe_five = 5
    Int? maybe_four_but_is_not = None
    Int? maybe_three = 3
  }

  output {
    # both of these statements evaluate to 5
    Int five1 = select_first([maybe_five, maybe_four_but_is_not, maybe_three])
    Int five2 = select_first([maybe_four_but_is_not, maybe_five, maybe_three])
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
  "test_select_first.five1": 5,
  "test_select_first.five2": 5
}
```


</details>

Example: select_first_only_none_fail.wdl


```wdl
version 1.1

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
version 1.1

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
