+++
title = "Compound Types"
sort_by = "weight"
weight = 40
+++

A compound type is one that is parameterized by other types. In the examples below `P` represents any of the primitive types, and `X` and `Y` represent any valid type (even nested compound types).

## Array[X]

An `Array` represents an ordered list of elements that are all of the same type. An `Array` value can be initialized with an array literal.

```wdl
Array[X] xs = [x1, x2, x3]
```

An `Array` may have an empty value (i.e. an array of length zero), unless it is declared using `+`, the non-empty postfix quantifier, which represents a constraint that the `Array` value must contain one-or-more elements.

## Map[P, Y]

A `Map` represents an associative array of key-value pairs. All of the keys must be of the same primitive type, and all of the values must be of the same type, but keys and values can be different types.

A `Map` can be initialized with a map literal.

```wdl
Map[P,Y] p_to_y = { p1: y1, p2: y2, p3: y3 }
```

## Pair[X, Y]

A `Pair` represents two associated values, which may be of different types.

A `Pair` can be initialized with a pair literal.

```wdl
Pair[X,Y] x_and_y = (x, y)
```
