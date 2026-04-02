+++
title = "Operators"
description = "Arithmetic, logical, comparison, and string operators"
weight = 20
+++

## Expressions

```
$expression = '(' $expression ')'
$expression = $expression '.' $expression
$expression = $expression '[' $expression ']'
$expression = $expression '(' ($expression (',' $expression)*)? ')'
$expression = '!' $expression
$expression = '+' $expression
$expression = '-' $expression
$expression = if $expression then $expression else $expression
$expression = $expression '*' $expression
$expression = $expression '%' $expression
$expression = $expression '/' $expression
$expression = $expression '+' $expression
$expression = $expression '-' $expression
$expression = $expression '<' $expression
$expression = $expression '=<' $expression
$expression = $expression '>' $expression
$expression = $expression '>=' $expression
$expression = $expression '==' $expression
$expression = $expression '!=' $expression
$expression = $expression '&&' $expression
$expression = $expression '||' $expression
$expression = '{' ($expression ':' $expression)* '}'
$expression = '[' $expression* ']'
$expression = $string | $integer | $float | $boolean | $identifier
```

Below are the valid results for operators on types. Any combination not in the list will result in an error.

| LHS Type | Operators | RHS Type | Result | Semantics |
|-|-|-|-|-|
| `Boolean` | `==` | `Boolean` | `Boolean` | |
| `Boolean` | `!=` | `Boolean` | `Boolean` | |
| `Boolean` | `>` | `Boolean` | `Boolean` | |
| `Boolean` | `>=` | `Boolean` | `Boolean` | |
| `Boolean` | `<` | `Boolean` | `Boolean` | |
| `Boolean` | `<=` | `Boolean` | `Boolean` | |
| `Boolean` | `\|\|` | `Boolean` | `Boolean` | |
| `Boolean` | `&&` | `Boolean` | `Boolean` | |
| `File` | `+` | `File` | `File` | Append file paths |
| `File` | `==` | `File` | `Boolean` | |
| `File` | `!=` | `File` | `Boolean` | |
| `File` | `+` | `String` | `File` | |
| `File` | `==` | `String` | `Boolean` | |
| `File` | `!=` | `String` | `Boolean` | |
| `Float` | `+` | `Float` | `Float` | |
| `Float` | `-` | `Float` | `Float` | |
| `Float` | `*` | `Float` | `Float` | |
| `Float` | `/` | `Float` | `Float` | |
| `Float` | `%` | `Float` | `Float` | |
| `Float` | `==` | `Float` | `Boolean` | |
| `Float` | `!=` | `Float` | `Boolean` | |
| `Float` | `>` | `Float` | `Boolean` | |
| `Float` | `>=` | `Float` | `Boolean` | |
| `Float` | `<` | `Float` | `Boolean` | |
| `Float` | `<=` | `Float` | `Boolean` | |
| `Float` | `+` | `Int` | `Float` | |
| `Float` | `-` | `Int` | `Float` | |
| `Float` | `*` | `Int` | `Float` | |
| `Float` | `/` | `Int` | `Float` | |
| `Float` | `%` | `Int` | `Float` | |
| `Float` | `==` | `Int` | `Boolean` | |
| `Float` | `!=` | `Int` | `Boolean` | |
| `Float` | `>` | `Int` | `Boolean` | |
| `Float` | `>=` | `Int` | `Boolean` | |
| `Float` | `<` | `Int` | `Boolean` | |
| `Float` | `<=` | `Int` | `Boolean` | |
| `Float` | `+` | `String` | `String` | |
| `Int` | `+` | `Float` | `Float` | |
| `Int` | `-` | `Float` | `Float` | |
| `Int` | `*` | `Float` | `Float` | |
| `Int` | `/` | `Float` | `Float` | |
| `Int` | `%` | `Float` | `Float` | |
| `Int` | `==` | `Float` | `Boolean` | |
| `Int` | `!=` | `Float` | `Boolean` | |
| `Int` | `>` | `Float` | `Boolean` | |
| `Int` | `>=` | `Float` | `Boolean` | |
| `Int` | `<` | `Float` | `Boolean` | |
| `Int` | `<=` | `Float` | `Boolean` | |
| `Int` | `+` | `Int` | `Int` | |
| `Int` | `-` | `Int` | `Int` | |
| `Int` | `*` | `Int` | `Int` | |
| `Int` | `/` | `Int` | `Int` | Integer division |
| `Int` | `%` | `Int` | `Int` | Integer division, return remainder |
| `Int` | `==` | `Int` | `Boolean` | |
| `Int` | `!=` | `Int` | `Boolean` | |
| `Int` | `>` | `Int` | `Boolean` | |
| `Int` | `>=` | `Int` | `Boolean` | |
| `Int` | `<` | `Int` | `Boolean` | |
| `Int` | `<=` | `Int` | `Boolean` | |
| `Int` | `+` | `String` | `String` | |
| `String` | `+` | `Float` | `String` | |
| `String` | `+` | `Int` | `String` | |
| `String` | `+` | `String` | `String` | |
| `String` | `==` | `String` | `Boolean` | |
| `String` | `!=` | `String` | `Boolean` | |
| `String` | `>` | `String` | `Boolean` | |
| `String` | `>=` | `String` | `Boolean` | |
| `String` | `<` | `String` | `Boolean` | |
| `String` | `<=` | `String` | `Boolean` | |
| | `-` | `Float` | `Float` | |
| | `+` | `Float` | `Float` | |
| | `-` | `Int` | `Int` | |
| | `+` | `Int` | `Int` | |
| | `!` | `Boolean` | `Boolean` | |

## Array Literals

Arrays values can be specified using Python-like syntax, as follows:

```wdl
Array[String] a = ["a", "b", "c"]
Array[Int] b = [0,1,2]
```

## Map Literals

Maps values can be specified using a similar Python-like syntax:

```wdl
Map[Int, Int] = {1: 10, 2: 11}
Map[String, Int] = {"a": 1, "b": 2}
```

## Object Literals

Object literals are specified similarly to maps, but require an `object` keyword immediately before the `{`:

```wdl
Object f = object {
  a: 10,
  b: 11
}
```

The `object` keyword allows the field keys to be specified as identifiers, rather than `String` literals (e.g., `a:` rather than `"a":`).

### Object Coercion from Map

Objects can be coerced from map literals, but beware the following behavioral difference:

```wdl
String a = "beware"
String b = "key"
String c = "lookup"

# What are the keys to this object?
Object object_syntax = object {
  a: 10,
  b: 11,
  c: 12
}

# What are the keys to this object?
Object map_coercion = {
  a: 10,
  b: 11,
  c: 12
}
```

- If an `Object` is specified using the object-style `Object map_syntax = object { a: ...` syntax then the keys will be `"a"`, `"b"` and `"c"`.
- If an `Object` is specified using the map-style `Object map_coercion = { a: ...` then the keys are expressions, and thus `a` will be a variable reference to the previously defined `String a = "beware"`.

## Pair Literals

Pair values can be specified inside of a WDL using another Python-like syntax, as follows:

```wdl
Pair[Int, String] twenty_threes = (23, "twenty-three")
```

Pair values can also be specified within the workflow inputs JSON with a `Left` and `Right` value specified using JSON style syntax. For example, given a workflow `wf_hello` and workflow-level variable `twenty_threes`, it could be declared in the workflow inputs JSON as follows:

```json
{
  "wf_hello.twenty_threes": { "left": 23, "right": "twenty-three" }
}
```
