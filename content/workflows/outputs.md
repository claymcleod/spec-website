+++
title = "Workflow Outputs"
description = "Declaring workflow output parameters"
weight = 50
+++

The workflow and [task `output` sections](#) have identical semantics.

By default, if the `output {...}` section is omitted from a top-level workflow, then the workflow has no outputs. However, the execution engine may choose allow the user to specify that when the top-level output section is omitted, all outputs from all calls (including nested calls) should be returned.

If the `output {...}` section is omitted from a workflow that is called as a subworkflow, then that call must not have outputs. Formally defined outputs of subworkflows are required for the following reasons:

- To present the same interface when calling subworkflows as when calling tasks.
- To make it easy for callers of subworkflows to find out exactly what outputs the call is creating.
- In the case of nested subworkflows, to give the outputs at the top level a simple fixed name rather than a long qualified name like `a.b.c.d.out` (which is liable to change if the underlying implementation of `c` changes, for example).

