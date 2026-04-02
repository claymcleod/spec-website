+++
title = "Hidden Types"
description = "Types that can only be instantiated by the execution engine"
weight = 400
+++

A hidden type is one that may only be instantiated by the execution engine, and cannot be used in a declaration within a WDL file. There is currently only one hidden type, `Union`; however, in WDL 2.0, `Object` will also become a hidden type.

## Union

The `Union` type is used for a value that may have any one of several concrete types. A `Union` value must always be coerced to a concrete type. The `Union` type is used in the following contexts:

* It is the type of the special [`None`](@/1.1/types/optional-types.md) value.
* It is the return type of some standard library functions, such as [`read_json`](@/1.1/standard-library/file-functions/read_json.md).
* It is the type of some reserved [`runtime`](@/1.1/tasks/runtime.md) attributes.
