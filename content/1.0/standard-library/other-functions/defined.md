+++
title = "defined"
description = "Check if value is defined"
weight = 10
+++

```
Boolean defined(X?)
```

This function will return `false` if the argument is an unset optional value. It will return `true` in all other cases.

**Parameters**

1. `X?`: An optional value of any type.

**Returns**: `false` if the input value is `None`, otherwise `true`.
