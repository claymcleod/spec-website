+++
title = "Workflow Elements"
weight = 10
+++

Tasks and workflows have several elements in common. When applicable, the task definition for these sections is linked to rather than duplicated.

A workflow is comprised of the following elements:

* A single, optional [`input`](@/1.3/tasks/inputs.md) section (_identical to the `input` section within tasks_).
* Any number of workflow execution elements, which include the following:
  * A [private declaration](@/1.3/tasks/private-declarations.md) (_identical to private declarations within tasks_).
  * A [`call`](@/1.3/workflows/call.md) statement, which invokes tasks or subworkflows.
  * A [`scatter`](@/1.3/workflows/scatter.md) statement, which enables parallelized of workflow execution elements across collections.
  * A [conditional (`if`)](@/1.3/workflows/conditional.md) statement, which enables conditional execution of workflow execution elements.
* A single, optional [`output`](@/1.3/tasks/outputs.md) section (_identical to the `output` section within tasks_).
* A single, optional [`meta`](@/1.3/tasks/metadata.md) section (_identical to the `meta` section within tasks_).
* A single, optional [`parameter_meta`](@/1.3/tasks/metadata.md) section (_identical to the `parameter_meta` section within tasks_).

There is no enforced order for workflow elements.
