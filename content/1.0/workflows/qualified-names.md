+++
title = "Qualified Names"
weight = 80
+++

### Fully Qualified Names & Namespaced Identifiers

```
$fully_qualified_name = $identifier ('.' $identifier)*
$namespaced_identifier = $identifier ('.' $identifier)*
```

A fully qualified name is the unique identifier of any particular `call` or call input or output.  For example:

other.wdl
```wdl
task foobar {
  input {
    File in
  }
  command {
    sh setup.sh ${in}
  }
  output {
    File results = stdout()
  }
}
```

main.wdl
```wdl
import "other.wdl" as other

task test {
  String my_var
  command {
    ./script ${my_var}
  }
  output {
    File results = stdout()
  }
}

workflow wf {
  Array[String] arr = ["a", "b", "c"]
  call test
  call test as test2
  call other.foobar
  output {
    test.results
    foobar.results
  }
  scatter(x in arr) {
    call test as scattered_test {
      input: my_var=x
    }
  }
}
```

The following fully-qualified names would exist within `workflow wf` in main.wdl:

* `wf` - References top-level workflow
* `wf.test` - References the first call to task `test`
* `wf.test2` - References the second call to task `test` (aliased as test2)
* `wf.test.my_var` - References the `String` input of first call to task `test`
* `wf.test.results` - References the `File` output of first call to task `test`
* `wf.test2.my_var` - References the `String` input of second call to task `test`
* `wf.test2.results` - References the `File` output of second call to task `test`
* `wf.foobar.results` - References the `File` output of the call to `other.foobar`
* `wf.foobar.input` - References the `File` input of the call to `other.foobar`
* `wf.arr` - References the `Array[String]` declaration on the workflow
* `wf.scattered_test` - References the scattered version of `call test`
* `wf.scattered_test.my_var` - References an `Array[String]` for each element used as `my_var` when running the scattered version of `call test`.
* `wf.scattered_test.results` - References an `Array[File]` which are the accumulated results from scattering `call test`
* `wf.scattered_test.1.results` - References an `File` from the second invocation (0-indexed) of `call test` within the scatter block.  This particular invocation used value "b" for `my_var`

A namespaced identifier has the same syntax as a fully-qualified name.  It is interpreted as the left-hand side being the name of a namespace and then the right-hand side being the name of a workflow, task, or namespace within that namespace.  Consider this workflow:

```wdl
import "other.wdl" as ns
workflow wf {
  call ns.ns2.task
}
```

Here, `ns.ns2.task` is a namespace identifier (see the [Call Statement](@/1.0/workflows/call.md) section for more details).  Namespace identifiers, like fully-qualified names are left-associative, which means `ns.ns2.task` is interpreted as `((ns.ns2).task)`, which means `ns.ns2` would have to resolve to a namespace so that `.task` could be applied.  If `ns2` was a task definition within `ns`, then this namespaced identifier would be invalid.
