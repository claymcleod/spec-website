+++
title = "quote"
description = "Quote strings"
weight = 4030
+++

```
Array[String] quote(Array[P])
```

Adds double-quotes (`"`) around each element of the input array of primitive values. Equivalent to evaluating `'"~{array[i]}"'` for each `i` in `range(length(array))`.

**Parameters**

1. `Array[P]`: Array with a primitive element type.

**Returns**: An `Array[String]` the double-quoted elements of the input array.

Example: test_quote.wdl


```wdl
version 1.2

workflow test_quote {
  Array[String] env1 = ["key1=value1", "key2=value2", "key3=value3"]
  Array[Int] env2 = [1, 2, 3]

  output {
    Array[String] env1_quoted = quote(env1)
    Array[String] env2_quoted = quote(env2)
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
  "test_quote.env1_quoted": ["\"key1=value1\"", "\"key2=value2\"", "\"key3=value3\""],
  "test_quote.env2_quoted": ["\"1\"", "\"2\"", "\"3\""]
}
```


</details>

