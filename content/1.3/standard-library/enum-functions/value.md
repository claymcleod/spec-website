+++
title = "value"
description = "Get the underlying value of an enum choice"
weight = 6510
+++

```
T value(Enum)
```

Returns the underlying value associated with an enum choice.

**Parameters**

1. `Enum`: an enum choice of any enum type.

**Returns**: The choice's associated value.

Example: test_enum_value.wdl


```wdl
version 1.3

enum Color {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF"
}

enum Priority {
  Low = 1,
  Medium = 5,
  High = 10
}

workflow test_enum_value {
  input {
    Color color = Color.Red
    Priority priority = Priority.High
  }

  output {
    String choice_name = "~{color}"   # "Red"
    String hex_value = value(color)    # "#FF0000"
    Int priority_num = value(priority) # 10
    Boolean values_equal = value(Color.Red) == value(Color.Red) # true
    Boolean choices_equal = Color.Red == Color.Red             # true
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_enum_value.color": "Red",
  "test_enum_value.priority": "High"
}
```

Example output:

```json
{
  "test_enum_value.choice_name": "Red",
  "test_enum_value.hex_value": "#FF0000",
  "test_enum_value.priority_num": 10,
  "test_enum_value.values_equal": true,
  "test_enum_value.choices_equal": true
}
```


</details>
