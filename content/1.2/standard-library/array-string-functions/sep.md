+++
title = "sep"
description = "Join strings with separator"
weight = 50
+++

```
String sep(String, Array[P])
```

Concatenates the elements of an array together into a string with the given separator between consecutive elements. There are always `N-1` separators in the output string, where `N` is the length of the input array. A separator is never added after the last element. Returns an empty string if the array is empty.

**Parameters**

1. `String`: Separator string. 
2. `Array[P]`: Array of strings to concatenate.

**Returns**: A `String` with the concatenated elements of the array delimited by the separator string.

Example: test_sep.wdl


```wdl
version 1.2

workflow test_sep {
  Array[String] a = ["file_1", "file_2"]

  output {
    # these all evaluate to true
    Array[Boolean] all_true = [
      sep(' ', prefix('-i ', a)) == "-i file_1 -i file_2",
      sep("", ["a", "b", "c"]) == "abc",
      sep(' ', ["a", "b", "c"]) == "a b c",
      sep(',', [1]) == "1"
    ]
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
  "test_sep.all_true": [true, true, true, true]
}
```


</details>

