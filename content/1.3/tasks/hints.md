+++
title = "Hints Section"
description = "Providing hints to the execution engine"
weight = 55
+++

The `hints` section is optional and may contain any number of attributes (key/value pairs) that provide hints to the execution engine. A hint provides additional context that the execution engine can use to optimize the execution of the task. The execution engine may also ignore any hint for any reason. A task execution never fails due to the inability of the execution engine to recognize or satisfy a hint.

#### Hints-scoped types

There are three [scoped types](@/1.3/types/hidden-types.md#hints-input-and-output-scoped-types) that must be declared by the execution engine within the `hints` section. These types are intentionally given names that are already reserved keywords so that they don't conflict with any user-defined types.

The `hints` type is similar to `Object` in that it can contain arbitrary key-value pairs. However, the members of a `hints` object must have the same semantics as the `hints` section itself (i.e., any [reserved hints](#reserved-task-hints) must have the same types and allowed values), and the `hints` type cannot be nested (i.e., a member of a `hints` object may not have a `hints` type value). The `hints` type is primarily intended to be used to define the [`inputs`](#inputs), [`outputs`](#outputs), and [compute environment](#compute-environments) attributes.

The `input` and `output` types are similar to Structs whose member names are identical to the names of the enclosing task's input and output variables, respectively, and whose member values are all of type `hints`. However, unlike Structs, the keys of `input` and `output` literals may use dotted notation to refer to nested members of input and output Structs. See [`inputs`](#inputs) and [`outputs`](#outputs) for examples.

#### Reserved Task Hints

The following hints are reserved. An implementation is not required to support these attributes, but if it does support a reserved attribute it must enforce the semantics and allowed values defined below. The purpose of reserving these hints is to encourage interoperability of tasks and workflows between different execution engines.

Example: test_hints_task.wdl


```wdl
version 1.3

task test_hints {
  input {
    File foo
  }

  command <<<
  wc -l < ~{foo}
  >>>

  output {
    Int num_lines = read_int(stdout())
  }

  requirements {
    container: "ubuntu:latest"
  }

  hints {
    max_memory: "36 GB"
    max_cpu: 24
    short_task: true
    localization_optional: false
    inputs: input {
      foo: hints {
        localization_optional: true
      }
    }
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "test_hints.foo": "data/greetings.txt"
}
```

Example output:

```json
{
  "test_hints.num_lines": 3
}
```


</details>

##### `max_cpu`

* Accepted types:
    * `Int`
    * `Float`
* Alias: `maxCpu`

A hint to the execution engine that the task expects to use no more than the specified number of CPUs. The value of this hint has the same specification as [`requirements.cpu`](@/1.3/tasks/requirements.md#cpu).

##### `max_memory`

* Accepted types:
    * `Int`: Bytes of RAM.
    * `String`: A decimal value with, optionally with a unit suffix.
* Alias: `maxMemory`

A hint to the execution engine that the task expects to use no more than the specified amount of memory. The value of this hint has the same specification as [`requirements.memory`](@/1.3/tasks/requirements.md#memory).

##### `disks`

* Accepted types:
    * `String`: Disk specification.
    * `Map[String, String]`: Map of mount point to disk specification.

A hint to the execution engine to mount [disks](@/1.3/tasks/requirements.md#disks) with specific attributes. The value of this hint can be a `String` with a specification that applies to all mount points, or a `Map` with the key being the mount point and the value being a `String` with the specification for that mount point.

Volume specifications are left intentionally vague as they are primarily intented to be used in the context of a specific [compute environment](#compute-environments). The values "HDD" and "SSD" should be recognized to indicate that a specific class of hardware is being requested.

##### `gpu` and `fpga`

* Accepted types:
    * `Int`: Minimum number of accelerators being requested.
    * `String`: Specification for accelerator(s) being requested, e.g., manufacturer or model name.

A hint to the execution engine to provision [hardware accelerators](@/1.3/tasks/requirements.md#hardware-accelerators-gpu-and-fpga) with specific attributes. Accelerator specifications are left intentionally vague as they are primarily intended to be used in the context of a specific [compute environment](#compute-environments).

##### `short_task`

* Accepted types: `Boolean`
* Default value: `false`

A hint to the execution engine about the expected duration of this task. The value of this hint is a `Boolean` for which `true` indicates that that this task is not expected to take long to execute, which the execution engine can interpret as permission to optimize the execution of the task.

For example, the engine may batch together multiple `short_task`s, or it may use the cost-optimized instance types that many cloud vendors provide, e.g., `preemptible` instances on `GCP` and `spot` instances on `AWS`.

##### `localization_optional`

* Accepted types: `Boolean`
* Default value: `false`
* Alias: `localizationOptional`

A hint to the execution engine about whether the `File` inputs for this task need to be localized prior to executing the task. The value of this hint is a `Boolean` for which `true` indicates that the contents of the `File` inputs may be streamed on demand.

For example, a task that processes its input file once in linear fashion could have that input streamed (e.g., using a `fifo`) rather than requiring the input file to be fully localized prior to execution.

##### `inputs`

* Accepted types: [`input`](#hints-scoped-types)

Provides input-specific hints. Each key must refer to a parameter defined in the task's [`input`](@/1.3/tasks/inputs.md) section. A key may also used dotted notation to refer to a specific member of a struct input.

Example: input_hint_task.wdl


```wdl
version 1.3

struct Person {
  String name
  File? cv
}

task input_hint {
  input {
    Person person
  }

  command <<<
  if ~{defined(person.cv)}; then
    grep "WDL" ~{person.cv}
  fi
  >>>

  output {
    Array[String] experience = read_lines(stdout())
  }

  hints {
    inputs: input {
      person.name: hints {
        min_length: 3
      },
      person.cv: hints {
        localization_optional: true
      }
    }
    outputs: output {
      experience: hints {
        max_length: 5
      }
    }
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "input_hint.person": {
    "name": "Joe"
  }
}
```

Example output:

```json
{
  "input_hint.experience": []
}
```


</details>

Reserved input-specific attributes:

* `inputs.<key>.localization_optional`: Indicates that a specific `File` input does not need to be localized prior to executing this task. This attribute has the same semantics as the task-level [localization_optional](#localization-optional) hint.

##### `outputs`

* Accepted types: `output`

Provides output-specific hints. Each key must refer to a parameter defined in the task's [`output`](@/1.3/tasks/outputs.md) section. A key may also use dotted notation to refer to a specific member of a struct output.

#### Compute Environments

The `hints` section should be used to provide hints that are specific to different compute environments such as HPC systems or cloud platforms. Attributes for a compute environment should be specified in a `hints` value, in which any of the [reserved hints](#reserved-task-hints) are allowed to override the values specified at the task level (if any), and other attributes are platform-specific.

```wdl
task foo {
  ...

  requirements {
    gpu: true
  }

  hints {
    aws: hints {
      instance_type: "p5.48xlarge"
    }
    gcp: hints {
      gpu: 2
    }
    azure: hints {
      ...
    }
    alibaba: hints {
      ...
    }
  }
}
```

#### Conventions and Best Practices

To encourage interoperable workflows, WDL authors and execution engine implementors should view hints strictly as runtime optimizations. Hints must not be interpreted as requirements. Following this principle will ensure that a workflow is runnable on all platforms (assuming the `requirements` section has the required attributes) regardless of whether it contains any additional hints.

Please observe the following guidelines when using hints:

* A hint must never be required for successful task execution.
* Before adding a new hint, ask yourself "do I really need another hint, or is there a better way to specify the behavior I require?".
* Avoid unnecessary complexity. By allowing any arbitrary keys and compound values, it is possible for the `hints` section to become quite complex. Use the simplest value possible to achieve the desired outcome.
* Sharing is caring. Users tend to look for similar behavior between different execution engines. It is strongly encouraged that implementers of execution engines agree on common names and accepted values for hints that describe common usage patterns. [Compute environments](#compute-environments) are a good example of hints that have conventions attached to them.
