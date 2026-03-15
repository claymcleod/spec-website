+++
title = "read_tsv"
description = "Read a TSV file"
weight = 40
+++

```
Array[Array[String]] read_tsv(String|File)
```

The `read_tsv()` function takes one parameter, which is a file-like object (`String`, `File`) and returns an `Array[Array[String]]` representing the table from the TSV file.

If the parameter is a `String`, this is assumed to be a local file path relative to the current working directory of the task.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the TSV file to read.

**Returns**: An `Array[Array[String]]` representing the table from the TSV file.

For example, if I write a task that outputs a file to `./results/file_list.tsv`, and my task is defined as:

Example: read_tsv_task.wdl

```wdl
task do_stuff {
  input {
    File file
  }
  command {
    python do_stuff.py ${file}
  }
  output {
    Array[Array[String]] output_table = read_tsv("./results/file_list.tsv")
  }
}
```


Then when the task finishes, to fulfull the `outputs_table` variable, `./results/file_list.tsv` must be a valid TSV file or an error will be reported.
