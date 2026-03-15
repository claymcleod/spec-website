+++
title = "Types"
description = "The WDL type system and how types are declared"
sort_by = "weight"
weight = 20
+++

All inputs and outputs must be typed. The following primitive types exist in WDL:

```wdl
Int i = 0                  # An integer value
Float f = 27.3             # A floating point number
Boolean b = true           # A boolean true/false
String s = "hello, world"  # A string value
File f = "path/to/file"    # A file
```

In addition, the following compound types can be constructed, parameterized by other types. In the examples below `P` represents any of the primitive types above, and `X` and `Y` represent any valid type (even nested compound types):

```wdl
Array[X] xs = [x1, x2, x3]                    # An array of Xs
Map[P,Y] p_to_y = { p1: y1, p2: y2, p3: y3 }  # A map from Ps to Ys
Pair[X,Y] x_and_y = (x, y)                    # A pair of one X and one Y
Object o = { "field1": f1, "field2": f2 }     # Object keys are always `String`s
```

Some examples of types:

* `File`
* `Array[File]`
* `Pair[Int, Array[String]]`
* `Map[String, String]`

Types can also have a postfix quantifier (either `?` or `+`):

* `?` means that the value is optional. It can only be used in calls or functions that accept optional values.
* `+` can only be applied to `Array` types, and it signifies that the array is required to be non-empty.

For more details on the postfix quantifiers, see the section on [Optional Parameters & Type Constraints](@/1.0/types/optional-types.md).

For more information on type and how they are used to construct commands and define outputs of tasks, see the [Data Types & Serialization](@/1.0/types/type-conversion.md) section.
