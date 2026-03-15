+++
title = "Call Statement"
description = "Invoking tasks and sub-workflows"
weight = 60
+++

A workflow calls other tasks/workflows via the `call` keyword. A `call` is followed by the name of the task or subworkflow to run. If a task is defined in the same WDL document as the calling workflow, it may be called using just the task name. A task or workflow in an imported WDL must be called using its [fully-qualified name](@/1.1/workflows/qualified-names.md).

Each `call` must be uniquely identifiable. By default, the `call`'s unique identifier is the task or subworkflow name (e.g., `call foo` would be referenced by name `foo`). However, to `call foo` multiple times in the same workflow, it is necessary to give all except one of the `call` statements a unique alias using the `as` clause, e.g., `call foo as bar`.

A `call` has an optional body in braces (`{}`). The only element that may appear in the call body is the `input:` keyword, followed by an optional, comma-delimited list of inputs to the call. A `call` must, at a minimum, provide values for all of the task/subworkflow's required inputs, and each input value/expression must match the type of the task/subworkflow's corresponding input parameter. An input value may be any valid expression, not just a reference to another call output. If a task has no required parameters, then the `call` body may be empty or omitted.

If a call input has the same name as a declaration from the current scope, the name of the input may appear alone (without an expression) to implicitly bind the value of that declaration. For example, if a workflow and task both have inputs `x` and `z` of the same types, then `call mytask {input: x, y=b, z}` is equivalent to `call mytask {input: x=x, y=b, z=z}`.

Example: call_example.wdl


```wdl
version 1.1

import "other.wdl" as lib

task repeat {
  input {
    Int i
    String? opt_string
  }

  command <<<
  for i in {1..~{i}}; do
    printf '~{select_first([opt_string, "default"])}\n'
  done
  >>>

  output {
    Array[String] lines = read_lines(stdout())
  }
}

workflow call_example {
  input {
    String s
    Int i
  }

  # Calls repeat with one required input - it is okay to not
  # specify a value for repeat.opt_string since it is optional.
  call repeat { input: i = 3 }

  # Calls repeat a second time, this time with both inputs.
  # We need to give this one an alias to avoid name-collision.
  call repeat as repeat2 {
    input:
      i = i * 2,
      opt_string = s
  }

  # Calls repeat with one required input using the abbreviated
  # syntax for `i`.
  call repeat as repeat3 { input: i, opt_string = s }

  # Calls a workflow imported from lib with no inputs.
  call lib.other
  # This call is also valid
  call lib.other as other_workflow2 {}

  output {
    Array[String] lines1 = repeat.lines
    Array[String] lines2 = repeat2.lines
    Array[String] lines3 = repeat3.lines
    Int? results1 = other.results
    Int? results2 = other_workflow2.results
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "call_example.s": "hello",
  "call_example.i": 2
}
```

Example output:

```json
{
  "call_example.lines1": ["default", "default", "default"],
  "call_example.lines2": ["hello", "hello", "hello", "hello"],
  "call_example.lines3": ["hello", "hello"],
  "call_example.results1": null,
  "call_example.results2": null
}
```


</details>

The execution engine may execute a `call` as soon as all its inputs are available. If `call x`'s inputs are based on `call y`'s outputs (i.e., `x` depends on `y`), `x` can be run as soon as - but not before - `y` has completed.

An `after` clause can be used to create an explicit dependency between `x` and `y` (i.e., one that isn't based on the availability of `y`'s outputs). For example, `call x after y after z`. An explicit dependency is only required if `x` must not execute until after `y` and `x` doesn't already depend on output from `y`.

Example: test_after.wdl


```wdl
version 1.1

import "call_example.wdl" as lib

workflow test_after {
  # Call repeat
  call lib.repeat { input: i = 2, opt_string = "hello" }

  # Call `repeat` again with the output from the first call.
  # This call will wait until `repeat` is finished.
  call lib.repeat as repeat2 {
    input:
      i = 1,
      opt_string = sep(" ", repeat.lines)
  }

  # Call `repeat` again. This call does not depend on the output
  # from an earlier call, but we specify explicitly that this
  # task must wait until `repeat` is complete before executing.
  call lib.repeat as repeat3 after repeat { input: i = 3 }

  output {
    Array[String] lines1 = repeat.lines
    Array[String] lines2 = repeat2.lines
    Array[String] lines3 = repeat3.lines
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
  "test_after.lines1": ["hello", "hello"],
  "test_after.lines2": ["hello hello"],
  "test_after.lines3": ["default", "default", "default"]
}
```


</details>

A `call`'s outputs are available to be used as inputs to other calls in the workflow or as workflow outputs immediately after the execution of the call has completed. The only task declarations that are accessible outside of the task are its output declarations; call inputs and private declarations cannot be referenced by the calling workflow. To expose a call input, add an output to the task that simply copies the input. Note that the output must use a different name since every declaration in a task or workflow must have a unique name.

