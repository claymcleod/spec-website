+++
title = "Workflow Hints"
weight = 45
+++

The `hints` section is optional and may contain any number of attributes (key/value pairs) that provide hints to the execution engine. Some workflow hint keys are reserved and have well-defined values.

The execution engine may ignore any unsupported hint. A workflow execution never fails due to the inability of the execution engine to recognize or satisfy a hint.

Unlike [task hints](@/1.3/tasks/hints.md), workflow hints must have literal values; expressions are not allowed.

#### Reserved Workflow Hints

The following hints are reserved. An implementation is not required to support these attributes, but if it does support a reserved attribute it must enforce the semantics and allowed values defined below. The purpose of reserving these hints is to encourage interoperability of tasks and workflows between different execution engines.

##### `allow_nested_inputs`

* Allowed type: `Boolean`
* Alias: `allowNestedInputs`

When running a workflow, the user typically is only allowed to specify values for the inputs defined in the top-level workflow's `input` section. However, setting the `allow_nested_inputs` hint to `true` specifies that the execution engine is allowed to let the user set the value of some call inputs at runtime.

A call input value is eligible to be set at runtime if it corresponds to a subworkflow or task input that has a default value *and* its value is not set explicitly in the call's `input` section. The default value is used for an eligible call input when `allow_nested_inputs` is set to `false`, when the user does not specify a value for the input at runtime, or when the execution engine does not suppport `allow_nested_inputs`.

The execution engine may refuse to execute a workflow when `allow_nested_inputs` is set to `false` and the user attempts to specify a value for a nested input, but if it does execute the workflow and ignore the user-specified value then it should show a warning.

Example: test_allow_nested_inputs.wdl


```wdl
version 1.3

task nested {
  input {
    String greeting
    String name = "Joe"
  }

  command <<<
  echo "~{greeting} ~{name}"
  >>>

  output {
    String greeting_out = read_string(stdout())
  }
}

workflow test_allow_nested_inputs {
  call nested {
    greeting = "Hello"
  }

  output {
    String nested_greeting = nested.greeting_out
  }

  hints {
    allow_nested_inputs: true
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_allow_nested_inputs.nested.name": "John"
}

```

Example output:

```json
{
  "test_allow_nested_inputs.nested_greeting": "Hello John"
}

```

Test config:

```json
{
  "capabilities": ["allow_nested_inputs"]
}
```


</details>

Setting `allow_nested_inputs` to `false` in a workflow has the effect of also setting it to `false` in any nested subworkflows called by that workflow. In the following example, `allow_nested_inputs` is set to `false` in the top-level workflow (`multi_nested_inputs`), which overrides the value of `true` in the subworkflow (`test_allow_nested_inputs`).

Example: multi_nested_inputs.wdl


```wdl
version 1.3

import "test_allow_nested_inputs.wdl" as nested

workflow multi_nested_inputs {
  call nested.test_allow_nested_inputs

  hints {
    allow_nested_inputs: false
  }

  output {
    String nested_greeting = test_allow_nested_inputs.nested_greeting
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "multi_nested_inputs.test_allow_nested_inputs.nested.name": "John"
}
```

Test config:

```json
{
  "capabilities": ["allow_nested_inputs"],
  "fail": true
}
```


</details>
