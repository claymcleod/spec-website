+++
title = "Executing a WDL Workflow"
description = "How to run WDL workflows using execution engines"
weight = 20
+++

To execute this workflow, a WDL execution engine must be used (sometimes called the "WDL runtime" or "WDL implementation"). Some popular WDL execution engines are listed in the [README](https://github.com/openwdl/wdl#execution-engines).

Along with the WDL file, the user must provide the execution engine with values for the two input parameters. While implementations may provide their own mechanisms for launching workflows, all implementations minimally accept [inputs as JSON format](#), which requires that the input arguments be fully qualified according to the [namespacing rules](#). For example:

| Variable      | Value         |
| ------------- | ------------- |
| hello.pattern | hello.*       |
| hello.infile  | greetings.txt |

Running the `hello` workflow with these inputs would yield the following command line from the call to `hello_task`:

```sh
grep -E 'hello.*' 'greetings.txt'
```
