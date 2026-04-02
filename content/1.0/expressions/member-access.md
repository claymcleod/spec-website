+++
title = "Member Access"
description = "Accessing members of compound types with dot notation"
weight = 30
+++

## Member Access

The syntax `x.y` refers to member access. `x` must be an object or task in a workflow. A Task can be thought of as an object where the attributes are the outputs of the task.

```wdl
workflow wf {
  input {
    Object obj
    Object foo
  }
  # This would cause a syntax error,
  # because foo is defined twice in the same namespace.
  call foo {
    input: var=obj.attr # Object attribute
  }

  call foo as foo2 {
    input: var=foo.out # Task output
  }
}
```

## Map and Array Indexing

The syntax `x[y]` is for indexing maps and arrays. If `x` is an array, then `y` must evaluate to an integer. If `x` is a map, then `y` must evaluate to a key in that map.

## Pair Indexing

Given a Pair `x`, the left and right elements of that type can be accessed using the syntax `x.left` and `x.right`.
