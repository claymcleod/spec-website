+++
title = "Type Conversion"
weight = 50
+++

WDL values can be created from either JSON values or from native language values. The below table references String-like, Integer-like, etc to refer to values in a particular programming language. For example, "String-like" could mean a `java.io.String` in the Java context or a `str` in Python. An "Array-like" could refer to a `Seq` in Scala or a `list` in Python.

| WDL Type | Can Accept | Notes / Constraints |
|-|-|-|
| `String` | JSON String | |
| | String-like | |
| | `String` | Identity coercion |
| | `File` | |
| `File` | JSON String | Interpreted as a file path |
| | String-like | Interpreted as file path |
| | `String` | Interpreted as file path |
| | `File` | Identity Coercion |
| `Int` | JSON Number | Use floor of the value for non-integers |
| | Integer-like | |
| | `Int` | Identity coercion |
| `Float` | JSON Number | |
| | Float-like | |
| | `Float` | Identity coercion |
| `Boolean` | JSON Boolean | |
| | Boolean-like | |
| | `Boolean` | Identity coercion |
| `Array[T]` | JSON Array | Elements must be coercible to `T` |
| | Array-like | Elements must be coercible to `T` |
| `Map[K, V]` | JSON Object | Keys and values must be coercible to `K` and `V`, respectively |
| | Map-like | Keys and values must be coercible to `K` and `V`, respectively |
