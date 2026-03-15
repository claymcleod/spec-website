+++
title = "Task Inputs"
description = "Declaring and managing task input parameters"
weight = 10
+++

A task's `input` section declares its input parameters. The values for declarations within the `input` section may be specified by the caller of the task. An input declaration may be initialized to a default expression that will be used when the caller does not specify a value. Input declarations may also be optional, in which case a value may be specified but is not required. If an input declaration is not optional and does not have an initialization, then it is a required input, meaning the caller must specify a value.

Example: task_inputs_task.wdl


```wdl
version 1.1

task task_inputs {
  input {
    Int i               # a required input parameter
    String s = "hello"  # an input parameter with a default value
    File? f             # an optional input parameter
  }

  command <<<
  for i in 1..~{i}; do
    printf "~{s}\n"
  done
  if ~{defined(f)}; then
    cat ~{f}
  fi
  >>>
}
```


<details>
<summary></summary>


Example input:

```json
{
  "task_inputs.i": 1
}
```

Example output:

```json
{}
```


</details>

## Task Input Localization

`File` inputs may require localization to the execution environment. For example, a file located on a remote web server that is provided to the execution engine as an `https://` URL must first be downloaded to the machine where the task is being executed.

- Files are localized into the execution environment prior to the task execution commencing.
- When localizing a `File`, the engine may choose to place the file wherever it likes so long as it adheres to these rules:
  - The original file name must be preserved even if the path to it has changed.
  - Two input files with the same name must be located separately, to avoid name collision.
  - Two input files that have the same parent location must be localized into the same directory for task execution. For example, `http://foo.com/bar/a.txt` and `http://foo.com/bar/b.txt` have the same parent (`http://foo.com/bar/`), so they must be localized into the same directory. See below for special-case handling for Versioning Filesystems.
- When a WDL author uses a `File` input in their [Command Section](@/1.1/tasks/command.md), the fully qualified, localized path to the file is substituted when the command is instantiated.

The above rules do *not* guarantee that two files will be localized to the same directory *unless* they originate from the same parent location. If you are writing a task for a tool that assumes two files will be co-located, then it is safest to manually co-locate them prior to running the tool. For example, the following task runs a variant caller (`varcall`) on a BAM file and expects the BAM's index file (`.bai` extension) to be in the same directory as the BAM file.

```wdl
task call_variants_safe {
  input {
    File bam
    File bai
  }

  String prefix = basename(bam, ".bam")

  command <<<
  mkdir workdir
  ln -s ~{bam} workdir/~{prefix}.bam
  ln -s ~{bai} workdir/~{prefix}.bam.bai
  varcall --bam workdir/~{prefix}.bam > ~{prefix}.vcf
  >>>

  output {
    File vcf = "~{prefix}.vcf"
  }
}
```

### Special Case: Versioning Filesystem

Two or more versions of a file in a versioning filesystem might have the same name and come from the same directory. In that case, the following special procedure must be used to avoid collision:
  - The first file is always placed according to the rules above.
  - Subsequent files that would otherwise overwrite this file are instead placed in a subdirectory named for the version.

For example, imagine two versions of file `fs://path/to/A.txt` are being localized (labeled version `1.0` and `1.1`). The first might be localized as `/execution_dir/path/to/A.txt`. The second must then be placed in `/execution_dir/path/to/1.1/A.txt`

## Input Type Constraints

Recall that a type may have a quantifier:
* `?` means that the parameter is optional. A user does not need to specify a value for the parameter in order to satisfy all the inputs to the workflow.
* `+` applies only to `Array` types and it represents a constraint that the `Array` value must contain one-or-more elements.

The following task has several inputs with type quantifiers:

Example: input_type_quantifiers_task.wdl


```wdl
version 1.1

task input_type_quantifiers {
  input {
    Array[String]  a
    Array[String]+ b
    Array[String]? c
    # If the next line were uncommented it would cause an error
    # + only applies to Array, not File
    #File+ d
    # An optional array that, if defined, must contain at least one element
    Array[String]+? e
  }

  command <<<
    cat ~{write_lines(a)} >> result
    cat ~{write_lines(b)} >> result
    ~{if defined(c) then
    "cat ~{write_lines(select_first([c]))} >> result"
    else ""}
    ~{if defined(e) then
    "cat ~{write_lines(select_first([e]))} >> result"
    else ""}
  >>>

  output {
    Array[String] lines = read_lines("result")
  }

  runtime {
    container: "ubuntu:latest"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "input_type_quantifiers.a": [],
  "input_type_quantifiers.b": ["A", "B"],
  "input_type_quantifiers.e": ["C"]
}
```

Example output:

```json
{
  "input_type_quantifiers.lines": ["A", "B", "C"]
}
```


</details>

If these input values are provided:

| input | value           |
| ----- | --------------- |
| `a`   | ["1", "2", "3"] |
| `b`   | []              |

the task will fail with an error, because `test.b` is required to have at least one element.

On the other hand, if these input values are provided:

| var | value           |
| --- | --------------- |
| `a` | ["1", "2", "3"] |
| `b` | ["x"]           |

the task will run successfully (`c` and `d` are not required). Given these values, the command would be instantiated as:

```txt
cat /tmp/file1 >> result
cat /tmp/file2 >> result
```

If the inputs were:

| var | value                |
| --- | -------------------- |
| `a` | ["1", "2", "3"]      |
| `b` | ["x", "y"]           |
| `c` | ["a", "b", "c", "d"] |

then the command would be instantiated as:

```txt
cat /tmp/file1 >> result
cat /tmp/file2 >> result
cat /tmp/file3 >> result
```

### Optional inputs with defaults

It *is* possible to provide a default to an optional input type. This may be desirable in the case where you want to have a defined value by default, but you want the caller to be able to override the default and set the value to undefined (`None`).

Example: optional_with_default.wdl


```wdl
version 1.1

task say_hello {
  input {
    String name
    String? salutation = "hello"
  }

  command <<< >>>

  output {
    String greeting = if defined(salutation) then "~{salutation} ~{name}" else name
  }
}

workflow optional_with_default {
  input {
    String name
    Boolean use_salutation
  }

  if (use_salutation) {
    call say_hello as hello1 {
      input: name = name
    }
  }

  if (!use_salutation) {
    call say_hello as hello2 {
      input:
        name = name,
        salutation = None
    }
  }

  output {
    String greeting = select_first([hello1.greeting, hello2.greeting])
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "optional_with_default.name": "John",
  "optional_with_default.use_salutation": false
}
```

Example output:

```json
{
  "optional_with_default.greeting": "John"
}
```


</details>
