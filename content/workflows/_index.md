+++
title = "Workflow Definition"
description = "Orchestrating tasks into workflows"
sort_by = "weight"
+++

A workflow can be thought of as a directed acyclic graph (DAG) of transformations that convert the input data to the desired outputs. Rather than explicitly specifying the sequence of operations, a WDL workflow instead describes the connections between the steps in the workflow (i.e., between the nodes in the graph). It is the responsibility of the execution engine to determine the proper ordering of the workflow steps, and to orchestrate the execution of the different steps.

A workflow is defined using the `workflow` keyword, followed by a workflow name that is unique within its WDL document, followed by any number of workflow elements within braces.

```wdl
workflow name {
  input {
    # workflow inputs are declared here
  }

  # other "private" declarations can be made here
 
  # there may be any number of (potentially nested) 
  # calls, scatters, or conditionals
  call target { ... }
  scatter (i in collection) { ... }
  if (condition) { ... }

  output {
    # workflow outputs are declared here
  }

  hints {
    # workflow hints are declared here
  }

  meta {
    # workflow-level metadata can go here
  }

  parameter_meta {
    # metadata about each input/output parameter can go here
  }
}
```

