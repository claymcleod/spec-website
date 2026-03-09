+++
title = "Hidden and Scoped Types"
description = "Types that can only be instantiated by the execution engine"
weight = 50
+++

A hidden type is one that may only be instantiated by the execution engine, and cannot be used in a declaration within a WDL file.

A scoped type is one that can only be defined by the execution engine within a specific scope. A scoped type may also be hidden.

The following sections enumerate the hidden and scoped types that are available in the current version of WDL. In WDL 2.0, `Object` will also become a hidden type.

## `Union` (Hidden Type)

`Union` is a hidden type that is used for a value that may have any one of several concrete types. A `Union` value must always be coerced to a concrete type. The `Union` type is used in the following contexts:

* It is the type of the special [`None`](@/1.2/types/optional-types.md) value.
* It is the return type of some standard library functions, such as [`read_json`](@/1.2/standard-library/file-functions/read_json.md).
* It is the type of some [`requirements`](@/1.2/tasks/requirements.md) and reserved [`hints`](@/1.2/tasks/hints.md) attributes.

## `hints`, `input`, and `output` (Scoped Types)

The [`hints`](@/1.2/tasks/hints.md) section has [three scoped types](@/1.2/tasks/hints.md#hints-scoped-types) that may be instantiated by the user within that scope.

## `task` (Hidden Scoped Type)

The [`task` type](@/1.2/tasks/runtime-access.md) is a hidden type that is scoped to the `command` and `output` sections.
