+++
title = "Primitive Types"
description = "Basic data types in WDL: Boolean, Int, Float, String, File, and Directory"
weight = 10
transparent = true
+++

The following primitive types exist in WDL:

* A `Boolean` represents a value of `true` or `false`.
* An `Int` represents a signed 64-bit integer (in the range `[-2^63, 2^63)`).
* A `Float` represents a finite 64-bit IEEE-754 floating point number.
* A `String` represents a unicode character string following the format described [below](#).
* A `File` represents a file (or file-like object).
* <span class="wdl-badge wdl-badge-new">New in 1.2</span> A `Directory` represents a (possibly nested) directory of files.

<details>
  <summary>
  Example: primitive_literals.wdl

  ```wdl
  version 1.2

  task write_file_task {
    command <<<
    mkdir -p testdir
    printf "hello" > testdir/hello.txt
    >>>

    output {
      File x = "testdir/hello.txt"
      Directory d = "testdir"
    }
  }

  workflow primitive_literals {
    call write_file_task

    output {
      Boolean b = true
      Int i = 0
      Float f = 27.3
      String s = "hello, world"
      File x = write_file_task.x
      Directory d = write_file_task.d
    }
  }
  ```
  </summary>
  <p>
  Example input:

  ```json
  {}
  ```

  Example output:

  ```json
  {
    "primitive_literals.b": true,
    "primitive_literals.i": 0,
    "primitive_literals.f": 27.3,
    "primitive_literals.s": "hello, world",
    "primitive_literals.x": "hello.txt",
    "primitive_literals.d": "testdir"
  }
  ```
  </p>
</details>
