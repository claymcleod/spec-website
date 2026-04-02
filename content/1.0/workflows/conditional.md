+++
title = "Conditional"
description = "Conditionally executing workflow elements with <code>if</code> blocks"
weight = 60
+++

### Conditionals

```
$conditional = 'if' '(' $expression ')' '{' $workflow_element* '}'
```

Conditionals only execute the body if the expression evaluates to true.

* When a call's output is referenced outside the same containing `if` it will need to be handled as an optional type. E.g.

```wdl
workflow foo {
  # Call 'x', producing a Boolean output:
  call x
  Boolean x_out = x.out

  # Call 'y', producing an Int output, in a conditional block:
  if (x_out) {
    call y
    Int y_out = y.out
  }

  # Outside the if block, we have to handle this output as optional:
  Int? y_out_maybe = y.out

  # Call 'z' which takes an optional Int input:
  call z { input: optional_int = y_out_maybe }
}
```

* Optional types can be coalesced by using the `select_all` and `select_first` array functions:

```wdl
workflow foo {
  input {
    Array[Int] scatter_range = [1, 2, 3, 4, 5]
  }
  scatter (i in scatter_range) {
    call x { input: i = i }
    if (x.validOutput) {
      Int x_out = x.out
    }
  }

  # Because it was declared inside the scatter and the if-block, the type of x_out is different here:
  Array[Int?] x_out_maybes = x_out

  # We can select only the valid elements with select_all:
  Array[Int] x_out_valids = select_all(x_out_maybes)

  # Or we can select the first valid element:
  Int x_out_first = select_first(x_out_maybes)
}
```
* When conditional blocks are nested, referenced outputs are only ever single-level conditionals (i.e. we never produce `Int??` or deeper):
```wdl
workflow foo {
  input {
    Boolean b
    Boolean c
  }
  if(b) {
    if(c) {
      call x
      Int x_out = x.out
    }
  }
  Int? x_out_maybe = x_out # Even though it's within two 'if's, we don't need Int??

  # Call 'y' which takes an Int input:
  call y { input: int_input = select_first([x_out_maybe, 5]) } # The select_first produces an Int, not an Int?
}
```
