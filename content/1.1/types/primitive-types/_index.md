+++
title = "Primitive Types"
sort_by = "weight"
description = "Boolean, Int, Float, String, File, and Directory types"
weight = 10
transparent = true
+++

The following primitive types exist in WDL:

* A `Boolean` represents a value of `true` or `false`.
* An `Int` represents a signed 64-bit integer (in the range `[-2^63, 2^63)`).
* A `Float` represents a finite 64-bit IEEE-754 floating point number.
* A `String` represents a unicode character string following the format described [below](@/1.1/types/primitive-types/strings.md).
* A `File` represents a file (or file-like object).
    * A `File` declaration can have a string value indicating a relative or absolute path on the local file system.
    * Within a WDL file, literal values for files may only be local (relative or absolute) paths.
    * The path assigned to a `File` is not required to be valid unless and until it is evaluated.
      * To read from a file, it must exist and be assigned appropriate permissions.
      * To write to a file, the parent directory must be assigned appropriate permissions.
    * An execution engine may support other ways to specify [`File` inputs (e.g. as URIs)](@/1.1/input-output/_index.md), but prior to task execution it must [localize inputs](@/1.1/tasks/inputs.md#task-input-localization) so that the runtime value of a `File` variable is a local path.
      * Remote files must be treated as read-only.
      * A remote file is only required to be vaild at the time that the execution engine needs to localize it.

Example: primitive_literals.wdl


  ```wdl
  version 1.1

  task write_file_task {
    command <<<
    printf "hello" > hello.txt
    >>>

    output {
      File x = "hello.txt"
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
    "primitive_literals.b": true,
    "primitive_literals.i": 0,
    "primitive_literals.f": 27.3,
    "primitive_literals.s": "hello, world",
    "primitive_literals.x": "hello.txt"
  }
  ```


</details>
