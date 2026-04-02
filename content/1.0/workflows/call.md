+++
title = "Call Statement"
description = "Invoking tasks and subworkflows within a workflow"
weight = 40
+++

### Call Statement

```
$call = 'call' $ws* $namespaced_identifier $ws+ ('as' $identifier)? $ws* $call_body?
$call_body = '{' $ws* $inputs? $ws* '}'
$inputs = 'input' $ws* ':' $ws* $variable_mappings
$variable_mappings = $variable_mapping_kv (',' $variable_mapping_kv)*
$variable_mapping_kv = $identifier $ws* '=' $ws* $expression
```

A workflow may call other tasks/workflows via the `call` keyword.  The `$namespaced_identifier` is the reference to which task to run.  Most commonly, it's simply the name of a task (see examples below), but it can also use `.` as a namespace resolver.

See the section on [Fully Qualified Names & Namespaced Identifiers](@/1.0/workflows/qualified-names.md) for details about how the `$namespaced_identifier` ought to be interpreted

All `call` statements must be uniquely identifiable.  By default, the call's unique identifier is the task name (e.g. `call foo` would be referenced by name `foo`).  However, if one were to `call foo` twice in a workflow, each subsequent `call` statement will need to alias itself to a unique name using the `as` clause: `call foo as bar`.

A `call` statement may reference a workflow too (e.g. `call other_workflow`).  In this case, the `$inputs` section specifies a subset of the workflow's inputs and must specify fully qualified names.

```wdl
import "lib.wdl" as lib
workflow wf {
  call my_task
  call my_task as my_task_alias
  call my_task as my_task_alias2 {
    input: threshold=2
  }
  call lib.other_task
}
```

The `$call_body` is optional and is meant to specify how to satisfy a subset of the the task or workflow's input parameters as well as a way to map tasks outputs to variables defined in the visible scopes.

A `$variable_mapping` in the `$inputs` section maps parameters in the task to expressions.  These expressions usually reference outputs of other tasks, but they can be arbitrary expressions.

As an example, here is a workflow in which the second task requires an output from the first task:

```wdl
task task1 {
  command {
    python do_stuff.py
  }
  output {
    File results = stdout()
  }
}
task task2 {
  input {
    File foobar
  }
  command {
    python do_stuff2.py ${foobar}
  }
  output {
    File results = stdout()
  }
}
workflow wf {
  call task1
  call task2 {
    input: foobar=task1.results
  }
}
```

#### Call Input Blocks

As mentioned above, call inputs should be provided via call inputs (`call my_task { input: x = 5 }`), or else they will become workflow inputs (`"my_workflow.my_task.x": 5`) and prevent the workflow from being composed as a subworkflow.
In situations where both are supplied (ie the workflow specifies a call input, and the user tries to supply the same input via an input file), the workflow submission should be rejected because the user has supplied an unexpected input.

The reasoning for this is that the input value is an intrinsic part of the workflow's control flow and that changing it via an input is inherently dangerous to the correct working of the workflow.

As always, if the author chooses to allow it, values provided as inputs can be overridden if they're declared in the `input` block:
```wdl
workflow foo {
  input {
    # This input `my_task_int_in` is usually based on a task output, unless it's overridden in the input set:
    Int my_task_int_in = some_preliminary_task.int_out
  }

  call some_preliminary_task
  call my_task { input: my_task_int_in = x) }
}
```

#### Sub Workflows

Workflows can also be called inside of workflows.

`main.wdl`
```wdl
import "sub_wdl.wdl" as sub

workflow main_workflow {

    call sub.wf_hello { input: wf_hello_input = "sub world" }

    output {
        String main_output = wf_hello.salutation
    }
}
```

`sub_wdl.wdl`
```wdl
task hello {
  input {
    String addressee
  }
  command {
    echo "Hello ${addressee}!"
  }
  runtime {
      docker: "ubuntu:latest"
  }
  output {
    String salutation = read_string(stdout())
  }
}

workflow wf_hello {
  input {
    String wf_hello_input
  }

  call hello {input: addressee = wf_hello_input }

  output {
    String salutation = hello.salutation
  }
}
```

Note that because a wdl file can only contain 1 workflow, sub workflows can only be used through imports.
Otherwise, calling a workflow or a task is equivalent syntactically.
Inputs are specified and outputs retrieved the same way as they are for task calls.
