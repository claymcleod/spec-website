+++
title = "Static Analysis and Dynamic Evaluation"
description = "How WDL documents are processed: static analysis vs runtime evaluation"
weight = 90
+++

As with any strongly typed programming language, WDL is processed in two distinct phases by the implementation: static analysis and dynamic evaluation.

* Static analysis is the process of parsing the WDL document and performing type inference - that is, making sure the WDL is syntactically correct, and that there is compatibility between the expected and actual types of all declarations, expressions, and calls.
* Dynamic evaluation is the process of evaluating all WDL expressions and calls at runtime, when all of the user-specified inputs are available.

An implementation should raise an error as early as possible when processing a WDL document. For example, in the following task the `sub` function is being called with an `Int` argument rather than a `String`. This function call cannot be evaluated successfully, so the implementation should raise an error during static analysis, rather than waiting until runtime.

```wdl
task bad_sub {
  Int i = 111222333
  String s = sub(i, "2", "4")
}
```

On the other hand, in the following example all of the types are compatible, but if the `hello.txt` file does not exist at runtime (when the implementation instantiates the command and tries to evaluate the call to `read_lines`), then an error will be raised.

```wdl
task missing_file {
  File f = "hello.txt"

  command <<<
  printf "~{sep(","), read_lines(f)}"
  >>>
}
```
