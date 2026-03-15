+++
title = "Task Inputs"
description = "Declaring and managing task input parameters"
weight = 10
+++

A task's `input` section declares its input parameters. The values for declarations within the `input` section may be specified by the caller of the task. An input declaration may be initialized to a default expression to use when the caller does not supply a value. Input declarations with the optional type quantifier `?` also may be omitted by the caller even when there is no default initializer. If an input declaration has neither an optional type nor a default initializer, then it is a required input, meaning the caller must specify a value.

Example: task_inputs_task.wdl


```wdl
version 1.2

task task_inputs {
  input {
    Int i               # a required input parameter
    String s = "hello"  # an input parameter with a default value
    File? f             # an optional input parameter
    Directory? d = "/etc"             # an optional input parameter with a default value
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


</details>

## Task Input Localization

`File` and `Directory` inputs may require localization to the execution environment. For example, a file located on a remote web server that is provided to the execution engine as an `https://` URL must first be downloaded to the machine where the task is being executed.

- `File`s and `Directory`s are localized into the execution environment prior to evaluating any expressions. This means that references to `File` or `Directory` declarations in input declaration expressions, private declaration expressions, and the command section are always replaced with the local paths to those files/directories.
- When multiple input declarations refer to the same canonicalized `File` or `Directory` (i.e., they [compare as equal](@/1.2/types/primitive-types/files-and-directories.md#path-canonicalization-and-validation)), the execution engine should localize the resource once, and all references to those declarations should resolve to the same localized path.
- When localizing a `File` or `Directory`, the engine may choose to place the local resource wherever it likes so long as it adheres to these rules:
  - The original file/directory name (the "basename") must be preserved even if the path to it has changed.
  - Two distinct input files with the same basename must be located separately, to avoid name collision. Note that this refers to two different files (that would not compare as equal), not to multiple input declarations that reference the same underlying file.
  - Two input files that originate from the same "parent" must be localized into the same directory for task execution.
    - For local paths, "parent" means the parent directory.
    - For remote paths specified as a URI, "parent" means the entire URI up to the last '/' of the path (i.e., excluding the final component and any parameters). For example, http://foo.com/bar/a.txt and http://foo.com/bar/b.txt have the same parent (http://foo.com/bar/), so they must be localized into the same directory.
    - For remote paths specified by other means, it is up to the execution engine to determine what is meant by "parent".
  - See the [special case handling for Versioning Filesystems](#special-case-versioning-filesystem) below.
- When a WDL author uses a `File` or `Directory` input in their [Command Section](@/1.2/tasks/command.md), the absolute path to the localized file/directory is substituted when that declaration is referenced.

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

Runtime engines **should** treat input `File`s and `Directory`s as read-only, e.g., by setting their permissions appropriately on the local file system, or by localizing them to a directory marked as read-only.

Note starting in WDL 2.0 engines **must** treat input `File`s and `Directory`s as read-only.

A common pattern for tasks that require multiple input files to be in the same directory is to create a new directory in the execution environment and soft-link the files into that directory.

```wdl
task two_files_one_directory {
  input {
    File bam
    File bai
  }
  String prefix = basename(bam, ".bam")
  command <<<
  mkdir inputs
  ln -s ~{bam} inputs/~{prefix}.bam
  ln -s ~{bai} inputs/~{prefix}.bam.bai
  varcall inputs/~{prefix}.bam
  >>>
}
```

### Special Case: Versioning Filesystem

Two or more versions of a file in a versioning filesystem might have the same name and come from the same directory. In that case, the following special procedure must be used to avoid collision:
  - The first file is always placed according to the rules above.
  - Subsequent files that would otherwise overwrite this file are instead placed in a subdirectory named for the version.

For example, imagine two versions of file `fs://path/to/A.txt` are being localized (labeled version `1.0` and `1.1`). The first might be localized as `/execution_dir/path/to/A.txt`. The second must then be placed in `/execution_dir/path/to/1.1/A.txt`

## Input Type Constraints

Recall that a type may have a quantifier:

* `?` means that the input is optional and a caller does not need to specify a value for the input.
* `+` applies only to `Array` types and it represents a constraint that the `Array` value must contain one-or-more elements.

The following task has several inputs with type quantifiers:

Example: input_type_quantifiers_task.wdl


```wdl
version 1.2

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

  requirements {
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

Inputs with default initializers are implicitly optional: callers may omit the input or supply `None` *whether or not* its declared type carries the optional quantifier `?`. Usually, inputs with defaults should omit the `?` from their type, except when callers need the ability to override the default with `None`.

In detail, if a caller omits an input from the call `input:` section, then the default initializer applies whether or not the input type is declared optional. But if the caller explicitly supplies `None` for the input (either literally or by passing an optional value), then the default initializer applies only if the declared type isn't optional. This table illustrates the value taken by an input `x` depending on what the caller supplies:

| input declaration:     | `Int x = 1` | `Int? x = 1` | `Int? x` | `Int x` |
| ---------------------- | ----------- | ------------ | -------- | ------- |
| call input: `x = 42`   | 42          | 42           | 42       | 42      |
| call input: `x = None` | 1           | `None`       | `None`   | *error* |
| call input: *omitted*  | 1           | 1            | `None`   | *error* |

Example: optional_with_default.wdl


```wdl
version 1.2

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
      name = name
    }
  }

  if (!use_salutation) {
    call say_hello as hello2 {
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
