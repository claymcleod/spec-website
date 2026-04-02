+++
title = "Declarations"
description = "Declaring typed variables and binding values to them"
weight = 10
+++

## Declarations

```
$declaration = $type $identifier ('=' $expression)?
```

Declarations are declared at the top of any [scope](@/1.0/appendices/appendix-b.md).

In a [task definition](@/1.0/tasks/_index.md), declarations are interpreted as inputs to the task that are not part of the command line itself.

If a declaration does not have an initialization, then the value is expected to be provided by the user before the workflow or task is run.

Some examples of declarations:

* `File x`
* `String y = "abc"`
* `Float pi = 3 + .14`
* `Map[String, String] m`

A declaration may also refer to elements that are outputs of tasks. For example:

```wdl
task test {
  input {
    String var
  }
  command {
    ./script ${var}
  }
  output {
    String value = read_string(stdout())
  }
}

task test2 {
  input {
    Array[String] array
  }
  command {
    ./script ${write_lines(array)}
  }
  output {
    Int value = read_int(stdout())
  }
}

workflow wf {
  call test as x {input: var="x"}
  call test as y {input: var="y"}
  Array[String] strs = [x.value, y.value]
  call test2 as z {input: array=strs}
}
```

`strs` in this case would not be defined until both `call test as x` and `call test as y` have successfully completed. Before that's the case, `strs` is undefined. If any of the two tasks fail, then evaluation of `strs` should return an error to indicate that the `call test2 as z` operation should be skipped.
