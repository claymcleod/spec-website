+++
title = "Types"
description = "The WDL type system and how types are declared"
sort_by = "weight"
weight = 20
+++

A declaration is a name that the user reserves in a given scope to hold a value of a certain type. In WDL *all* declarations (including inputs and outputs) must be typed. This means that the information about the type of data that may be held by each declarations must be specified explicitly.

In WDL *all* types represent immutable values. For example, a `File` represents a logical "snapshot" of the file at the time when the value was created. It is impossible for a task to change an upstream value that has been provided as an input - even if it modifies its local copy, the original value is unaffected.

## Type Name References

A type name reference represents a reference to a custom type by name. When a custom type name appears in an expression context (rather than in a type declaration position), it evaluates to a type name reference. At the time of writing, type name references are only meaningful for enums.

Type name references are evaluated as part of normal expression evaluation, so any expression that evaluates to a type name reference can be used wherever a type name reference is expected. Type name references are primarily used with enums to access enum choices using the member access operator (`.`). For example, in the expression `Color.Red`, the identifier `Color` evaluates to a type name reference to the `Color` enum type, which can then be accessed to retrieve the `Red` choice. Since type name references participate in expression evaluation, expressions like `(Color).Red` are also valid.

There is no postulated use case for struct type name references. Member access on a struct type name reference produces an error. Type name references cannot be coerced to any other type.

```wdl
enum Priority {
  Low,
  Medium,
  High
}

workflow example {
  Priority p1 = Priority.Low     # Priority is a type name reference
  Priority p2 = (Priority).High  # Expression evaluates to type name reference
}
```
