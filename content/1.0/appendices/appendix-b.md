+++
title = "Appendix B: Namespaces"
description = "How names are resolved across namespaces and scopes"
weight = 20
+++

## Namespaces

Import statements can be used to pull in tasks/workflows from other locations as well as to create namespaces.  In the simplest case, an import statement adds the tasks/workflows that are imported into the specified namespace.  For example:

tasks.wdl
```wdl
task x {
  command { python script.py }
}
task y {
  command { python script2.py }
}
```

workflow.wdl
```wdl
import "tasks.wdl" as pyTasks

workflow wf {
  call pyTasks.x
  call pyTasks.y
}
```

Tasks `x` and `y` are inside the namespace `pyTasks`, which is different from the `wf` namespace belonging to the primary workflow.  However, if no namespace is specified for tasks.wdl:

workflow.wdl
```wdl
import "tasks.wdl"

workflow wf {
  call tasks.x
  call tasks.y
}
```

Now everything inside of `tasks.wdl` must be accessed through the default namespace `tasks`.

Each namespace may contain namespaces, tasks, and at most one workflow.  The names of the contained namespaces, tasks, and workflow need to be unique within that namespace. For example, one cannot import two workflows while they have the same namespace identifier. Additionally, a workflow and a namespace both named `foo` cannot exist inside a common namespace. Similarly there cannot be a task `foo` in a workflow also named `foo`.
However, you can import two workflows with different namespace identifiers that have identically named tasks. For example, you can import namespaces `foo` and `bar`, both of which contain a task `baz`, and you can call `foo.baz` and `bar.baz` from the same primary workflow.

## Scope

Scopes are defined as:

* `workflow {...}` blocks
* `call` blocks
* `while(expr) {...}` blocks
* `if(expr) {...}` blocks
* `scatter(x in y) {...}` blocks

Inside of any scope, variables may be declared.  The variables declared in that scope are visible to any sub-scope, recursively.  For example:

```wdl
task my_task {
  input {
    Int x
    File f
  }
  command {
    my_cmd --integer=${var} ${f}
  }
}

workflow wf {
  input {
    Array[File] files
    Int x = 2
  }
  scatter(file in files) {
    Int x = 3
    call my_task {
      Int x = 4
      input: var=x, f=file
    }
  }
}
```

`my_task` will use `x=4` to set the value for `var` in its command line.  However, `my_task` also needs a value for `x` which is defined at the task level.  Since `my_task` has two inputs (`x` and `var`), and only one of those is set in the `call my_task` declaration, the value for `my_task.x` still needs to be provided by the user when the workflow is run.
