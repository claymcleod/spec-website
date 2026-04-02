+++
title = "Scatter"
description = "Parallel execution over arrays using <code>scatter</code> blocks"
weight = 50
+++

### Scatter

```
$scatter = 'scatter' $ws* '(' $ws* $scatter_iteration_statment $ws*  ')' $ws* $scatter_body
$scatter_iteration_statment = $identifier $ws* 'in' $ws* $expression
$scatter_body = '{' $ws* $workflow_element* $ws* '}'
```

A "scatter" clause defines that everything in the body (`$scatter_body`) can be run in parallel.  The clause in parentheses (`$scatter_iteration_statement`) declares which collection to scatter over and what to call each element.

The `$scatter_iteration_statement` has two parts: the "item" and the "collection".  For example, `scatter(x in y)` would define `x` as the item, and `y` as the collection.  The item is always an identifier, while the collection is an expression that MUST evaluate to an `Array` type.  The item will represent each item in that expression.  For example, if `y` evaluated to an `Array[String]` then `x` would be a `String`.

The `$scatter_body` defines a set of scopes that will execute in the context of this scatter block.

For example, if `$expression` is an array of integers of size 3, then the body of the scatter clause can be executed 3-times in parallel.  `$identifier` would refer to each integer in the array.

```wdl
scatter(i in integers) {
  call task1{input: num=i}
  call task2{input: num=task1.output}
}
```

In this example, `task2` depends on `task1`.  Variable `i` has an implicit `index` attribute to make sure we can access the right output from `task1`.  Since both task1 and task2 run N times where N is the length of the array `integers`, any scalar outputs of these tasks is now an array.

## Scatter / Gather

The `scatter` block is meant to parallelize a series of identical tasks but give them slightly different inputs.  The simplest example is:

```wdl
task inc {
  input {
    Int i
  }

  command <<<
  python -c "print(~{i} + 1)"
  >>>

  output {
    Int incremented = read_int(stdout())
  }
}

workflow wf {
  Array[Int] integers = [1,2,3,4,5]
  scatter(i in integers) {
    call inc{input: i=i}
  }
}
```

Running this workflow (which needs no inputs), would yield a value of `[2,3,4,5,6]` for `wf.inc`.  While `task inc` itself returns an `Int`, when it is called inside a scatter block, that type becomes an `Array[Int]`.

Any task that's downstream from the call to `inc` and outside the scatter block must accept an `Array[Int]`:


```wdl
task inc {
  input {
    Int i
  }

  command <<<
  python -c "print(~{i} + 1)"
  >>>

  output {
    Int incremented = read_int(stdout())
  }
}

task sum {
  input {
    Array[Int] ints
  }
  command <<<
  python -c "print(~{sep="+" ints})"
  >>>
  output {
    Int sum = read_int(stdout())
  }
}

workflow wf {
  Array[Int] integers = [1,2,3,4,5]
  scatter (i in integers) {
    call inc {input: i=i}
  }
  call sum {input: ints = inc.increment}
}
```

This workflow will output a value of `20` for `wf.sum.sum`.  This works because `call inc` will output an `Array[Int]` because it is in the scatter block.

However, from inside the scope of the scatter block, the output of `call inc` is still an `Int`.  So the following is valid:

```wdl
workflow wf {
  input {
    Array[Int] integers = [1,2,3,4,5]
  }
  scatter(i in integers) {
    call inc {input: i=i}
    call inc as inc2 {input: i=inc.incremented}
  }
  call sum {input: ints = inc2.increment}
}
```

In this example, `inc` and `inc2` are being called in serial where the output of one is fed to another. inc2 would output the array `[3,4,5,6,7]`
