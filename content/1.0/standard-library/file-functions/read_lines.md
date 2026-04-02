+++
title = "read_lines"
description = "Read file as array of lines"
weight = 3110
+++

```
Array[String] read_lines(String|File)
```

Given a file-like object (`String`, `File`) as a parameter, this will read each line as a string and return an `Array[String]` representation of the lines in the file.

The order of the lines in the returned `Array[String]` must be the order in which the lines appear in the file-like object.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the file to read.

**Returns**: An `Array[String]` representation of the lines in the file.

This task would `grep` through a file and return all strings that matched the pattern:

Example: grep_task.wdl

```wdl
task do_stuff {
  input {
    String pattern
    File file
  }
  command {
    grep '${pattern}' ${file}
  }
  output {
    Array[String] matches = read_lines(stdout())
  }
}
```

