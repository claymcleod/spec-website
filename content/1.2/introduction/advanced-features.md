+++
title = "Advanced WDL Features"
description = "Scatter-gather patterns and parallel execution in WDL"
weight = 30
+++

WDL also provides features for implementing more complex workflows. For example, `hello_task` introduced in the previous example can be called in parallel across many different input files using the well-known [scatter-gather](https://en.wikipedia.org/wiki/Vectored_I/O#:~:text=In%20computing%2C%20vectored%20I%2FO,in%20a%20vector%20of%20buffers) pattern:

Example: hello_parallel.wdl


  ```wdl
  version 1.2

  import "hello.wdl"

  workflow hello_parallel {
    input {
      Array[File] files
      String pattern
    }

    scatter (path in files) {
      call hello.hello_task {
        infile = path,
        pattern = pattern
      }
    }

    output {
      # WDL implicitly implements the 'gather' step, so the output of
      # a scatter is always an array with the elements in the same
      # order as the input array. Since hello_task.matches is an array,
      # all the results will be gathered into an array-of-arrays.
      Array[Array[String]] all_matches = hello_task.matches
    }
  }
  ```


<details>
<summary></summary>


Example input:

  ```json
  {
    "hello_parallel.pattern": "^[a-z_]+$",
    "hello_parallel.files": ["data/greetings.txt", "data/hello.txt"]
  }
  ```

  Example output:

  ```json
  {
    "hello_parallel.all_matches": [["hi_world"], ["hello"]]
  }
  ```


</details>
