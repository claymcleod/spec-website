+++
title = "Private Declarations"
description = "Intermediate values within task scope"
weight = 15
+++

A task can have declarations that are intended as intermediate values rather than inputs. These private declarations may appear anywhere in the body of the task, and they must be initialized. Just like input declarations, private declarations may be initialized with literal values, or with expressions that may reference other declarations.

For example, this task takes an input and then performs a calculation, using a private declaration, that can then be referenced in the command template:

Example: private_declaration_task.wdl


```wdl
version 1.3

task private_declaration {
  input {
    Array[String] lines
  }

  Int num_lines = length(lines)
  Int num_lines_clamped = if num_lines > 3 then 3 else num_lines

  command <<<
  head -~{num_lines_clamped} ~{write_lines(lines)}
  >>>

  output {
    Array[String] out_lines = read_lines(stdout())
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "private_declaration.lines": ["A", "B", "C", "D"]
}
```

Example output:

```json
{
  "private_declaration.out_lines": ["A", "B", "C"]
}
```


</details>

The value of a private declaration may *not* be specified by the task caller, nor is it accessible outside of the task [scope](@/1.3/appendices/appendix-b.md).

Example: private_declaration_fail.wdl


```wdl
version 1.3

task test {
  input {
    Int i
  }
  String s = "hello"
  command <<< ... >>>
  output {
    String out = "goodbye"
  }
}

workflow private_declaration_fail {
  call test {
    i = 1,         # this is fine - "i" is in the input section
    s = "goodbye"  # error! "s" is private
  }

  output {
    String out = test.out # this is fine - "out" is in the output section
    String s = test.s # error! "s" is private
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
{}
```

Test config:

```json
{
  "fail": true
}
```


</details>
