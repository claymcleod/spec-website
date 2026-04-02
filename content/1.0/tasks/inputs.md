+++
title = "Task Inputs"
description = "Declaring and managing task input parameters"
weight = 10
+++

## Task Inputs

### Task Input Declaration

Tasks declare inputs within the task block. For example:

```wdl
task t {
  input {
    Int i
    File f
  }

  # [... other task sections]
}
```

### Task Input Localization

`File` inputs must be treated specially since they require localization to within the execution directory:

- Files are localized into the execution directory prior to the task execution commencing.
- When localizing a `File`, the engine may choose to place the file wherever it likes so long as it accords to these rules:
  - The original file name must be preserved even if the path to it has changed.
  - Two input files with the same name must be located separately, to avoid name collision.
  - Two input files which originated in the same storage directory must also be localized into the same directory for task execution (see the special case handling for Versioning Filesystems below).
- When a WDL author uses a `File` input in their [Command Section](@/1.0/tasks/command.md), the fully qualified, localized path to the file is substituted into the command string.

#### Special Case: Versioning Filesystems

Two or more versions of a file in a versioning filesystem might have the same name and come from the same directory. In that case the following special procedure must be used to avoid collision:

- The first file is always placed as normal according to the usual rules.
- Subsequent files that would otherwise overwrite this file are instead placed in a subdirectory named for the version.

For example imagine two versions of file `fs://path/to/A.txt` are being localized (labelled version `1.0` and `1.1`). The first might be localized as `/execution_dir/path/to/A.txt`. The second must then be placed in `/execution_dir/path/to/1.1/A.txt`
