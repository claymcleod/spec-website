+++
title = "Appendix B: WDL Namespaces and Scopes"
weight = 20
+++

Namespaces and scoping in WDL are somewhat complex topics, and some aspects are counter-intuitive for users coming from backgrounds in other programming languages. This section goes into deeper details on these topics.

## Namespaces

The following WDL namespaces exist:

* [WDL document](@/1.3/introduction/_index.md)
    * The namespace of an [imported](@/1.3/introduction/_index.md) document equals that of the basename of the imported file by default, but may be aliased using the `as <identifier>` syntax.
    * A WDL document may contain a `workflow` and/or `task`s, which are names within the document's namespace.
    * A WDL document may contain `struct`s and `enum`s, which are also names within the document's namespace and usable as types in any declarations. Structs and enums from any imported documents are [copied into the document's namespace](@/1.3/wdl-documents/import-statements.md) and may be aliased using the `alias <source name> as <new name>` syntax.
* A [WDL `task`](@/1.3/tasks/_index.md) is a namespace consisting of:
    * `input`, `output`, and private declarations
    * A [`requirements`](@/1.3/tasks/requirements.md) namespace that contains all the runtime requirements
* A [WDL `workflow`](@/1.3/workflows/_index.md) is a namespace consisting of:
    * `input`, `output`, and private declarations
    * The [`call`s](@/1.3/workflows/call.md) made to tasks and subworkflows within the body of the workflow.
        * A call is itself a namespace that equals the name of the called task or subworkflow by default, but may be aliased using the `as <identifier>` syntax.
        * A call namespace contains the output declarations of the called task or workflow.
    * The body of each nested element (`struct` or `if` statement).
* A [`Struct` instance](@/1.3/types/compound-types/structs.md): is a namespace consisting of the members defined in the struct. This also applies to `Object` instances.

All members of a namespace must be unique within that namespace. For example:

* Two documents cannot be imported while they have the same namespace identifier - at least one of them would need to be aliased.
* A workflow and a namespace both named `foo` cannot exist inside a common namespace.
* There cannot be a call `foo` in a workflow also named `foo`.
 
However, two sub-namespaces imported into the same parent namespace are allowed to contain the same names. For example, two documents with different namespace identifiers `foo` and `bar` can both have a task named `baz`, because the [fully-qualified names](@/1.3/workflows/qualified-names.md) of the two tasks would be different: `foo.baz` and `bar.baz`.

## Scopes

A "scope" is associated with a level of nesting within a namespace. The visibility of WDL document elements is governed by their scope, and by WDL's scoping rules, which are explained in this section.

### Global Scope

A WDL document is the top-level (or "outermost") scope. All elements defined within a document that are not nested inside other elements are in the global scope and accessible from anywhere in the document. The elements that may be in a global scope are:

* A `workflow`
* Any number of `task`s
* Imported namespaces
* All `struct`s and `enum`s defined in the document and in any imported documents

### Task Scope

