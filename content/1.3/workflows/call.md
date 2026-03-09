+++
title = "Call Statement"
weight = 40
+++

A workflow calls other tasks/workflows via the `call` keyword. A `call` is followed by the name of the task or subworkflow to run. If a task is defined in the same WDL document as the calling workflow, it may be called using just the task name. A task or workflow in an imported WDL must be called using its [fully-qualified name](@/1.3/workflows/qualified-names.md).

Each `call` must be uniquely identifiable. By default, the `call`'s unique identifier is the task or subworkflow name (e.g., `call foo` would be referenced by name `foo`). However, to `call foo` multiple times in the same workflow, it is necessary to give all except one of the `call` statements a unique alias using the `as` clause, e.g., `call foo as bar`.

A `call` has an optional body in braces (`{}`), which may contain a comma-delimited list of inputs to the call. A `call` must, at a minimum, provide values for all of the task/subworkflow's required inputs, and each input value/expression must match the type of the task/subworkflow's corresponding input parameter. An input value may be any valid expression, not just a reference to another call output. If a task has no required parameters, then the `call` body may be empty or omitted.

If a call input has the same name as a declaration from the current scope, the name of the input may appear alone (without an expression) to implicitly bind the value of that declaration. For example, if a workflow and task both have inputs `x` and `z` of the same types, then `call mytask {x, y=b, z}` is equivalent to `call mytask {x=x, y=b, z=z}`.

<details>
<summary>
Example: call_example.wdl

```wdl
version 1.3

import "other.wdl" as lib

task repeat {
  input {
    Int i = 0  # this will cause the task to fail if not overriden by the caller
    String? opt_string
  }

  command <<<
  if [ "~{i}" -lt "1" ]; then
    echo "i must be >= 1"
    exit 1
  fi
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
  call repeat { i = 3 }

  # Calls repeat a second time, this time with both inputs.
  # We need to give this one an alias to avoid name-collision.
  call repeat as repeat2 {
    i = i * 2,
    opt_string = s
  }

  # Calls repeat with one required input using the abbreviated
  # syntax for `i`.
  call repeat as repeat3 { i, opt_string = s }

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
</summary>
<p>
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
</p>
</details>

For historical reasons, the keyword `input:` may optionally precede the list of inputs inside the braces. In the following example, all the `call` statements are equivalent.

<details>
<summary>
Example: test_input_keyword.wdl

```wdl
version 1.3

import "call_example.wdl" as lib

workflow test_input_keyword {
  input {
    Int i
  }

  # These three calls are equivalent
  call lib.repeat as rep1 { i }

  call lib.repeat as rep2 { i = i}

  call lib.repeat as rep3 {
    input:  # optional (for backward compatibility)
      i
  }

  call lib.repeat as rep4 {
    input:  # optional (for backward compatibility)
      i = i
  }

  output {
    Array[String] lines1 = rep1.lines
    Array[String] lines2 = rep2.lines
    Array[String] lines3 = rep3.lines
    Array[String] lines4 = rep4.lines
  }
}
```
</summary>
<p>
Example input:

```json
{
  "test_input_keyword.i": 2
}
```

Example output:

```json
{
  "test_input_keyword.lines1": ["default", "default"],
  "test_input_keyword.lines2": ["default", "default"],
  "test_input_keyword.lines3": ["default", "default"],
  "test_input_keyword.lines4": ["default", "default"]
}
```
</p>
</details>

The execution engine may execute a `call` as soon as all its inputs are available. If `call x`'s inputs are based on `call y`'s outputs (i.e., `x` depends on `y`), `x` can be run as soon as - but not before - `y` has completed.

An `after` clause can be used to create an explicit dependency between `x` and `y` (i.e., one that isn't based on the availability of `y`'s outputs). For example, `call x after y after z`. An explicit dependency is only required if `x` must not execute until after `y` and `x` doesn't already depend on output from `y`.

<details>
<summary>
Example: test_after.wdl

```wdl
version 1.3

import "call_example.wdl" as lib

