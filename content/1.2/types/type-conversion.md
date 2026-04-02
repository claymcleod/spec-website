+++
title = "Type Conversion"
description = "Converting values between different WDL types"
weight = 500
+++

WDL has some limited facilities for converting a value of one type to another type. Some of these are explicitly provided by [standard library](@/1.2/standard-library/_index.md) functions, while others are [implicit](#type-coercion). When converting between types, it is best to be explicit whenever possible, even if an implicit conversion is allowed.

The execution engine is also responsible for converting (or "serializing") input values when constructing commands, as well as "deserializing" command outputs. For more information, see the [Command Section](@/1.2/tasks/command.md) and the more extensive Appendix on [WDL Value Serialization and Deserialization](@/1.2/appendices/appendix-a.md).

Note that type conversion is non-destructive - the converted value can be considered to be a new value that copies whatever properties of the original value are supported by the target type. If the original value was assigned to a variable, then that variable remains unchanged after the type conversion. For example:

```wdl
String path = "/path/to/file"
File file = path
String new_path = "~{path}_2"  # can still use `path` here
```

## Primitive Conversion to String 

Primitive types can always be converted to `String` using [string interpolation](@/1.2/types/primitive-types/strings.md). See [Expression Placeholders](@/1.2/tasks/command.md#expression-placeholders) for details.

Example: primitive_to_string.wdl


```wdl
version 1.2

workflow primitive_to_string {
  input {
    Int i = 5
  }

  output {
    String istring = "~{i}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "primitive_to_string.i": 3
}
```

Example output:

```json
{
  "primitive_to_string.istring": "3"
}
```


</details>

## Type Coercion

There are some pairs of WDL types for which there is an obvious, unambiguous conversion from one to the other. In these cases, WDL provides an automatic conversion (called "coercion") from one type to the other, such that a value of one type typically can be used anywhere the other type is expected.

For example, file paths are always represented as strings, making the conversion from `String` to `File` obvious and unambiguous.

Example: string_to_file.wdl


```wdl
version 1.2

workflow string_to_file {
  input {
    File infile
  }

  String path1 = "~{infile}"

  # valid - String coerces unambiguously to File
  File path2 = path1

  output {
    Boolean paths_equal = path2 == infile
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "string_to_file.infile": "data/hello.txt"
}
```

Example output:

```json
{
  "string_to_file.paths_equal": true
}
```


</details>

Attempting to use a declaration that is both of the wrong type and for which there is no coercion to the correct type results in an error.

Example: coercion_fail.wdl


```wdl
version 1.2

workflow coercion_fail {
  Array[String] strings = ["/foo/bar"]
  Boolean is_true1 = contains(strings, "/foo/bar")
  
  File foobar = "/foo/bar"
  # returns `true` - string interpolation creates a string from `foobar`
  Boolean is_true2 = contains(strings, "~{foobar}")
  # error - `foobar` is not of type `String` and is not coercible to `String`
  contains(strings, foobar)
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>

The table below lists all globally valid coercions. The "target" type is the type being coerced to (this is often called the "left-hand side" or "LHS" of the coercion) and the "source" type is the type being coerced from (the "right-hand side" or "RHS").

| Target Type      | Source Type      | Notes/Constraints                                                                                                                                |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `File`           | `String`         |                                                                                                                                                  |
| `Directory`      | `String`         |
| `Float`          | `Int`            | May cause overflow error                                                                                                                         |
| `Y?`             | `X`              | `X` must be coercible to `Y`                                                                                                                     |
| `Array[Y]`       | `Array[X]`       | `X` must be coercible to `Y`                                                                                                                     |
| `Array[Y]`       | `Array[X]+`      | `X` must be coercible to `Y`                                                                                                                     |
| `Map[X, Z]`      | `Map[W, Y]`      | `W` must be coercible to `X` and `Y` must be coercible to `Z`                                                                                    |
| `Pair[X, Z]`     | `Pair[W, Y]`     | `W` must be coercible to `X` and `Y` must be coercible to `Z`                                                                                    |
| `Struct`         | `Map[String, Y]` | `Map` keys must match `Struct` member names, and all `Struct` members types must be coercible from `Y`                                           |
| `Map[String, Y]` | `Struct`         | All `Struct` members must be coercible to `Y`                                                                                                    |
| `Object`         | `Map[String, Y]` |                                                                                                                                                  |
| `Map[String, Y]` | `Object`         | All object values must be coercible to `Y`                                                                                                       |
| `Object`         | `Struct`         |                                                                                                                                                  |
| `Struct`         | `Object`         | `Object` keys must match `Struct` member names, and `Object` values must be coercible to `Struct` member types                                   |
| `Struct`         | `Struct`         | The two `Struct` types must have members with identical names and compatible types (see [Struct-to-Struct Coercion](#struct-to-struct-coercion)) |

The [`read_lines`](@/1.2/standard-library/file-functions/read_lines.md) function presents a special case in which the `Array[String]` value it returns may be immediately coerced into other `Array[P]` values, where `P` is a primitive type. See [Appendix A](@/1.2/appendices/appendix-a.md) for details and best practices.

### Order of Precedence

During string interpolation, there are some operators for which it is possible to coerce the same arguments in multiple different ways. For such operators, it is necessary to define the order of precedence so that a single function prototype can be selected from among the available options for any given set of arguments.

The `+` operator is overloaded for both numeric addition and `String` concatenation. This can lead to the following kinds of situations:

```wdl
String s = "1.0"
Float f = 2.0
String x = "~{s + f}"
```

There are two possible ways to evaluate the `s + f` expression:

1. Coerce `s` to `Float` and perform floating point addition, then coerce to `String` with the result being `x = "3.0"`.
2. Coerce `f` to `String` and perform string concatenation with result being `x = "1.02.0"`.

Similarly, the equality/inequality operators can be applied to any primitive values.

When applying `+`, `=`, or `!=` to primitive operands (`X`, `Y`), the order of precedence is:

1. (`Int`, `Int`) or (`Float`, `Float`): perform numeric addition/comparison
2. (`Int`, `Float`): coerce `Int` to `Float`, then perform numeric addition/comparison
3. (`String`, `String`): perform string concatenation/comparison
4. (`String`, `Y`): coerce `Y` to `String`, then perform string concatenation/comparison
5. Others: coerce `X` and `Y` to `String`, then perform string concatenation/comparison

Examples:

```wdl
# Evaluates to `"3.0"`: `1` is coerced to Float (`1.0`), then numeric addition
# is performed, and the result is converted to a string
String s1 = "~{1 + 2.0}"
# Evaluates to `"3.01"`: `1` is coerced to String, then concatenated with the 
# value of `s1`
String s2 = "~{s1 + 1}"
# Evaluates to `true`: `1` is coerced to Float (`1.0`), then numeric comparison 
# is performed
Boolean b1 = 1 == 1.0
# Evaluates to `true`: `true` is coerced to String, then string comparison is 
# performed
Boolean b2 = true == "true"
# Evaluates to `false`: `1` and `true` are both coerced to String, then string 
# comparison is performed
Boolean b3 = 1 == true
```

### Coercion of Optional Types

A non-optional type `T` can always be coerced to an optional type `T?`, but the reverse is not true - coercion from `T?` to `T` is not allowed because the latter cannot accept `None`.

This constraint propagates into compound types. For example, an `Array[T?]` can contain both optional and non-optional elements. This facilitates the common idiom [`select_first([expr, default])`](@/1.2/standard-library/array-functions/select_first.md), where `expr` is of type `T?` and `default` is of type `T`, for converting an optional type to a non-optional type. However, an `Array[T?]` could not be passed to the [`sep`](@/1.2/standard-library/array-string-functions/sep.md) function, which requires an `Array[T]`.

There are two exceptions where coercion from `T?` to `T` is allowed:

* [String concatenation in expression placeholders](@/1.2/tasks/command.md#expression-placeholders)
* [Equality and inequality comparisons](@/1.2/types/type-conversion.md#coercion-of-optional-types)

### Struct/Object Coercion from Map

`Struct`s and `Object`s can be coerced from map literals, but beware the difference between `Map` keys (expressions) and `Struct`/`Object` member names.

Example: map_to_struct.wdl


```wdl
version 1.2

struct Words {
  Int a
  Int b
  Int c
}

workflow map_to_struct {
  String a = "beware"
  String b = "key"
  String c = "lookup"

  output {
    # What are the keys to this Struct?
    Words literal_syntax = Words {
      a: 10,
      b: 11,
      c: 12
    }

    # What are the keys to this Struct?
    Words map_coercion = {
      "a": 10,
      "b": 11,
      "c": 12
    }
  }
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{
  "map_to_struct.literal_syntax": {
    "a": 10,
    "b": 11,
    "c": 12
  },
  "map_to_struct.map_coercion": {
    "a": 10,
    "b": 11,
    "c": 12
  }
}
```


</details>

- If a `Struct` (or `Object`) declaration is initialized using the struct-literal (or object-literal) syntax `Words literal_syntax = Words { a: ...` then the keys will be `"a"`, `"b"` and `"c"`.
- If a `Struct` (or `Object`) declaration is initialized using the map-literal syntax `Words map_coercion = { a: ...` then the keys are expressions, and thus `a` will be a variable reference to the previously defined `String a = "beware"`.

### Struct-to-Struct Coercion

Two `Struct` types are considered compatible when the following are true:

1. They have the same number of members.
2. Their members' names are identical.
3. The type of each member in the source struct is coercible to the type of the member with the same name in the target struct.

Example: struct_to_struct.wdl


```wdl
version 1.2

struct A {
  String s
}

struct B {
  A a_struct
  Int i
}

struct C {
  String s
}

struct D {
  C a_struct
  Int i
}

workflow struct_to_struct {
  B my_b = B {
    a_struct: A { s: 'hello' },
    i: 10
  }
  # We can coerce `my_b` from type `B` to type `D` because `B` and `D`
  # have members with the same names and compatible types. Type `A` can
  # be coerced to type `C` because they also have members with the same
  # names and compatible types.
  
  output {
    D my_d = my_b
  }
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{
  "struct_to_struct.my_d": {
    "a_struct": { 
      "s": "hello"
    },
    "i": 10
  }
}
```


</details>

<div class="flex items-center gap-1 my-4">
  <h3>Limited Exceptions</h3>
  <span class="wdl-badge wdl-badge-deprecated mt-6">Deprecated</span>
</div>

Implementers may choose to allow limited exceptions to the above rules, with the understanding that workflows depending on these exceptions may not be portable. These exceptions are provided for backward-compatibility, are considered deprecated, and will be removed in a future version of WDL.

* `Float` to `Int`, when the coercion can be performed with no loss of precision, e.g. `1.0 -> 1`.
* `String` to `Int`/`Float`, when the coercion can be performed with no loss of precision.
* `X?` may be coerced to `X`, and an error is raised if the value is undefined.
* `Array[X]` to `Array[X]+`, when the array is non-empty (an error is raised otherwise).
* `Map[W, X]` to `Array[Pair[Y, Z]]`, in the case where `W` is coercible to `Y` and `X` is coercible to `Z`.
* `Array[Pair[W, X]]` to `Map[Y, Z]`, in the case where `W` is coercible to `Y` and `X` is coercible to `Z`.
* `Map` to `Object`, in the case of `Map[String, X]`.
* `Map` to struct, in the case of `Map[String, X]` where all members of the struct have type `X`.
* `Object` to `Map[String, X]`, in the case where all object values are of (or are coercible to) the same type.
