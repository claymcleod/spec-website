+++
title = "Workflow Outputs"
weight = 30
+++

### Outputs

Each `workflow` definition can specify an `output` section.  This section lists outputs as `Type name = expression`, just like task outputs.

Workflow outputs also follow the same syntax rules as task outputs. They are expressions which can reference all call outputs, workflow inputs, intermediate values and previous workflow outputs.
e.g:

```wdl
task t {
  input {
    Int i
  }
  command {
    # do something
  }
  output {
    String out = "out"
  }
}

workflow w {
  input {
    String w_input = "some input"
  }

  call t
  call t as u

  output {
    String t_out = t.out
    String u_out = u.out
    String input_as_output = w_input
    String previous_output = u_out
  }
}
```

Note that they can't reference call inputs (eg we cannot use `Int i = t.i` as a workflow output). However this can be achieved by also declaring the desired call input as an output of the call.

When declaring a workflow output that points to a call inside a scatter, the aggregated call is used, just like any expression that references it from outside the scatter.
e.g:

```wdl
task t {
  command {
    # do something
  }
  output {
    String out = "out"
  }
}

workflow w {
  input {
    Array[Int] arr = [1, 2]
  }

  scatter(i in arr) {
    call t
  }

  output {
    Array[String] t_out = t.out
  }
}
```

In this example `t_out` has an `Array[String]` result type, because `call t` is inside a scatter.

#### Omitting Workflow Outputs

If the `output {...}` section is omitted from a top-level workfow then the workflow engine should include all outputs from all calls in its final output.

However, if a workflow is intended to be called as a subworkflow, it is required that outputs are named and specified using expressions in the outputs block, just like task outputs. The rationale here is:
- To present the same interface when calling subworkflows as when calling tasks.
- To make it easy for callers of subworkflows to find out exactly what outputs the call is creating.
- In case of nested subworkflows, to give the outputs at the top level a simple fixed name rather than a long qualified name like `a.b.c.d.out` (which is liable to change if the underlying implementation of `c` changes, for example).
