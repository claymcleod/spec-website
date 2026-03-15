+++
title = "Declarations"
description = "Variable declarations and scoping rules"
weight = 10
+++

A declaration reserves a name that can be referenced anywhere in the [scope](@/1.1/appendices/appendix-b.md) where it is declared. A declaration has a type, a name, and an optional initialization. Each declaration must be unique within its scope, and may not collide with a [reserved WDL keyword](@/1.1/syntax/_index.md#reserved-keywords) (e.g., `workflow`, or `input`).

A [task](@/1.1/tasks/_index.md) or [workflow](@/1.1/workflows/_index.md) may declare input parameters within its `input` section and output parameters within its `output` section. If a non-optional input declaration does not have an initialization, it is considered a "required" parameter, and its value must be provided by the user before the workflow or task may be run. Declarations may also appear in the body of a task or workflow. All non-input declarations must be initialized.

Example: declarations.wdl


```wdl
version 1.1

workflow declarations {
  input {
    # these "unbound" declarations are only allowed in the input section
    File? x  # optional - defaults to None
    Map[String, String] m  # required
    # this is a "bound" declaration
    String y = "abc"
  }

  Int i = 1 + 2  # Private declarations must be bound

  output {
    Float pi = i + .14  # output declarations must also be bound
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "declarations.m": {"a": "b"}
}
```

Example output:

```json
{
  "declarations.pi": 3.14
}
```


</details>

A declaration may be initialized with an [expression](@/1.1/expressions/_index.md), which includes the ability to refer to elements that are outputs of tasks.

Example: task_outputs.wdl


```wdl
version 1.1

task greet {
  input {
    String name
  }

  command <<<
    printf "Hello ~{name}"
  >>>

  output {
    String greeting = read_string(stdout())
  }
}

task count_lines {
  input {
    Array[String] array
  }

  command <<<
    wc -l < ~{write_lines(array)}
  >>>

  output {
    Int line_count = read_int(stdout())
  }
}

workflow task_outputs {
  call greet as x {
    input: name="John"
  }

  call greet as y {
    input: name="Sarah"
  }

  Array[String] greetings = [x.greeting, y.greeting]
  call count_lines {
    input: array=greetings
  }

  output {
    Int num_greetings = count_lines.line_count
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
  "task_outputs.num_greetings": 2
}
```


</details>

In this example, `greetings` is undefined until both `call greet as x` and `call greet as y` have successfully completed, at which point it is assigned the result of evaluating its expression. If either of the two tasks fail, the workflow would also fail and `greetings` would never be initialized.

It must be possible to organize all of the statements within a scope into a directed acyclic graph (DAG); thus, circular references between declarations are not allowed. The following example would result in an error due to the presence of a circular reference.

Example: circular.wdl


```wdl
version 1.1

workflow circular {
  Int i = j + 1
  Int j = i - 2
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>
