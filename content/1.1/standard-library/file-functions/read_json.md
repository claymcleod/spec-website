+++
title = "read_json"
description = "Read JSON file"
weight = 170
+++

```
Union read_json(File)
```

Reads a JSON file into a WDL value whose type depends on the file's contents. The mapping of JSON type to WDL type is:

| JSON Type | WDL Type |
|-|-|
| object | `Object` |
| array | `Array[X]` |
| number | `Int` or `Float` |
| string | `String` |
| boolean | `Boolean` |
| null | `None` |

The return value is of type [`Union`](@/1.1/types/hidden-types.md#union) and must be used in a context where it can be coerced to the expected type, or an error is raised. For example, if the JSON file contains `null`, then the return value will be `None`, meaning the value can only be used in a context where an optional type is expected.

If the JSON file contains an array, then all the elements of the array must be coercible to the same type, or an error is raised.

The `read_json` function does not have access to any WDL type information, so it cannot return an instance of a specific `Struct` type. Instead, it returns a generic `Object` value that must be coerced to the desired `Struct` type.

Note that an empty file is not valid according to the JSON specification, and so calling `read_json` on an empty file raises an error.

**Parameters**

1. `File`: Path of the JSON file to read.

**Returns**: A value whose type is dependent on the contents of the JSON file.

<details>
<summary>
Example: read_person.wdl

```wdl
version 1.1

struct Person {
  String name
  Int age
}

workflow read_person {
  input {
    File json_file
  }

  output {
    Person p = read_json(json_file)
  }
}
```
</summary>
<p>
Example input:

```json
{
  "read_person.json_file": "data/person.json"
}
```

Example output:

```json
{
  "read_person.p": {
    "name": "John",
    "age": 42
  }
}
```
</p>
</details>
