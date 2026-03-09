+++
title = "glob"
description = "Find files matching a glob pattern"
weight = 20
+++

```
Array[File] glob(String)
```

Returns the Bash expansion of the [glob string](https://en.wikipedia.org/wiki/Glob_(programming)) relative to the task's execution directory, and in the same order.

`glob` finds all of the files (but not the directories) in the same order as would be matched by running `echo <glob>` in Bash from the task's execution directory.

Symlinks are handled by following them to their target. Symlinks that point to files are included in the results, while symlinks that point to directories are excluded. Broken symlinks (those that point to non-existent targets) are included.

At least in standard Bash, glob expressions are not evaluated recursively, i.e., files in nested directories are not included.

**Parameters**:

1. `String`: The glob string.

**Returns**: A array of all files matched by the glob.

<details>
<summary>
Example: gen_files_task.wdl

```wdl
version 1.3

task gen_files {
  input {
    Int num_files
  }

  command <<<
    for i in {1..~{num_files}}; do
      printf ${i} > a_file_${i}.txt
    done
    mkdir a_dir
    touch a_dir/a_inner.txt
  >>>

  output {
    Array[File] files = glob("a_*")
    Int glob_len = length(files)
  }
}
```
</summary>
<p>
Example input:

```json
{
  "gen_files.num_files": 2
}
```

Example output:

```json
{
  "gen_files.glob_len": 2
}
```

Test config:

```json
{
  "exclude_outputs": ["gen_files.files"]
}
```
</p>
</details>

This command generates the following directory structure:

```txt
<workdir>
├── a_dir
│   └─ a_inner.txt
├── a_file_1.txt
└── a_file_2.txt
```

Running `echo a_*` in the execution directory would expand to `a_dir`, `a_file_1.txt`, and `a_file_2.txt`, in that order. Since `glob` ignores directories, `a_dir` is discarded and the result of the expression is `["a_file_1.txt", "a_file_2.txt"]`.

#### Non-standard Bash

The runtime container may use a non-standard Bash shell that supports more complex glob strings, such as allowing expansions that include `a_inner.txt` in the example above. To ensure that a WDL task is portable when using `glob`, a container image should be provided and the WDL author should remember that `glob` results depend on coordination with the Bash implementation provided in that container.
