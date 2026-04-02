+++
title = "contains"
description = "Check if array contains value"
weight = 5060
+++
```
Boolean contains(Array[P], P)
Boolean contains(Array[P?], P?)
```

Tests whether the given array contains at least one occurrence of the given value.

**Parameters**

1. `Array[P]` or `Array[P?]`: an array of any primitive type.
2. `P` or `P?`: a primitive value of the same type as the array. If the array's type is optional, then the value may also be optional.

**Returns**: `true` if the array contains at least one occurrence of the value, otherwise `false`.

Example

Example: test_contains.wdl


```wdl
version 1.2

task null_sample {
  command <<<
  echo "Sample array contains a null value!"
  >>>
}

task missing_sample {
  input {
    String name
  }

  command <<<
  echo "Sample ~{name} is missing!"
  >>>
}

workflow test_contains {
  input {
    Array[String?] samples
    String name
  }

  Boolean has_null = contains(samples, None)
  if (has_null) {
    call null_sample
  }
  
  Boolean has_missing = !contains(samples, name)
  if (has_missing) {
    call missing_sample { input: name }
  }

  output {
    Boolean samples_are_valid = !(has_null || has_missing)
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_contains.samples": [null, "foo"],
  "test_contains.name": "bar"
}
```

Example output:

```json
{
  "test_contains.samples_are_valid": false
}
```


</details>