A task scope consists of all the declarations in the task `input` section and in the body of the task. The `input` section is used only to delineate which declarations are visible outside the task (i.e., they are part of the task's namespace) and which are private to the task. Input declarations may reference private declarations, and vice-versa. Declarations in the task scope may be referenced in expressions anywhere in the task (i.e., `command`, `requirements`, and `output` sections).

The `output` section can be considered a nested scope within the task. Expressions in the output scope may reference declarations in the task scope, but the reverse is not true. This is because declarations in the task scope are evaluated when a task is invoked (i.e., before it's command is evaluated and executed), while declarations in the output scope are only evaluated after execution of the command is completed.

For example, in this task:

```wdl
version 1.3

task my_task {
  input {
    Int x
    File f
  }

  Int y = x + 1

  command <<<
    my_cmd --integer1=~{x} --integer2=~{y} ~{f}
  >>>

  output {
    Int z = read_int(stdout())
    Int z_plus_one = z + 1
  }

  requirements {
    memory: "~{y} GB"
  }
}
```

* `x` and `f` are `input` values that are evaluated when the task is invoked.
* `y` is an private declaration with a dependency on the input `x`.
* The `command` references both `input` and private declarations. However, it would be an error for  the `command` to reference `z`.
* `z` is an `output` declaration.
* `z_plus_one` is also an `output` declaration - it references another output declaration `z`.
* In the `runtime` section, attribute values may be expressions that reference declarations in the task body. The value of `memory` is determined using the value of `y`.

### Workflow Scope

A workflow scope consists of:

* Declarations in the workflow `input` section.
* Private declarations in the body of the workflow.
* Calls in the workflow.
* Declarations and call outputs that are exported from nested scopes within the workflow (i.e., scatters and conditionals).
 
Just like in the task scope, all declarations in the workflow scope can reference each other, and the `output` section is a nested scope that has access to - but cannot be accessed from - the workflow scope.

For example, in this workflow (which calls the `my_task` task from the previous example):

```wdl
workflow my_workflow {
  input {
    File file
    Int x = 2
  }

  call my_task {
    x = x,
    f = file
  }

  output {
    Int z = my_task.z
  }
}
```

* `file` and `x` are `input` declarations that are evaluated when the workflow is invoked.
* The call body provides inputs for the task values `x` and `f`. Note that `x` is used twice in the line `x = x`:
    * First: to name the value in the task being provided. This must reference an input declaration in the namespace of the called task.
    * Second: as part of the input expression. This expression may reference any values in the current workflow scope.
* `z` is an output declaration that depends on the output from the `call` to `my_task`. It is not accessible from elsewhere outside the `output` section.

Workflows can have (potentially nested) scatters and conditionals, each of which has a body that defines a nested scope. A nested scope can have declarations, calls, scatters, and conditionals (which create another level of nested scope). The declarations and calls in a nested scope are visible within that scope and within any sub-scopes, recursively.

Every nested scope implicitly "exports" all of its declarations and call outputs in the following manner:

* A scatter scope exports its declarations and calls with the same names they have inside the scope, but with their types modified, such that the exported types are all `Array[X]`, where `X` is the type of the declaration within the scope.
    * A scatter scope *does not* export its scatter variable. For example, the `x` variable in `scatter (x in array)` is only accessible from within the scatter scope and any nested scopes; it is not accessible outside of the scatter scope.
* A conditional scope exports its declarations and calls with the same names they have inside the scope, but with their types modified, such that the exported types are all `X?`, where `X` is the type of the declaration within the scope.

For example: in this workflow (which scatters over the `my_task` task from the previous examples):

```wdl
workflow my_workflow {
  input {
    File file
    Array[Int] xs = [1, 2, 3]
  }

  scatter (x in xs) {
    call my_task {
      x = x,
      f = file
    }

    Int z = my_task.z
  }

  output {
    Array[Int] zs = z
  }
}
```

* The expression for `Int z = ...` accesses `my_task.z` from within the same scatter.
* The output `zs` references `z` even though it was declared in a sub-section. However, because `z` is declared within a `scatter` body, the type of `zs` is `Array[Int]` outside of that scatter.

The concept of a single name within a workflow having different types depending on where it appears can be confusing at first, and it helps to think of these as two different variables. When the user makes a declaration within a nested scope, they are essentially reserving that name in all of the higher-level scopes so that it cannot be reused.

For example, the following workflow is invalid:

```wdl
workflow invalid {
  Boolean b = true
  
  scatter {
    String x = "hello"
  }
  
  # The scatter exports x to the top-level scope - there is an implicit 
  # declaration `Array[String] x` here that is reserved to hold the 
  # exported value and cannot be used by any other declaration in this scope.
  
  if (b) {
    # error! `x` is already reserved in the top-level scope to hold the exported 
    # value of `x` from the scatter, so we cannot reserve it here
    Float x = 1.0
  }

  # error! `x` is already reserved
  Int x = 5
}
```

### Cyclic References

In addition to following the scoping rules, all references to declarations must be acyclic. In other words, if each declarations in a scope were placed as a node in a graph with directed edges to all of the declarations referenced in its initializer expression, then the WDL would only be valid if there were no cycles in that graph.

For example, this is an example of an invalid workflow due to cyclic references:

```wdl
task mytask {
  input {
    Int inp
  }

  command <<< >>>
  
  output {
    Int out = inp * 2
  }
}

workflow cyclic {
  input {
    Int i = j + 1
  }

  Int j = mytask.out - 2

  call mytask { inp = i }
}
```

Here, `i` references `j` in its initializer expression; `j` references the output of `mytask` in its initializer expression; and the call to `mytask` requires the value of `i`. The graph would be cyclic:

```txt
i -> j -> mytask
^            |
|____________|
```

Since `i` cannot be evaluated until `j` is evaluated, and `j` cannot be evaluated until the call to `mytask` completes, and the call to `mytask` cannot be invoked until the value of `i` is available, trying to execute this workflow would result in a deadlock.

Cycles can be tricky to detect, for example when they occur between declarations in different scopes within a workflow. For example, here is a workflow with one block that references a declaration that originates in another block:

```wdl
workflow my_workflow {
  input {
    Array[Int] as
    Array[Int] bs
  }

  scatter (a in as) {
    Int x_a = a
  }

  scatter (b in bs) {
    Array[Int] x_b = x_a
  }

  output {
    Array[Array[Int]] xs_output = x_b
  }
}
```

* The declaration for `x_b` is able to access the value for `x_a` even though the declaration is in another sub-section of the workflow.
* Because the declaration for `x_b` is outside the `scatter` in which `x_a` was declared, the type is `Array[Int]`

The following change introduces a cyclic dependency between the scatters:

```wdl
workflow my_workflow {
  input {
    Array[Int] as
    Array[Int] bs
  }

  scatter (a in as) {
    Int x_a = a
    Array[Int] y_a = y_b
  }

  scatter (b in bs) {
    Array[Int] x_b = x_a
    Int x_b = b
  }

  output {
    Array[Array[Int]] xs_output = x_b
    Array[Array[Int]] ys_output = y_a
  }
}
```

The dependency graph now has cyclic dependencies between elements in the `scatter (a in as)` and `scatter (b in bs)` bodies, which is not allowed. One way to avoid such cyclic dependencies would be to create two separate `scatter`s over the same input array:

```wdl
workflow my_workflow {
  input {
    Array[Int] as
    Array[Int] bs
  }

  scatter (a in as) {
    Int x_a = a
  }

  scatter (b in bs) {
    Array[Int] x_b = x_a
    Int x_b = b
  }
  
  scatter (a2 in as) {
    Array[Int] y_a = y_b
  }

  output {
    Array[Array[Int]] xs_output = x_b
    Array[Array[Int]] ys_output = y_a
  }
}
```

### Namespaces without Scope

Elements such as structs and task `requirements` sections are namespaces, but they lack scope because their members cannot reference each other. For example, one member of a struct cannot reference another member in that struct, nor can a `requirements` attribute reference another attribute.

## Evaluation Order

A key concept in WDL is: **the order in which statements are evaluated depends on the availability of their dependencies, not on the linear orderering of the statements in the document.**

All values in tasks and workflows *can* be evaluated as soon as - but not before - their expression inputs are available; beyond this, it is up to the execution engine to determine when to evaluate each value.

Remember that, in tasks, the `command` section implicitly depends on all the input and private declarations in the task, and the `output` section implicitly depends on the `command` section. In other words, the `command` section cannot be instantiated until all input and private declarations are evaluated, and the `output` section cannot be evaluated until the command successfully completes execution. This is true even for private declarations that follow the `command` positionally in the file.

A "forward reference" occurs when an expression refers to a declaration that occurs at a later position in the WDL file. Given the above cardinal rule of evaluation order, forward references are allowed, so long as all declarations can ultimately be processed as an acyclic graph.

For example, this is a valid workflow:

```wdl
workflow my_workflow {
  input {
    File file
    Int x = 2
    String s = my_task.out2
  }

  call my_task {
    x = x_modified,
    f = file
  }

  Int x_modified = x

  output {
    Array[String] out = [my_task.out1, s]
  }
}
```

The dependencies are:

```txt
* x_modified -> x
* my_task -> (x_modified, f)
* s -> my_task
* out -> (my_task, s)
```

There are no cycles in this dependency graph; thus, this workflow is valid, although perhaps not as readable as it could be with better organization.
