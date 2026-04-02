+++
title = "Evaluation"
description = "Order of evaluation for workflow declarations"
weight = 20
+++

## Workflow-Level Resolution

In a workflow, resolution works by traversing the scope heirarchy starting from expression that references the variable.

```wdl
workflow wf {
  input {
    String s = "wf_s"
    String t = "t"
  }
  call my_task {
    String s = "my_task_s"
    input: in0 = s+"-suffix", in1 = t+"-suffix"
  }
}
```

In this example, there are two expressions: `s+"-suffix"` and `t+"-suffix"`.  `s` is resolved as `"my_task_s"` and `t` is resolved as `"t"`.
