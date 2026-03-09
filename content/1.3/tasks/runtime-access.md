+++
title = "Runtime Access to Requirements, Hints, and Metadata"
description = "Accessing runtime information within tasks"
weight = 80
+++

The `requirements` and `hints` sections comprise resource requests to the execution engine. But these requests can be [specified or overridden at runtime](@/1.3/input-output/json-input-format.md#specifying-overriding-requirements-and-hints), and the execution engine has some latitude in whether and how it fulfills them. Thus, the workflow developer may wish to know exactly what resources are available at runtime, such as:

* What are the actual resource allocations. For example, a task may request at least `8 GiB` of memory but may be able to use more memory if it is available.
* The task metadata, to avoid duplication. For example, the task may wish to write log messages with the task's name and description without having to duplicate the information in the task's `meta` section.
* The runtime engine may also choose to provide additional information at runtime.

This information is provided by the `task` variable, which is implicitly defined by the execution engine. The type of `task` is a [scoped type](@/1.3/types/hidden-types.md#task-hidden-scoped-type) with the following members:

* `name`: A `String` with the task name.
* `id`: A `String` with the unique ID of the task. The execution engine may choose the format for this ID, but it is suggested to include at least the following information:
    * The task name
    * The task alias, if it differs from the task name
    * The index of the task instance, if it is within a scatter statement
* `container`: A `String?` with the URI of the container in which the task is executing as a `String`, or `None` if the task is being executed in the host environment.
* `cpu`: A `Float` with the allocated number of cpus. Must be greater than `0`.
* `memory`: An `Int` with the allocated memory in bytes. Must be greater than `0`.
* `gpu`: An `Array[String]` with one specification per allocated GPU. The specification is execution engine-specific. If no GPUs were allocated, then the value must be an empty array.
* `fpga`: An `Array[String]` with one specification per allocated FPGA. The specification is execution engine-specific. If no FPGAs were allocated, then the value must be an empty array.
* `disks`: A `Map[String, Int]` with one entry for each disk mount point. The key is the mount point and the value is the initial amount of disk space allocated, in bytes. The execution engine must, at a minimum, provide one entry for each disk mount point requested, but may provide more. The amount of disk space available for a given mount point may increase during the lifetime of the task (e.g., autoscaling volumes provided by some cloud services).
* `max_retries`: An `Int` with the maximum number of retry attempts.
* `attempt`: An `Int` with the current task attempt. The value must be `0` the first time the task is executed, and incremented by `1` each time the task is retried (if any).
* `previous`: A [hidden type](@/1.3/types/hidden-types.md#task-previous-hidden-scoped-type) containing the computed requirements from the previous task attempt. All fields are `None` on the first try.
* `end_time`: An `Int?` whose value is the time by which the task must be completed, as a [Unix time stamp](https://en.wikipedia.org/wiki/Unix_time). A value of `0` means that the execution engine does not impose a time limit. A value of `None` means that the execution engine cannot determine whether the runtime of the task is limited. A positive value is a guarantee that the task will be preempted at the specified time, but is *not* a guarantee that the task won't be preempted earlier.
* `meta`: An `Object` containing a copy of the task's `meta` section, or the empty `Object` if there is no `meta` section or if it is empty.
* `parameter_meta`: An `Object` containing a copy of the task's `parameter_meta` section, or the empty `Object` if there is no `parameter_meta` section or if it is empty.
* `ext`: An `Object` containing execution engine-specific attributes, or the empty `Object` if there aren't any. Members of `ext` should be considered optional. It is recommended to only access a member of `ext` using [string interpolation](@/1.3/expressions/string-interpolation.md) to avoid an error if it is not defined.

If the runtime engine is not able to provide the actual value of a requirement, then it must provide the requested value instead, or the default value if no specific value was requested.

#### Output-Only Task Members

The following members of the `task` variable are only available in the `output` section, after the command has completed execution:

* `return_code`: An `Int` with the value of the `command`'s return code.

<details>
<summary>
Example: test_runtime_info_task.wdl

```wdl
version 1.3

task test_runtime_info {
  meta {
    description: "Task that shows how to use the implicit 'task' declaration"
  }

  command <<<
  echo "Task name: ~{task.name}"
  echo "Task description: ~{task.meta.description}"
  echo "Task container: ~{task.container}"
  echo "Available cpus: ~{task.cpu}"
  echo "Available memory: ~{task.memory / (1024 * 1024 * 1024)} GiB"
  exit 1
  >>>

  output {
    Boolean at_least_two_gb = task.memory >= (2 * 1024 * 1024 * 1024)
    Int? return_code = task.return_code
  }

  requirements {
    container: ["ubuntu:latest", "quay.io/ubuntu:focal"]
    memory: "2 GiB"
    return_codes: [0, 1]
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
  "test_runtime_info.at_least_two_gb": true,
  "test_runtime_info.return_code": 1
}
```

Test config:

```json
{
  "capabilities": ["cpu", "memory"]
}
```
</p>
</details>

Only a limited subset of the `task` variable members (`name`, `id`, `attempt`, `previous`, `meta`, `parameter_meta`, and `ext`) are available in pre-evaluation contexts (`requirements`, `hints`, and the deprecated `runtime` sections). The full set of members, including all computed requirements, are available in post-evaluation contexts (`command` and `output` sections).

<details>
<summary>
Example: test_task_previous.wdl

```wdl
version 1.3

task test_task_previous {
  requirements {
    # Only name, id, attempt, previous, meta, parameter_meta, and ext are available in pre-evaluation
    cpu: task.attempt + 1
    memory: "~{256 * (2 ** task.attempt)} MB"
    container: "ubuntu:latest"
    max_retries: 1
  }

  command <<<
  echo "Attempt: ~{task.attempt}"
  echo "CPU: ~{task.cpu}"
  echo "Memory: ~{task.memory}"
  echo "Previous CPU: ~{select_first([task.previous.cpu, 0])}"
  echo "Previous Memory: ~{select_first([task.previous.memory, 0])}"

  # Fail on first attempt
  if [ ~{task.attempt} -eq 0 ]; then
    exit 1
  fi
  >>>

  output {
    # All task fields are available in output
    Int attempt = task.attempt
    Float cpu = task.cpu
    Int memory = task.memory
    Float? previous_cpu = task.previous.cpu
    Int? previous_memory = task.previous.memory
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
  "test_task_previous.attempt": 1,
  "test_task_previous.cpu": 2.0,
  "test_task_previous.memory": 512000000,
  "test_task_previous.previous_cpu": 1.0,
  "test_task_previous.previous_memory": 256000000
}
```
</p>
</details>

If a task is using the deprecated [`runtime`](@/1.3/tasks/runtime.md) section rather than `requirements` and `hints`, then the runtime values of the reserved `runtime` attributes (i.e., the ones that appear in the `requirements` section) are populated in the `requirements` member.
