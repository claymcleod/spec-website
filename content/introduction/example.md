+++
title = "An Example WDL Workflow"
description = "A simple Hello World workflow demonstrating WDL syntax"
weight = 10
+++

Below is the code for the "Hello World" workflow in WDL. This is just meant to give a flavor of WDL syntax and capabilities - all WDL elements are described in detail in the [Language Specification](@/types/_index.md).

<details>
  <summary>
  Example: hello.wdl

  ```wdl
  version 1.2

  task hello_task {
    input {
      File infile
      String pattern
    }

    command <<<
      grep -E '~{pattern}' '~{infile}'
    >>>

    requirements {
      container: "ubuntu:latest"
    }

    output {
      Array[String] matches = read_lines(stdout())
    }
  }

  workflow hello {
    input {
      File infile
      String pattern
    }

    call hello_task {
      infile, pattern
    }

    output {
      Array[String] matches = hello_task.matches
    }
  }
  ```
  </summary>
  <p>
  Example input:

  ```json
  {
    "hello.infile": "data/greetings.txt",
    "hello.pattern": "hello.*"
  }
  ```

  Example output:

  ```json
  {
    "hello.matches": ["hello world", "hello nurse"]
  }
  ```
  </p>
</details>

*Note*: you can click the arrow next to the name of any example to expand it and see supplementary information, such as example inputs and outputs.

This WDL document describes a task, called `hello_task`, and a workflow, called `hello`.

* A task encapsulates a Bash script and a UNIX environment and presents them as a reusable function.
* A workflow encapsulates a (directed, acyclic) graph of task calls that transforms input data to the desired outputs.

Both workflows and tasks can accept input parameters and produce outputs. For example, `workflow hello` has two input parameters, `File infile` and `String pattern`, and one output parameter, `Array[String] matches`. This simple workflow calls `task hello_task`, passing through the workflow inputs to the task inputs, and using the results of `call hello_task` as the workflow output.
