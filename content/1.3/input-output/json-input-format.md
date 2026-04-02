+++
title = "JSON Input Format"
description = "Providing workflow and task inputs via JSON"
weight = 10
+++

The inputs for a workflow invocation may be specified as a single JSON object that contains one member for each top-level workflow input. The name of the object member is the [fully-qualified name](@/1.3/workflows/qualified-names.md) of the input parameter, and the value is the [serialized form](@/1.3/input-output/json-serialization.md) of the WDL value.

If the WDL implementation supports the [`allow_nested_inputs`](@/1.3/workflows/hints.md#allow-nested-inputs) hint, then optional inputs for nested calls can also be specified in the input JSON, provided the call does not already specify a value for the input. Nested inputs are referenced using the name of the `call`, which may be different from the name of the task or subworkflow (i.e., if is imported or called with an alias). When a `call` appears within a `scatter`, setting the value of an input applies to every instance of the call.

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
  "wf.call1.s": "call 1 input",
  "wf.call2.s": "call 2 input"
}
```

WDL implementations are only required to support workflow execution, and not necessarily task execution, so a JSON input format for tasks is not specified. However, it is strongly suggested that if an implementation does support task execution, that it also supports this JSON input format for tasks. It is left to the discretion of the WDL implementation whether it is required to prefix the task input with the task name, i.e., `mytask.infile` vs. `infile`.

### File/Directory Inputs

It is up to the execution engine to resolve input files and directories and stage them into the execution environment. The execution engine is free to specify the values that are allowed for `File` and `Directory` parameters, but at a minimum it is required to support POSIX absolute file paths (e.g., `/path/to/file`).

It is strongly recommended that input files and directories be specified as absolute paths to local files or as URLs. If relative paths are allowed, then it is suggested that they be resolved relative to the directory that contains the input JSON file (if a file is provided) or to the working directory in which the workflow is initially launched.

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

### Specifying / Overriding Requirements and Hints

[Requirement](@/1.3/tasks/requirements.md) and [hint](@/1.3/tasks/hints.md) attributes can be specified (or overridden) for any task in the JSON input file. To differentiate requirements and hints from task inputs, the `requirements` or `hints` namespace is added after the task name.

```json
{
  "wf.task1.requirements.memory": "16 GB",
  "wf.task2.requirements.cpu": 2,
  "wf.task2.requirements.disks": "100",
  "wf.subwf.task3.requirements.container": "mycontainer:latest",
  "wf.task4.hints.foo": "bar"
}
```

Overriding an attribute for a task nested within a `scatter` applies to all invocations of that task.

Unlike inputs, a WDL implementation must support overriding requirements and hints regardless of whether it supports the [`allow_nested_inputs`](@/1.3/workflows/hints.md#allow-nested-inputs) workflow hint. Requirements and hints specified in the input JSON always supersede values supplied directly in the WDL. Any hints that are not supported by the execution engine are ignored.
