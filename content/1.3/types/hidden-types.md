+++
title = "Hidden and Scoped Types"
description = "Types that can only be instantiated by the execution engine"
weight = 400
+++

A hidden type is one that may only be instantiated by the execution engine, and cannot be used in a declaration within a WDL file.

A scoped type is one that can only be defined by the execution engine within a specific scope. A scoped type may also be hidden.

The following sections enumerate the hidden and scoped types that are available in the current version of WDL. In WDL 2.0, `Object` will also become a hidden type.

## `Union` (Hidden Type)

`Union` is a hidden type that is used for a value that may have any one of several concrete types. A `Union` value must always be coerced to a concrete type. The `Union` type is used in the following contexts:

* It is the type of the special [`None`](@/1.3/types/optional-types.md) value.
* It is the return type of some standard library functions, such as [`read_json`](@/1.3/standard-library/file-functions/read_json.md).
* It is the type of some [`requirements`](@/1.3/tasks/requirements.md) and reserved [`hints`](@/1.3/tasks/hints.md) attributes.

## `hints`, `input`, and `output` (Scoped Types)

The [`hints`](@/1.3/tasks/hints.md) section has [three scoped types](@/1.3/tasks/hints.md#hints-scoped-types) that may be instantiated by the user within that scope.

## `task` (Hidden Scoped Type)

The [`task` type](@/1.3/tasks/runtime-access.md) is a hidden type that is available in both pre-evaluation contexts (`requirements`, `hints`, and the deprecated `runtime` sections) with a limited set of members, and in post-evaluation contexts (`command` and `output` sections) with the full set of members.

## `task.previous` (Hidden Scoped Type)

The [`task.previous` type](@/1.3/tasks/runtime-access.md) is a hidden type that contains the previously computed requirements from the last task attempt. It is scoped to within the `task` variable and contains the following optional members:

* `memory`: An `Int?` with the allocated memory in bytes from the previous attempt.
* `cpu`: A `Float?` with the allocated number of CPUs from the previous attempt.
* `container`: A `String?` with the URI of the container used in the previous attempt.
* `gpu`: An `Array[String]?` with the GPU specifications from the previous attempt.
* `fpga`: An `Array[String]?` with the FPGA specifications from the previous attempt.
* `disks`: A `Map[String, Int]?` with the disk mount points and allocated space from the previous attempt.
* `max_retries`: An `Int?` with the maximum number of retry attempts from the previous attempt.

All fields are `None` on the first try.
