+++
title = "File Functions"
sort_by = "weight"
description = "Functions for reading, writing, and inspecting files"
weight = 30
transparent = true
+++

These functions have a `File` as an input and/or output. Due to [type coercion](@/1.1/types/type-conversion.md), `File` arguments may be specified as `String` values.

For functions that read from or write to the file system, if the entire contents of the file cannot be read/written for any reason, the calling task or workflow fails with an error. Examples of failure include, but are not limited to, not having appropriate permissions, resource limitations (e.g., memory) when reading the file, and implementation-imposed file size limits.

For functions that write to the file system, the implementatuion should generate a random file name in a temporary directory so as not to conflict with any other task output files.

**Restrictions**

1. A function that only manipulates a path (i.e., doesn't require reading any of the file's attributes or contents) may be called anywhere, whether or not the file exists.
2. A function that *reads* a file or its attributes may only be called in a context where the input file exists. If the file is an input to a task or workflow, then it may be read anywhere in that task or worklow. If the file is created by a task, then it may only be read after it is created. For example, if the file is written during the execution of the `command`, then it may only be read in the task's `output` section. This includes functions like `stdout` and `stderr` that read a task's output stream.
3. A function that *writes* a file may be called anywhere. However, writing a file in a workflow is discouraged since it may have the side-effect of creating a permanent output file that is not named in the output section. For example, calling [`write_lines`](@/1.1/standard-library/file-functions/write_lines.md) in a workflow and then passing the resulting `File` as input to a task may require the engine to persist that file to cloud storage.
