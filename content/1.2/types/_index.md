+++
title = "Types"
description = "WDL type system and type declarations"
sort_by = "weight"
weight = 20
+++

A [declaration](@/1.2/expressions/declarations.md) is a name that the user reserves in a given [scope](@/1.2/appendices/appendix-b.md) to hold a value of a certain type. In WDL *all* declarations (including inputs and outputs) must be typed. This means that the information about the type of data that may be held by each declarations must be specified explicitly.

In WDL *all* types represent immutable values. For example, a `File` represents a logical "snapshot" of the file at the time when the value was created. It is impossible for a task to change an upstream value that has been provided as an input - even if it modifies its local copy, the original value is unaffected.
