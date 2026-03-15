+++
title = "Built-in Operators"
description = "Unary and binary operators in WDL"
weight = 20
+++

WDL provides the standard unary and binary mathematical and logical operators. The following tables list the valid operand and result type combinations for each operator. Using an operator with unsupported types results in an error.

In operations on mismatched numeric types (e.g., `Int` + `Float`), the `Int` is first coerced to `Float`, and the result type is `Float`. This may result in loss of precision, for example if the `Int` is too large to be represented exactly by a `Float`. A `Float` can be converted to `Int` with the [`ceil`](@/1.1/standard-library/numeric-functions/ceil.md), [`round`](@/1.1/standard-library/numeric-functions/round.md), or [`floor`](@/1.1/standard-library/numeric-functions/floor.md) functions.

## Unary Operators

| Operator | RHS Type | Result |
|-|-|-|
| `-` | `Float` | `Float` |
| `-` | `Int` | `Int` |
| `!` | `Boolean` | `Boolean` |

## Binary Operators on Primitive Types

| LHS Type | Operator | RHS Type | Result | Semantics |
|-|-|-|-|-|
| `Boolean` | `==` | `Boolean` | `Boolean` | |
| `Boolean` | `!=` | `Boolean` | `Boolean` | |
| `Boolean` | `\|\|` | `Boolean` | `Boolean` | |
| `Boolean` | `&&` | `Boolean` | `Boolean` | |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Boolean` | `>` | `Boolean` | `Boolean` | true is greater than false |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Boolean` | `>=` | `Boolean` | `Boolean` | true is greater than false |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Boolean` | `<` | `Boolean` | `Boolean` | true is greater than false |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Boolean` | `<=` | `Boolean` | `Boolean` | true is greater than false |
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
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Int` | `+` | `String` | `String` | |
| `Int` | `+` | `Float` | `Float` | |
| `Int` | `-` | `Float` | `Float` | |
| `Int` | `*` | `Float` | `Float` | |
| `Int` | `/` | `Float` | `Float` | |
| `Int` | `==` | `Float` | `Boolean` | |
| `Int` | `!=` | `Float` | `Boolean` | |
| `Int` | `>` | `Float` | `Boolean` | |
| `Int` | `>=` | `Float` | `Boolean` | |
| `Int` | `<` | `Float` | `Boolean` | |
| `Int` | `<=` | `Float` | `Boolean` | |
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
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `Float` | `+` | `String` | `String` | |
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
| `String` | `+` | `String` | `String` | Concatenation |
| `String` | `+` | `File` | `File` | |
| `String` | `==` | `String` | `Boolean` | Unicode comparison |
| `String` | `!=` | `String` | `Boolean` | Unicode comparison |
| `String` | `>` | `String` | `Boolean` | Unicode comparison |
| `String` | `>=` | `String` | `Boolean` | Unicode comparison |
| `String` | `<` | `String` | `Boolean` | Unicode comparison |
| `String` | `<=` | `String` | `Boolean` | Unicode comparison |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `String` | `+` | `Int` | `String` | |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `String` | `+` | `Float` | `String` | |
| `File` | `==` | `File` | `Boolean` | |
| `File` | `!=` | `File` | `Boolean` | |
| `File` | `==` | `String` | `Boolean` | |
| `File` | `!=` | `String` | `Boolean` | |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `File` | `+` | `File` | `File` | append file paths - error if second path is not relative |
| <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `File` | `+` | `String` | `File` | append file paths - error if second path is not relative |

Boolean operator evaluation is minimal (or "short-circuiting"), meaning that:

1. For `A && B`, if `A` evalutes to `false` then `B` is not evaluated
2. For `A || B`, if `A` evaluates to `true` then `B` is not evaluated.

WDL `String`s are compared by the unicode values of their corresponding characters. Character `a` is less than character `b` if it has a lower unicode value.

Except for `String + File`, all concatenations between `String` and non-`String` types are deprecated and will be removed in WDL 2.0. The same effect can be achieved using [string interpolation](@/1.1/expressions/string-interpolation.md).

## Equality of Compound Types

| LHS Type | Operator | RHS Type | Result |
|-|-|-|-|
| `Array` | `==` | `Array` | `Boolean` |
| `Array` | `!=` | `Array` | `Boolean` |
| `Map` | `==` | `Map` | `Boolean` |
| `Map` | `!=` | `Map` | `Boolean` |
| `Pair` | `==` | `Pair` | `Boolean` |
| `Pair` | `!=` | `Pair` | `Boolean` |
| `Struct` | `==` | `Struct` | `Boolean` |
| `Struct` | `!=` | `Struct` | `Boolean` |
| `Object` | `==` | `Object` | `Boolean` |
| `Object` | `!=` | `Object` | `Boolean` |

In general, two compound values are equal if-and-only-if all of the following are true:

1. They are of the same type.
2. They are the same length.
3. All of their contained elements are equal.

Since `Array`s and `Map`s are ordered, the order of their elements are also compared. For example:

Example: array_map_equality.wdl


```wdl
version 1.1

workflow array_map_equality {
  output {
    # arrays and maps with the same elements in the same order are equal
    Boolean is_true1 = [1, 2, 3] == [1, 2, 3]
    Boolean is_true2 = {"a": 1, "b": 2} == {"a": 1, "b": 2}

    # arrays and maps with the same elements in different orders are not equal
    Boolean is_false1 = [1, 2, 3] == [2, 1, 3]
    Boolean is_false2 = {"a": 1, "b": 2} == {"b": 2, "a": 1}
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
  "array_map_equality.is_true1": true,
  "array_map_equality.is_true2": true,
  "array_map_equality.is_false1": false,
  "array_map_equality.is_false2": false
}
```


</details>

[Type coercion](@/1.1/types/type-conversion.md#type-coercion) can be employed to compare values of different but compatible types.

Example: compare_coerced.wdl


```wdl
version 1.1

workflow compare_coerced {
  Array[Int] i = [1, 2, 3]
  Array[Float] f1 = i
  Array[Float] f2 = [1.0, 2.0, 3.0]

  output {
    # Ints are automatically coerced to Floats for comparison
    Boolean is_true = f1 == f2
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
  "compare_coerced.is_true": true
}
```


</details>

## Equality and Inequality Comparison of Optional Types

The equality and inequality operators are exceptions to the general rules on [coercion of optional types](@/1.1/types/type-conversion.md#coercion-of-optional-types). Either or both operands of an equality or inequality comparison can be optional, considering that `None` is equal to itself but no other value.

Example: compare_optionals.wdl


```wdl
version 1.1

workflow compare_optionals {
  Int i = 1
  Int? j = 1
  Int? k = None

  output {
    # equal values of the same type are equal even if one is optional
    Boolean is_true1 = i == j
    # k is undefined (None), and so is only equal to None
    Boolean is_true2 = k == None
    # these comparisons are valid and evaluate to false
    Boolean is_false1 = i == k
    Boolean is_false2 = j == k
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
  "compare_optionals.is_true1": true,
  "compare_optionals.is_true2": true,
  "compare_optionals.is_false1": false,
  "compare_optionals.is_false2": false
}
```


</details>
