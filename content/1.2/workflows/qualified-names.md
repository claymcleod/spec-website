+++
title = "Fully Qualified Names & Namespaced Identifiers"
description = "Naming and scoping in workflows"
weight = 30
+++

A fully qualified name is the unique identifier of any particular call, input, or output, and has the following structure:

* For `call`s: `<parent namespace>.<call alias>`
* For inputs and outputs: `<parent namespace>.<input or output name>`
* For `Struct`s and `Object`s: `<parent namespace>.<member name>`

A [namespace](@/1.2/appendices/appendix-b.md) is a set of names, such that every name is unique within the namespace (but the same name could be used in two different namespaces). The `parent namespace` is the fully qualified name of the workflow containing the call, the workflow or task containing the input or output declaration, or the `Struct` or `Object` declaration containing the member. For the top-level workflow this is equal to the workflow name.

For example: `ns.ns2.mytask` is a fully-qualified name - `ns.ns2` is the parent namespace, and `mytask` is the task name being referred to within that namespace. Fully-qualified names are left-associative, meaning `ns.ns2.mytask` is interpreted as `((ns.ns2).mytask)`, meaning `ns.ns2` has to resolve to a namespace so that `.mytask` can be applied.

When a [call statement](@/1.2/workflows/call.md) needs to refer to a task or workflow in another namespace, then it must use the fully-qualified name of that task or workflow. When an [expression](@/1.2/types/_index.md) needs to refer to a declaration in another namespace, it must use a *namespaced identifier*, which is an identifier consisting of a fully-qualified name.

<details>
<summary>
Example: call_imported.wdl

```wdl
version 1.2

import "input_ref_call.wdl" as ns1

workflow call_imported {
  input {
    Int x
    Int y = d1.out
  }

  call ns1.double as d1 { int_in = x }
  call ns1.double as d2 { int_in = y }

  output {
    Int result = d2.out
  }
}
```
</summary>
<p>
Example input:

```json
{
  "call_imported.x": 5
}
```

Example output:

```json
{
  "call_imported.result": 20
}
```
</p>
</details>

The workflow in the above example imports the WDL file from the previous section using an alias. The import creates the namespace `ns1`, and the workflow calls a task in the imported namespace using its fully qualified name, `ns1.double`. Each call is aliased, and the alias is used to refer to the output of the task, e.g., `d1.out` (see the [Call Statement](@/1.2/workflows/call.md) section for details on call aliasing).

In the following more extensive example, all of the fully-qualified names that exist within the top-level workflow are listed exhaustively.

<details>
<summary>
Example: main.wdl

```wdl
version 1.2

import "other.wdl" as other_wf

task echo {
  input {
    String msg = "hello"
  }
  
  command <<<
  printf '~{msg}\n'
  >>>
  
  output {
    File results = stdout()
  }
  
  requirements {
    container: "ubuntu:latest"
  }
}

workflow main {
  Array[String] arr = ["a", "b", "c"]

  call echo
  call echo as echo2
  call other_wf.foobar { infile = echo2.results }
  call other_wf.other { b = true, f = echo2.results }
  call other_wf.other as other2 { b = false }
  
  scatter(x in arr) {
    call echo as scattered_echo {
      msg = x
    }
    String scattered_echo_results = read_string(scattered_echo.results)
  }

  output {
    String echo_results = read_string(echo.results)
    Int foobar_results = foobar.results
    Array[String] echo_array = scattered_echo_results
  }
}
```
</summary>
<p>
Example input:

```json
{}
```

Example output:

```json
{
  "main.echo_results": "hello",
  "main.foobar_results": 1,
  "main.echo_array": ["a", "b", "c"]
}
```
</p>
</details>

<details>
<summary>
Example: other.wdl

```wdl
version 1.2

task foobar {
  input {
    File infile
  }

  command <<<
  wc -l < ~{infile}
  >>>

  output {
    Int results = read_int(stdout())
  }

  requirements {
    container: "ubuntu:latest"
  }
}

workflow other {
  input {
    Boolean b = false
    File? f
  }

  if (b && defined(f)) {
    call foobar { infile = select_first([f]) }
  }

  output {
    Int? results = foobar.results
  }
}
```
</summary>
<p>
Example input:

