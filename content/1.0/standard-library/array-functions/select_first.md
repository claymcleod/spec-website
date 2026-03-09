+++
title = "select_first"
description = "Select first defined value"
weight = 70
+++

```
X select_first(Array[X?])
```

Given an array of optional values, `select_first` will select the first defined value and return it. Note that this is a runtime check and requires that at least one defined value will exist: if no defined value is found when `select_first` is evaluated, the workflow will fail.

**Parameters**

1. `Array[X?]`: An array of optional values.

**Returns**: The first non-`None` value of type `X` found in the array.