Example: copy_input.wdl


```wdl
version 1.1

task greet {
  input {
    String greeting
  }

  command <<< printf "~{greeting}, nice to meet you!" >>>

  output {
    # expose the input to s as an output
    String greeting_out = greeting
    String msg = read_string(stdout())
  }
}

workflow copy_input {
  input {
    String name
  }

  call greet { input: greeting = "Hello ~{name}" }

  output {
    String greeting = greet.greeting_out
    String msg = greet.msg
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "copy_input.name": "Billy"
}
```

Example output:

```json
{
  "copy_input.greeting": "Hello Billy",
  "copy_input.msg": "Hello Billy, nice to meet you!"
}
```


</details>

#### Computing Call Inputs

Any required workflow inputs (i.e., those that are not initialized with a default expression) must have their values provided when invoking the workflow. Inputs may be specified for a workflow invocation using any mechanism supported by the execution engine, including the [standard JSON format](@/1.1/input-output/json-input-format.md).

By default, all calls to subworkflows and tasks must have values provided for all required inputs by the caller. However, the execution engine may allow the workflow to leave some subworkflow/task inputs undefined - to be specified by the user at runtime - by setting the `allowNestedInputs` flag to `true` in the `meta` section of the top-level workflow.

A call to a subworkflow or task must, at a minimum, provide a value for each required input. The call may also specify values for any optional inputs. Any optional inputs that are not specified in the call may be set by the user at runtime if the execution engine supports the `allowNestedInputs` directive and it is set to `true` in the workflow's `meta` section.

The following table describes whether a subworkflow or task input's value must be specified in the call inputs and whether it may be set at runtime based on whether it has a default value and the value of the `allowNestedInputs` directive:

| Has default value? | Value of `allowNestedInputs` | Must be specified in call inputs? | Can be overriden at runtime? |
| ------------------ | ---------------------------- | --------------------------------- | ---------------------------- |
| No                 | `false`                      | Yes                               | No                           |
| No                 | `true`                       | Yes                               | No                           |
| Yes                | `false`                      | No                                | No                           |
| Yes                | `true`                       | No                                | Yes                          |

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> Previously, setting `allowNestedInputs` to `true` also allowed for required task inputs to be left unsatisfied by the calling workflow and only specified at runtime. This behavior is deprecated and will be removed in WDL 2.0.

Example: allow_nested.wdl


```wdl
version 1.1

import "call_example.wdl" as lib

task inc {
  input {
    Int y
    File ref_file # Do nothing with this
  }

  command <<<
  printf ~{y + 1}
  >>>

  output {
    Int incr = read_int(stdout())
  }

  runtime {
    container: "ubuntu:latest"
  }
}

workflow allow_nested {
  input {
    Int int_val
    String msg1
    String msg2
    Array[Int] my_ints
    File ref_file
  }

  meta {
    allowNestedInputs: true
  }

  call lib.repeat {
    input:
      i = int_val,
      opt_string = msg1
  }

  call lib.repeat as repeat2 {
    input:
      opt_string = msg2
  }

  scatter (i in my_ints) {
    call inc {
      input: y=i, ref_file=ref_file
    }
  }

  output {
    Array[String] lines1 = repeat.lines
    Array[String] lines2 = repeat2.lines
    Array[Int] incrs = inc.incr
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "allow_nested.int_val": 3,
  "allow_nested.msg1": "hello",
  "allow_nested.msg2": "goodbye",
  "allow_nested.my_ints": [1, 2, 3],
  "allow_nested.ref_file": "data/hello.txt",
  "allow_nested.repeat2.i": 2
}
```

Example output:

```json
{
  "allow_nested.lines1": ["hello", "hello", "hello"],
  "allow_nested.lines2": ["goodbye", "goodbye"],
  "allow_nested.incrs": [2, 3, 4]
}
```


</details>

In the preceding example, the required input `i` to call `repeat2` is missing. Normally this would result in an error. However, if the execution engine supports `allowNestedInputs`, then the fact that `allowNestedInputs: true` appears in the workflow's `meta` section means that `repeat2.i` may be set by the caller of the workflow, e.g., by including `"allow_nested.repeat2.i": 2,` in the input JSON.

It is not allowed to *override* a call input at runtime, even if nested inputs are allowed. For example, if the user tried to specify `"allow_nested.repeat.opt_string": "hola"` in the input JSON, an error would be raised because the workflow already specifies a value for that input.

The `allowNestedInputs` directive only applies to user-supplied inputs. There is no mechanism for the workflow itself to set a value for a nested input when calling a subworkflow. For example, the following workflow is invalid:

Example: call_subworkflow_fail.wdl


```wdl
version 1.1

import "copy_input.wdl" as copy

workflow call_subworkflow {
  meta {
    allowNestedInputs: true
  }

  # error! A workflow can't specify a nested input for a subworkflow's call.
  call copy.copy_input { input: greet.greeting = "hola" }
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>
