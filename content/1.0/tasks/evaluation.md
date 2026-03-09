+++
title = "Evaluation"
weight = 50
+++

## Task-Level Resolution

Inside a task, resolution is trivial: The variable referenced MUST be a declaration of the task. For example:

```wdl
task my_task {
  input {
    Array[String] strings
  }
  command {
    python analyze.py --strings-file=${write_lines(strings)}
  }
}
```

Inside of this task, there exists only one expression: `write_lines(strings)`. In here, when the expression evaluator tries to resolve `strings`, which must be a declaration of the task (in this case it is).
