+++
title = "Task Definition"
sort_by = "weight"
description = "Defining atomic units of computation in WDL"
weight = 40
+++

A WDL task can be thought of as a template for running a set of commands - specifically, a Bash script - in a manner that is (ideally) independent of the execution engine and the runtime environment.

A task is defined using the `task` keyword, followed by a task name that is unique within its WDL document.

Tasks are comprised of the following elements:

* A single, optional [`input`](@/1.1/tasks/inputs.md) section, which defines the inputs for the task.
* A single, required [`command`](@/1.1/tasks/command.md) section, which defines the Bash script to be executed.
* A single, optional [`output`](@/1.1/tasks/outputs.md) section, which defines the outputs for the task.
* A single, optional [`runtime`](@/1.1/tasks/runtime.md) section, which defines the runtime environment conditions.
* A single, optional [`meta`](@/1.1/tasks/metadata.md) section, which defines task-level metadata.
* A single, optional [`parameter_meta`](@/1.1/tasks/metadata.md) section, which defines parameter-level metadata.
* Any number of [private declarations](@/1.1/tasks/private-declarations.md).

There is no enforced order for task elements.

The execution engine is responsible for "instantiating" the shell script (i.e., replacing all references with actual values) in an environment that meets all specified runtime requirements, localizing any input files into that environment, executing the script, and generating any requested outputs.

```wdl
task name {
  input {
    # task inputs are declared here
  }

  # other "private" declarations can be made here

  command <<<
    # the command template - this section is required
  >>>

  output {
    # task outputs are declared here
  }

  runtime {
    # runtime attributes are specified here
  }

  meta {
    # task-level metadata can go here
  }

  parameter_meta {
    # metadata about each input/output parameter can go here
  }
}
```
