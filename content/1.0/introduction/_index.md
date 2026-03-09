+++
title = "Introduction"
description = "Overview of the Workflow Description Language specification"
sort_by = "weight"
weight = 10
+++

WDL is meant to be a *human readable and writable* way to express tasks and workflows. The "Hello World" tool in WDL would look like this:

```wdl
task hello {
  input {
    String pattern
    File in
  }

  command {
    egrep '${pattern}' '${in}'
  }

  runtime {
    docker: "broadinstitute/my_image"
  }

  output {
    Array[String] matches = read_lines(stdout())
  }
}

workflow wf {
  call hello
}
```

This describes a task, called 'hello', which has two parameters (`String pattern` and `File in`). A `task` definition is a way of **encapsulating a UNIX command and environment and presenting them as functions**. Tasks have both inputs and outputs. Inputs are declared as declarations at the top of the `task` definition, while outputs are defined in the `output` section.

The user must provide a value for these two parameters in order for this task to be runnable. Implementations of WDL should accept their inputs as JSON format. For example, the above task needs values for two parameters: `String pattern` and `File in`:

|Variable|Value|
|-|-|
|wf.hello.pattern|^[a-z]+$|
|wf.hello.in|/file.txt|

Or, in JSON format:

```json
{
  "wf.hello.pattern": "^[a-z]+$",
  "wf.hello.in": "/file.txt"
}
```

Running the `wf` workflow with these parameters would yield a command line from the `call hello`:

```
egrep '^[a-z]+$' '/file.txt'
```

A simple workflow that runs this task in parallel would look like this:

```wdl
workflow example {
  input {
    Array[File] files
  }
  scatter(path in files) {
    call hello {input: in=path}
  }
}
```

The inputs to this workflow would be `example.files` and `example.hello.pattern`.

## State of the Specification

**17 August 2015**

* Added concept of fully-qualified-name as well as namespace identifier.
* Changed task definitions to have all inputs as declarations.
* Changed command parameters (`${`...`}`) to accept expressions and fewer "declarative" elements
  * command parameters also are required to evaluate to primitive types
* Added a `output` section to workflows
* Added a lot of functions to the standard library for serializing/deserializing WDL values
* Specified scope, namespace, and variable resolution semantics
