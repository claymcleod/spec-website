+++
title = "JSON Input Format"
weight = 10
+++

## Computing Inputs

Both tasks and workflows have a typed inputs that must be satisfied in order to run.  The following sections describe how to compute inputs for `task` and `workflow` declarations.

### Computing Task Inputs

Tasks define all their inputs as declarations within the `input` section. Any non-input declarations are not inputs to the task and therefore cannot be overridden.

```wdl
task test {
  input {
    Int i
    Float f
  }
  String s = "${i}"

  command {
    ./script.sh -i ${s} -f ${f}
  }
}
```

In this example, `i`, and `f` are inputs to this task even though `i` is not directly used in the command section. In comparison, `s` is an input even though the command line references it.

### Computing Workflow Inputs

Workflows have inputs that must be satisfied to run them, just like tasks. Inputs to the workflow are provided as a key/value map where the key is of the form `workflow_name.input_name`.

* If a workflow is to be used as a sub-workflow it must ensure that all of the inputs to its calls are satisfied.
* If a workflow will only ever be submitted as a top-level workflow, it may optionally leave its tasks' inputs unsatisfied. This then forces the engine to additionally supply those inputs at run time. In this case, the inputs' names must be qualified in the inputs as `workflow_name.task_name.input_name`.

Any declaration that appears outside the `input` section is considered an intermediate value and **not** a workflow input. Any declaration can always be moved inside the `input` block to make it overrideable.

Consider the following workflow:

```wdl
task t1 {
  input {
    String s
    Int x
  }

  command {
    ./script --action=${s} -x${x}
  }
  output {
    Int count = read_int(stdout())
  }
}

task t2 {
  input {
    String s
    Int t
    Int x
  }

  command {
    ./script2 --action=${s} -x${x} --other=${t}
  }
  output {
    Int count = read_int(stdout())
  }
}

task t3 {
  input {
    Int y
    File ref_file # Do nothing with this
  }

  command {
    python -c "print(${y} + 1)"
  }
  output {
    Int incr = read_int(stdout())
  }
}

workflow wf {
  input {
    Int int_val
    Int int_val2 = 10
    Array[Int] my_ints
    File ref_file
  }

  String not_an_input = "hello"

  call t1 {
    input: x = int_val
  }
  call t2 {
    input: x = int_val, t=t1.count
  }
  scatter(i in my_ints) {
    call t3 {
      input: y=i, ref=ref_file
    }
  }
}
```

The inputs to `wf` would be:

* `wf.t1.s` as a `String`
* `wf.t2.s` as a `String`
* `wf.int_val` as an `Int`
* `wf.my_ints` as an `Array[Int]`
* `wf.ref_file` as a `File`

Note that because some call inputs are left unsatisfied, this workflow could not be used as a sub-workflow. To fix that, additional workflow inputs could be added to pass-through `t1.s` and `t2.s`.

### Specifying Workflow Inputs in JSON

Once workflow inputs are computed (see previous section), the value for each of the fully-qualified names needs to be specified per invocation of the workflow.  Workflow inputs are specified as key/value pairs. The mapping from JSON or YAML values to WDL values is codified in the [serialization of task inputs](@/1.0/appendices/appendix-a.md#serialization-of-task-inputs) section.

In JSON, the inputs to the workflow in the previous section might be:

```json
{
  "wf.t1.s": "some_string",
  "wf.t2.s": "some_string",
  "wf.int_val": 3,
  "wf.my_ints": [5,6,7,8],
  "wf.ref_file": "/path/to/file.txt"
}
```

It's important to note that the type in JSON must be coercable to the WDL type.  For example `wf.int_val` expects an integer, but if we specified it in JSON as `"wf.int_val": "three"`, this coercion from string to integer is not valid and would result in a coercion error.  See the section on [Type Coercion](@/1.0/types/type-conversion.md) for more details.