workflow test_after {
  # Call repeat
  call lib.repeat { i = 2, opt_string = "hello" }

  # Call `repeat` again with the output from the first call.
  # This call will wait until `repeat` is finished.
  call lib.repeat as repeat2 {
    i = 1,
    opt_string = sep(" ", repeat.lines)
  }

  # Call `repeat` again. This call does not depend on the output
  # from an earlier call, but we specify explicitly that this
  # task must wait until `repeat` is complete before executing.
  call lib.repeat as repeat3 after repeat { i = 3 }

  output {
    Array[String] lines1 = repeat.lines
    Array[String] lines2 = repeat2.lines
    Array[String] lines3 = repeat3.lines
  }
}
```
</summary>
<p>
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
</p>
</details>

A `call`'s outputs are available to be used as inputs to other calls in the workflow or as workflow outputs immediately after the execution of the call has completed. The only task declarations that are accessible outside of the task are its output declarations; call inputs and private declarations cannot be referenced by the calling workflow. To expose a call input, add an output to the task that simply copies the input. Note that the output must use a different name since every declaration in a task or workflow must have a unique name.

<details>
<summary>
Example: copy_input.wdl

```wdl
version 1.3

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

  call greet { greeting = "Hello ~{name}" }

  output {
    String greeting = greet.greeting_out
    String msg = greet.msg
  }
}
```
</summary>
<p>
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
</p>
</details>

#### Computing Call Inputs

Any required workflow inputs (i.e., those that are not initialized with a default expression) must have their values provided when invoking the workflow. Inputs may be specified for a workflow invocation using any mechanism supported by the execution engine, including the [standard JSON format](@/1.3/input-output/json-input-format.md).

A call to a subworkflow or task must, at a minimum, provide a value for each required input. The call may also specify values for any optional inputs. Any optional inputs that are not specified in the call may be set by the user at runtime if the execution engine supports the `allow_nested_inputs` hint and it is set to `true` in the workflow's `hints` section.

The following table describes whether a subworkflow or task input's value must be specified in the call inputs and whether it may be set at runtime based on whether it has a default value and the value of the `allow_nested_inputs` hint:

| Has default value? | Value of `allow_nested_inputs` | Must be specified in call inputs? | Can be overriden at runtime? |
|-|-|-|-|
| No | `false` | Yes | No |
| No | `true` | Yes | No |
| Yes | `false` | No | No |
| Yes | `true` | No | Yes |

Previously, setting `allow_nested_inputs` to `true` also allowed for required task inputs to be left unsatisfied by the calling workflow and only specified at runtime. This behavior is deprecated and will be removed in WDL 2.0.

The ability to set `allowNestedInputs` in the workflow's `meta` section is deprecated and will be removed in WDL 2.0.

<details>
<summary>
Example: allow_nested.wdl

```wdl
version 1.3

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

  requirements {
    container: "ubuntu:latest"
  }
}

workflow allow_nested {
  input {
    Int int_val
    String msg1
    Array[Int] my_ints
    File ref_file
  }

  hints {
    allow_nested_inputs: true
  }

  call lib.repeat {
    i = int_val,
    opt_string = msg1
  }

  call lib.repeat as repeat2 {
    i = 2
  }

  scatter (i in my_ints) {
    call inc {
      y=i, ref_file=ref_file
    }
  }

  output {
    Array[String] lines1 = repeat.lines
    Array[String] lines2 = repeat2.lines
    Array[Int] incrs = inc.incr
  }
}
```
</summary>
<p>
Example input:

```json
{
  "allow_nested.int_val": 3,
  "allow_nested.msg1": "hello",
  "allow_nested.my_ints": [1, 2, 3],
  "allow_nested.ref_file": "data/hello.txt",
  "allow_nested.repeat2.opt_string": "goodbye"
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
</p>
</details>

In the preceding example, the workflow calling `repeat2` does not provide a value for the optional input `i`. Normally this would cause the task to fail, since `i` must have a value `>= 1` and its default value is `0`. However, if the execution engine supports `allow_nested_inputs`, then specifying `allow_nested_inputs: true` in the workflow's `hints` section means that `repeat2.i` may be set by the caller of the workflow, e.g., by including `"allow_nested.repeat2.i": 2,` in the input JSON.

It is not allowed to *override* a call input at runtime, even if nested inputs are allowed. For example, if the user tried to specify `"allow_nested.repeat.opt_string": "hola"` in the input JSON, an error would be raised because the workflow already specifies a value for that input.

The `allow_nested_inputs` directive only applies to user-supplied inputs. There is no mechanism for the workflow itself to set a value for a nested input when calling a subworkflow. For example, the following workflow is invalid:

<details>
<summary>
Example: call_subworkflow_fail.wdl

```wdl
version 1.3

import "copy_input.wdl" as copy

workflow call_subworkflow {
  meta {
    allow_nested_inputs: true
  }

  # error! A workflow can't specify a nested input for a subworkflow's call.
  call copy.copy_input { greet.greeting = "hola" }
}
```
</summary>
<p>
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
</p>
</details>
