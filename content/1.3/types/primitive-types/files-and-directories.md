+++
title = "Files and Directories"
description = "File and Directory types, path canonicalization, validation, and relative/absolute paths"
weight = 20
+++

A `File` or `Directory` declaration may have have a string value indicating a relative or absolute path on the local file system.

### Path Canonicalization and Validation

When a `File` or `Directory` value is created, the following operations are performed:

- **Path Canonicalization.** Intermediate path components are normalized (resolving `.` for current directory and `..` for parent directory segments), symbolic links are resolved to their final targets, and relative paths are converted to their absolute path form. For `Directory` values, trailing directory separators are removed.
- **Path Validation.** The path must exist at value creation time. If the path does not exist, an error occurs immediately. The file/directory must accessible for reading (i.e., assigned the appropriate permissions). Additionally, a `File` value cannot refer to a directory; if the path refers to a directory, an error occurs. Similarly, a `Directory` value cannot refer to a file; if the path refers to a file, an error occurs.

Value creation occurs when the value is materialized as a `File`/`Directory` within the execution engine, including

- When a `File` or `Directory` declaration is evaluated
- When a `String` is coerced to a `File` or `Directory` type

After canonicalization, two `File` or `Directory` values that refer to the same underlying resource are considered equal for all comparison operations, even if they were initialized from different string representations.

```wdl
task literals_paths {
  input {
    File f1 = "/foo/bar.txt"
    File? f2
  }

  # If baz.txt does not exist, this is an error.
  File f3 = "baz.txt"

  # If qux.txt does not exist, this is set to `None`.
  File? f4 = "qux.txt"

  command <<<
    # If the user does not overide the value of `f1`, and /foo/bar.txt
    # does not exist, an error will occur when the `File` value is created.
    cat "~{f1}"

    # If the user does not specify the value of `f2` it's value is `None`,
    # which results in the empty-string when interpolated. `-f ""` is
    # always false.
    if [ -f "~{f2}" ]; then
      echo "~{f2}"
    fi
}
```

Within a WDL file, the execution engine is only required to support literal values for files and directories that are paths local to the execution environment.

During task execution, the following additional constraints apply:

* To write to a file, the path's parent directory must be accessible for writing.
* To write to a directory, it must exist and be accessible for writing.

An execution engine may support other ways to specify `File` and `Directory` inputs (e.g., as URIs), but prior to task execution it must localize inputs so that the runtime value of a `File`/`Directory` variable is a local path. Remote files must be treated as read-only. For remote files, localization occurs as part of value creation—the remote file must be accessible and valid when the `File` or `Directory` value is evaluated, at which point it is localized and the resulting local path is validated according to the rules above.

### Relative and Absolute Paths

The interpretation of relative paths (paths that do not start with `/`) depends on the context in which they appear:

* *Outside the `output` section (e.g., in `input` or private declarations)*, relative paths are interpreted relative to the parent directory of the WDL document itself on the host filesystem, similar to how import paths are resolved.
* *Inside the `output` section*, relative paths are interpreted relative to the task's execution directory. This is where task commands create their output files. See [Task Outputs](@/1.3/tasks/outputs.md) for details.

In both contexts, if an optional `File?` or `Directory?` declaration refers to a path that does not exist, the value is set to `None`.

Absolute paths (paths starting with `/`) refer to specific locations on the host filesystem when used outside the `output` section. Within the `output` section, absolute paths may be interpreted in a container-dependent way—see [Task Outputs](@/1.3/tasks/outputs.md) for details.

Example: relative_paths_context.wdl


```wdl
version 1.3

task relative_paths_context {
  # This relative path is resolved relative to the WDL document's parent directory.
  File input_file = "data/hello.txt"

  command <<<
    cat ~{input_file} > output.txt
  >>>

  output {
    # This relative path is resolved relative to the execution directory.
    File result = "output.txt"
    String content = read_string(result)
  }
}
```


<details>
<summary></summary>


Example input:

```json
{}
```

Example output:

```json
{
  "relative_paths_context.result": "hello.txt"
  "relative_paths_context.content": "hello"
}
```

Test config:

```json
{
  "exclude_outputs": ["result"]
}
```


</details>

In this example,

- The `input_file` input uses a relative path that refers to a file co-located with the WDL document on the host filesystem.
- The `result` output uses a relative path that refers to a file created by the command in the execution directory.
