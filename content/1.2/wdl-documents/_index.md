+++
title = "WDL Documents"
description = "Structure and organization of WDL document files"
sort_by = "weight"
weight = 35
+++

A WDL document is a file that contains valid WDL definitions.

A WDL document must contain:

* A [version statement](@/1.2/wdl-documents/versioning.md) on the first non-comment line of the file.
* At least one [struct definition](@/1.2/types/compound-types/structs.md#struct-definition), [task definition](@/1.2/tasks/_index.md), [workflow definition](@/1.2/workflows/_index.md).

A WDL document may contain any combination of the following:

* Any number of [import statements](@/1.2/wdl-documents/import-statements.md).
* Any number of `struct` definitions.
* Any number of `task` definitions.
* A maximum of one `workflow` definition.

To execute a WDL workflow, the user must provide the execution engine with the location of a "primary" WDL file (which may import additional files as needed) and any input values needed to satisfy all required task and workflow input parameters, using a [standard input JSON file](@/1.2/input-output/json-input-format.md) or some other execution engine-specific mechanism.

If a workflow appears in the primary WDL file, it is called the "top-level" workflow, and any workflows it calls via imports are "subworkflows". Typically, it is an error for the primary WDL file to not contain a workflow; however, an execution engine may choose to support executing individual tasks.
