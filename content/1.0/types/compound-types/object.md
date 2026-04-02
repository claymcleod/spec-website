+++
title = "Object"
description = "The deprecated <code>Object</code> type in WDL"
weight = 310
+++

An `Object` is a compound type whose keys are always `String`s. An `Object` can be initialized with an object literal.

```wdl
Object o = { "field1": f1, "field2": f2 }
```

`Object` keys are always `String`s, and the values can be of any type.
