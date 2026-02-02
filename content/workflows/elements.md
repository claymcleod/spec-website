+++
title = "Workflow Elements"
description = "Components that make up a workflow"
weight = 10
+++

Tasks and workflows have several elements in common. When applicable, the task definition for these sections is linked to rather than duplicated.

A workflow is comprised of the following elements:

* A single, optional [`input`](@/tasks/inputs.md) section (_identical to the `input` section within tasks_).
* Any number of workflow execution elements, which include the following:
  * A [private declaration](@/tasks/private-declarations.md) (_identical to private declarations within tasks_).
  * A [`call`](@/workflows/call.md) statement, which invokes tasks or subworkflows.
  * A [`scatter`](@/workflows/scatter.md) statement, which enables parallelized of workflow execution elements across collections.
  * A [conditional (`if`)](@/workflows/conditional.md) statement, which enables conditional execution of workflow execution elements.
* A single, optional [`output`](@/tasks/outputs.md) section (_identical to the `output` section within tasks_).
* A single, optional [`meta`](@/tasks/metadata.md) section (_identical to the `meta` section within tasks_).
* A single, optional [`parameter_meta`](@/tasks/metadata.md) section (_identical to the `parameter_meta` section within tasks_).

There is no enforced order for workflow elements.

