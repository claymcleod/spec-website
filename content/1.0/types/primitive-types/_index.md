+++
title = "Primitive Types"
description = "<code>Boolean</code>, <code>Int</code>, <code>Float</code>, <code>String</code>, <code>File</code>, and <code>Directory</code> types"
sort_by = "weight"
weight = 10
transparent = true
+++

The following primitive types exist in WDL:

* An `Int` represents an integer value.
* A `Float` represents a floating point number.
* A `Boolean` represents a value of `true` or `false`.
* A `String` represents a character string. String literals may contain escape sequences as described in the [Strings](@/1.0/types/primitive-types/strings.md) section.
* A `File` represents a file path. A `File` declaration can have a string value indicating a relative or absolute path on the local file system.

```wdl
Int i = 0                  # An integer value
Float f = 27.3             # A floating point number
Boolean b = true           # A boolean true/false
String s = "hello, world"  # A string value
File f = "path/to/file"    # A file
```