```json
{
  "other.b": true,
  "other.f": "data/greetings.txt"
}
```

Example output:

```json
{
  "other.results": 3
}
```
</p>
</details>

The following fully-qualified names exist when calling `workflow main` in `main.wdl`:

| Fully-qualified Name          | References                                                                                  | Accessible                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `other_wf`                    | Namespace created by importing `other.wdl` and aliasing it                                  | Anywhere in `main.wdl`                                          |
| `main`                        | Top-level workflow                                                                          | By the caller of `main`                                         |
| `main.arr`                    | `Array[String]` declaration on the workflow                                                 | Anywhere within `main`                                          |
| `main.echo`                   | First call to task `echo`                                                                   | Anywhere within `main`                                          |
| `main.echo2`                  | Second call to task `echo` (aliased as `echo2`)                                             | Anywhere within `main`                                          |
| `main.echo.msg`               | `String` input of first call to task `echo`                                                 | No*                                                             |
| `main.echo.results`           | `File` output of first call to task `echo`                                                  | Anywhere within `main`                                          |
| `main.echo2.msg`              | `String` input of second call to task `echo`                                                | No*                                                             |
| `main.echo2.results`          | `File` output of second call to task `echo`                                                 | Anywhere within `main`                                          |
| `main.foobar.infile`          | `File` input of the call to `other_wf.foobar`                                               | No*                                                             |
| `main.foobar.results`         | `Int` output of the call to `other_wf.foobar`                                               | Anywhere within `main`                                          |
| `main.other`                  | First call to subworkflow `other_wf.other`                                                  | Anywhere within `main`                                          |
| `main.other.b`                | `Boolean` input of the first call to subworkflow `other_wf.other`                           | No*                                                             |
| `main.other.f`                | `File` input of the first call to subworkflow `other_wf.other`                              | No*                                                             |
| `main.other.foobar.infile`    | `File` input of the call to `foobar` inside the first call to subworkflow `other_wf.other`  | No*                                                             |
| `main.other.foobar.results`   | `Int` output of the call to `foobar` inside the first call to subworkflow `other_wf.other`  | No                                                              |
| `main.other.results`          | `Int?` output of the first call to subworkflow `other_wf.other`                             | Anywhere within `main`                                          |
| `main.other2`                 | Second call to subworkflow `other_wf.other` (aliased as other2)                             | Anywhere within `main`                                          |
| `main.other2.b`               | `Boolean` input of the second call to subworkflow `other_wf.other`                          | No*                                                             |
| `main.other2.f`               | `File input of the second call to subworkflow `other_wf.other`                              | No*                                                             |
| `main.other2.foobar.infile`   | `File` input of the call to `foobar` inside the second call to subworkflow `other_wf.other` | No*                                                             |
| `main.other2.foobar.results`  | `Int` output of the call to `foobar` inside the second call to subworkflow `other_wf.other` | No                                                              |
| `scattered_echo`              | Call to `echo` within scatter of `main`                                                     | Within the scatter                                              |
| `scattered_echo.results`      | `File` results of call to scattered_echo`                                                   | Within the scatter                                              |
| `main.scattered_echo.msg`     | Array of `String` inputs to calls to `scattered_echo`                                       | No*                                                             |
| `main.scattered_echo.results` | Array of `File` results of calls to `echo` within the scatter                               | Anywhere within `main`                                          |
| `scattered_echo_results`      | `String` contents of `File` created by call to `scattered_echo`                             | Within the scatter                                              |
| `main.scattered_echo_results` | Array of `String` contents of `File` results of calls to `echo` within the scatter          | Anywhere within `main`                                          |
| `main.echo_results`           | `String` contents of `File` result from call to `echo`                                      | Anywhere in `main`'s output section and by the caller of `main` |
| `main.foobar_results`         | `Int` result from call to `foobar`                                                          | Anywhere in `main`'s output section and by the caller of `main` |
| `main.echo_array`             | Array of `String` contents of `File` results from calls to `echo` in the scatter            | Anywhere in `main`'s output section and by the caller of `main` |

\* Task inputs are accessible to be set by the caller of `main` if the workflow is called with [`allow_nested_inputs: true`](@/1.2/workflows/hints.md#allow-nested-inputs) in its `hints` section.

