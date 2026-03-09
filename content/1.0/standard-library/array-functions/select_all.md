+++
title = "select_all"
description = "Select all defined values"
weight = 80
+++

```
Array[X] select_all(Array[X?])
```

Given an array of optional values, `select_all` will select only those elements which are defined.

**Parameters**

1. `Array[X?]`: An array of optional values.

**Returns**: An `Array[X]` containing only the non-`None` values from the input array.
