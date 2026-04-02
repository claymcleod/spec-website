+++
title = "JSON Input Format"
description = "Providing workflow and task inputs via JSON"
weight = 10
+++

The inputs for a workflow invocation may be specified as a single JSON object that contains one member for each top-level workflow input. The name of the object member is the [fully-qualified name](@/1.1/workflows/qualified-names.md) of the input parameter, and the value is the [serialized form](@/1.1/appendices/appendix-a.md) of the WDL value.

If the WDL implementation supports the [`allowNestedInputs`](@/1.1/workflows/call.md#computing-call-inputs) hint, then task/subworkflow inputs can also be specified in the input JSON.

Here is an example JSON input file for a workflow `wf`:

```json
{
  "wf.int_val": 3,
  "wf.my_ints": [5, 6, 7, 8],
  "wf.ref_file": "/path/to/file.txt",
  "wf.some_struct": {
    "fieldA": "some_string",
    "fieldB": 42,
    "fieldC": "/path/to/file.txt"
  },
  "wf.task1.s": "task 1 input",
  "wf.task2.s": "task 2 input"
}
```

WDL implementations are only required to support workflow execution, and not necessarily task execution, so a JSON input format for tasks is not specified. However, it is strongly suggested that if an implementation does support task execution, that it also supports this JSON input format for tasks. It is left to the discretion of the WDL implementation whether it is required to prefix the task input with the task name, i.e., `mytask.infile` vs. `infile`.

### Optional Inputs

If a workflow has an optional input, its value may or may not be specified in the JSON input. It is also valid to explicitly set the value of an optional input to be undefined using JSON `null`.

For example, given this workflow:

```wdl
workflow foo {
  input {
    File? x
    Int? y = 5
  }
}
```

The following would all be valid JSON inputs:

```json
# no input
{}

# only x
{
  "x": 100
}

# only y
{
  "x": null,
  "y": "/path/to/file"
}

# x and y
{
  "x": 1000,
  "y": "/path/to/file"
}

# override y default and set it to None
{
  "y": null
}
```

### Specifying / Overriding Runtime Attributes

The value for any runtime attribute of any task called by a workflow can be overridden in the JSON input file. Unlike inputs, a WDL implementation must support overriding runtime attributes regardless of whether it supports the [`allowNestedInputs`](@/1.1/workflows/call.md#computing-call-inputs) hint.

Values for runtime attributes provided in the input JSON always supersede values supplied directly in the WDL. Overriding an attribute for a task nested within a `scatter` applies to all invocations of that task.

Values for standardized runtime attributes must adhere to the [supported types and formats](@/1.1/tasks/runtime.md). Any non-standard runtime attributes that are not supported by the implementation are ignored.

To differentiate runtime attributes from task inputs, the `runtime` namespace is added after the task name.

```json
{
  "wf.task1.runtime.memory": "16 GB",
  "wf.task2.runtime.cpu": 2,
  "wf.task2.runtime.disks": "100",
  "wf.subwf.task3.runtime.container": "mycontainer:latest"
}
```
