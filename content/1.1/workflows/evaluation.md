+++
title = "Evaluation of Workflow Elements"
description = "Order and timing of workflow evaluation"
weight = 40
+++

As with tasks, declarations can appear in the body of a workflow in any order. Expressions in workflows can reference the outputs of calls, including in input declarations. For example:

Example: input_ref_call.wdl


```wdl
version 1.1

task double {
  input {
    Int int_in
  }

  command <<< >>>

  output {
    Int out = int_in * 2
  }
}

workflow input_ref_call {
  input {
    Int x
    Int y = d1.out
  }

  call double as d1 { input: int_in = x }
  call double as d2 { input: int_in = y }

  output {
    Int result = d2.out
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "input_ref_call.x": 5
}
```

Example output:

```json
{
  "input_ref_call.result": 20
}
```


</details>

The control flow of this workflow changes depending on whether the value of `y` is provided as an input or it's initializer expression is evaluated:

* If an input value is provided for `y` then it receives that value immediately and `d2` may start running as soon as the workflow starts.
* In no input value is provided for `y` then it will need to wait for `d1` to complete before it is assigned.
