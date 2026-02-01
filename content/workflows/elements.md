+++
title = "Workflow Elements"
description = "Components that make up a workflow"
weight = 10
+++

Tasks and workflows have several elements in common. When applicable, the task definition for these sections is linked to rather than duplicated.

A workflow is comprised of the following elements:

* A single, optional [`input`](#) section (_identical to the `input` section within tasks_).
* Any number of workflow execution elements, which include the following:
  * A [private declaration](#) (_identical to private declarations within tasks_).
  * A [`call`](#) statement, which invokes tasks or subworkflows.
  * A [`scatter`](#) statement, which enables parallelized of workflow execution elements across collections.
  * A [conditional (`if`)](#) statement, which enables conditional execution of workflow execution elements.
* A single, optional [`output`](#) section (_identical to the `output` section within tasks_).
* A single, optional [`meta`](#) section (_identical to the `meta` section within tasks_).
* A single, optional [`parameter_meta`](#) section (_identical to the `parameter_meta` section within tasks_).

There is no enforced order for workflow elements.

