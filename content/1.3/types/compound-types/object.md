+++
title = "Object"
description = "The deprecated Object type in WDL"
weight = 10
+++

<div class="flex items-center gap-1 my-4">
  <span class="wdl-badge wdl-badge-deprecated">Deprecated</span>
</div>

An `Object` is an unordered associative array of name-value pairs, where values may be of any type and are not defined explicitly.

An `Object` can be initialized using an object literal value, which begins with the `object` keyword followed by a comma-separated list of name-value pairs in braces (`{}`), where name-value pairs are delimited by `:`. The member names in an object literal are not quoted. The value of a specific member of an `Object` value can be accessed by placing a `.` followed by the member name after the identifier.

Example: test_object.wdl


```wdl
version 1.3

workflow test_object {
  output {
    Object obj = object {
      a: 10,
      b: "hello"
    }
    Int i = obj.a
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
  "test_object.obj": {
    "a": 10,
    "b": "hello"
  },
  "test_object.i": 10
}
```


</details>

Due to the lack of explicitness in the typing of `Object` being at odds with the goal of being able to know the type information of all WDL declarations, the use of the `Object` type and the `object` literal syntax have been deprecated. In WDL 2.0, `Object` will become a [hidden type](@/1.3/types/hidden-types.md) that may only be instantiated by the execution engine. `Object` declarations can be replaced with use of [structs](@/1.3/types/compound-types/structs.md).
