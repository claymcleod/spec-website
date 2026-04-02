+++
title = "read_map"
description = "Read a two-column TSV as a Map"
weight = 3150
+++

```
Map[String, String] read_map(String|File)
```

Given a file-like object (`String`, `File`) as a parameter, this will read each line from a file and expect the line to have the format `col1\tcol2`. In other words, the file-like object must be a two-column TSV file.

If the entire contents of the file can not be read for any reason, the calling task or workflow will be considered to have failed. Examples of failure include but are not limited to not having access to the file, resource limitations (e.g. memory) when reading the file, and implementation imposed file size limits.

**Parameters**

1. `String|File`: Path of the two-column TSV file to read.

**Returns**: A `Map[String, String]` of the data in the file.

The following task would write a two-column TSV to standard out and that would be interpreted as a `Map[String, String]`:

Example: read_map_task.wdl

```wdl
task do_stuff {
  input {
    String flags
    File file
  }
  command {
    ./script --flags=${flags} ${file}
  }
  output {
    Map[String, String] mapping = read_map(stdout())
  }
}
```

