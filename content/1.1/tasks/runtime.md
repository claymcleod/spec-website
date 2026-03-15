+++
title = "Runtime Section"
description = "Specifying runtime environment requirements and hints"
weight = 60
+++

The `runtime` section defines a set of key/value pairs that represent the minimum requirements needed to run a task and the conditions under which a task should be interpreted as a failure or success.

During execution of a task, resource requirements within the `runtime` section must be enforced by the engine. If the engine is not able to provision the requested resources, then the task immediately fails.

There are a set of reserved attributes (described below) that must be supported by the execution engine, and which have well-defined meanings and default values. Default values for all optional standard attributes are directly defined by the WDL specification in order to encourage portability of workflows and tasks; execution engines should NOT provide additional mechanisms to set default values for when no runtime attributes are defined.

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> Additional arbitrary attributes may be specified in the `runtime` section, but these may be ignored by the execution engine. These non-standard attributes are called "hints". The use of hint attributes in the `runtime` section is deprecated; a later version of WDL will introduce a new `hints` section for arbitrary attributes and disallow non-standard attributes in the `runtime` section.

The value of a `runtime` attribute can be any expression that evaluates to the expected type - and in some cases matches the accepted format - for that attribute. Expressions in the `runtime` section may reference (non-output) declarations in the task:

Example: runtime_container_task.wdl


```wdl
version 1.1

task runtime_container {
  input {
    String ubuntu_version
  }

  command <<<
    cat /etc/*-release | grep DISTRIB_CODENAME | cut -f 2 -d '='
  >>>

  output {
    Boolean is_true = ubuntu_version == read_string(stdout())
  }

  runtime {
    container: "ubuntu:~{ubuntu_version}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "runtime_container.ubuntu_version": "focal"
}
```

Example output:

```json
{
  "runtime_container.is_true": true
}
```


</details>

## Units of Storage

Several of the `runtime` attributes (and some [Standard Library](@/1.1/standard-library/_index.md) functions) can accept a string value with an optional unit suffix, using one of the valid [SI or IEC abbreviations](https://en.wikipedia.org/wiki/Binary_prefix). At a minimum, execution engines must support the following suffices in a case-insensitive manner:

* B (bytes)
* Decimal: KB, MB, GB, TB
* Binary: KiB, MiB, GiB, TiB

Optional whitespace is allowed between the number/expression and the suffix. For example: `6.2 GB`, `5MB`, `"~{ram}GiB"`.

The decimal and binary units may be shortened by omitting the trailing "B". For example, "K" and "KB" are both interpreted as "kilobytes".

## Mandatory `runtime` attributes

The following attributes must be supported by the execution engine. The value for each of these attributes must be defined - if it is not specified by the user, then it must be set to the specified default value.

### `container`

* Accepted types:
    * `String`: A single container URI.
    * `Array[String]`: An array of container URIs.
* Alias: `docker`

The `container` key accepts a URI string that describes a location where the execution engine can attempt to retrieve a container image to execute the task.

The user is strongly suggested to specify a `container` for every task. There is no default value for `container`. If `container` is not specified, the execution behavior is determined by the execution engine. Typically, the task is simply executed in the host environment.

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> The ability to omit `container` is deprecated. In WDL 2.0, `container` will be required.

The format of a container URI string is `protocol://location`, where protocol is one of the protocols supported by the execution engine. Execution engines must, at a minimum, support the `docker://` protocol, and if no protocol is specified, it is assumed to be `docker://`. An execution engine should ignore any URI with a protocol it does not support.

Container source locations should use the syntax defined by the individual container repository. For example an image defined as `ubuntu:latest` would conventionally refer a docker image living on `DockerHub`, while an image defined as `quay.io/bitnami/python` would refer to a `quay.io` repository.

The `container` key also accepts an array of URI strings. All of the locations must point to images that are equivalent, i.e. they must always produce the same final results when the task is run with the same inputs. It is the responsibility of the execution engine to define the specific image sources it supports, and to determine which image is the "best" one to use at runtime. The ordering of the array does not imply any implicit preference or ordering of the containers. All images are expected to be the same, and therefore any choice would be equally valid. Defining multiple images enables greater portability across a broad range of execution environments.

Example: test_containers.wdl


```wdl
version 1.1

task single_image_task {
  command <<< printf "hello" >>>

  output {
    String greeting = read_string(stdout())
  }

  runtime {
    container: "ubuntu:latest"
  }
}

task multi_image_task {
  command <<< printf "hello" >>>

  output {
    String greeting = read_string(stdout())
  }

  runtime {
    container: ["ubuntu:latest", "https://gcr.io/standard-images/ubuntu:latest"]
  }
}

workflow test_containers {
  call single_image_task
  call multi_image_task
  output {
    String single_greeting = single_image_task.greeting
    String multi_greeting = multi_image_task.greeting
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
{
  "test_containers.single_greeting": "hello",
  "test_containers.multi_greeting": "hello"
}
```


</details>

The execution engine must cause the task to fail immediately if none of the container URIs can be successfully resolved to a runnable image.

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `docker` is supported as an alias for `container` with the exact same semantics. Exactly one of the `container` or `docker` is required. The `docker` alias will be dropped in WDL 2.0.

### `cpu`

* Accepted types:
    * `Int`
    * `Float`
* Default value: `1`

The `cpu` attribute defines the _minimum_ number of CPU cores required for this task, which must be available prior to instantiating the command. The execution engine must provision at least the requested number of CPU cores, but it may provision more. For example, if the request is `cpu: 0.5` but only discrete values are supported, then the execution engine might choose to provision `1.0` CPU instead.

Example: test_cpu_task.wdl


```wdl
version 1.1

task test_cpu {
  command <<<
  cat /proc/cpuinfo | grep processor | wc -l
  >>>

  output {
    Boolean at_least_two_cpu = read_int(stdout()) >= 2
  }

  runtime {
    container: "ubuntu:latest"
    cpu: 2
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
{
  "test_cpu.at_least_two_cpu": true
}
```

Test config:

```json
{
  "capabilities": ["cpu"]
}
```


</details>

### `memory`

* Accepted types:
    * `Int`: Bytes of RAM.
    * `String`: A decimal value with, optionally with a unit suffix.
* Default value: `2 GiB`

The `memory` attribute defines the _minimum_ memory (RAM) required for this task, which must be available prior to instantiating the command. The execution engine must provision at least the requested amount of memory, but it may provision more. For example, if the request is `1 GB` but only blocks of `4 GB` are available, then the execution engine might choose to provision `4.0 GB` instead.

Example: test_memory_task.wdl


```wdl
version 1.1

task test_memory {
  command <<<
  free --bytes -t | tail -1 | sed -E 's/\s+/\t/g' | cut -f 2
  >>>

  output {
    Boolean at_least_two_gb = read_int(stdout()) >= (2 * 1024 * 1024 * 1024)
  }

  runtime {
    memory: "2 GiB"
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
{
  "test_memory.at_least_two_gb": true
}
```

Test config:

```json
{
  "capabilities": ["memory"]
}
```


</details>

### `gpu`

* Accepted type: `Boolean`
* Default value: `false`

The `gpu` attribute provides a way to accommodate modern workflows that are increasingly becoming reliant on GPU computations. This attribute simply indicates to the execution engine that a task requires a GPU to run to completion. A task with this flag set to `true` is guaranteed to only run if a GPU is a available within the runtime environment. It is the responsibility of the execution engine to check prior to execution whether a GPU is provisionable, and if not, preemptively fail the task.

This attribute *cannot* request any specific quantity or types of GPUs to make available to the task. Any such information should be provided using an execution engine-specific attribute.

Example: test_gpu_task.wdl


```wdl
version 1.1

task test_gpu {
  command <<<
  lspci -nn | grep ' \[03..\]: ' | wc -l
  >>>

  output {
    Boolean at_least_one_gpu = read_int(stdout()) >= 1
  }

  runtime {
    container: "ubuntu:latest"
    gpu: true
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
{
  "test_gpu.at_least_one_gpu": true
}
```

Test config:

```json
{
  "capabilities": ["gpu"],
  "ignore": true
}
```


</details>

### `disks`

* Accepted types:
    * `Int`: Amount disk space to request, in `GiB`.
    * `String`: A disk specification - one of the following:
        * `"<size>"`: Amount disk space to request, in `GiB`.
        * `"<size> <suffix>"`: Amount disk space to request, with the given suffix.
        * `"<mount-point> <size>"`: A mount point and the amount disk space to request, in `GiB`.
        * `"<mount-point> <size> <suffix>"`: A mount point and the amount disk space to request, with the given suffix.
    * `Array[String]` - An array of disk specifications.
* Default value: `1 GiB`

The `disks` attribute provides a way to request one or more persistent volumes of at least a specific size and mounted at a specific location. When the `disks` attribute is provided, the execution engine must guarantee the requested resources are available or immediately fail the task prior to instantiating the command.

This property does not specify exactly what type of persistent volume is being requested (e.g. SSD, HDD), but leaves this up to the engine to decide, based on what hardware is available or on another execution engine-specific attribute.

If a disk specification string is used to specify a mount point, then the mount point must be an absolute path to a location on the host machine. If the mount point is omitted, it is assumed to be a persistent volume mounted at the root of the execution directory within a task.

Example: one_mount_point_task.wdl


```wdl
version 1.1

task one_mount_point {
  command <<<
    findmnt -bno size /mnt/outputs
  >>>

  output {
    Boolean at_least_ten_gb = read_int(stdout()) >= (10 * 1024 * 1024 * 1024)
  }

  runtime {
    disks: "/mnt/outputs 10 GiB"
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
{
  "one_mount_point.at_least_ten_gb": true
}
```

Test config:

```json
{
  "capabilities": ["disks"]
}
```


</details>

If an array of disk specifications is used to specify multiple disk mounts, only one of them is allowed to omit the mount point.

Example: multi_mount_points_task.wdl


```wdl
version 1.1

task multi_mount_points {
  command <<<
    findmnt -bno size /
  >>>

  output {
    Boolean at_least_two_gb = read_int(stdout()) >= (2 * 1024 * 1024 * 1024)
  }

  runtime {
    # The first value will be mounted at the execution root
    disks: ["2", "/mnt/outputs 4 GiB", "/mnt/tmp 1 GiB"]
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
{
  "multi_mount_points.at_least_two_gb": true
}
```

Test config:

```json
{
  "capabilities": ["disks"]
}
```


</details>

### `maxRetries`

* Accepted type: `Int`
* Default value: `0`

The `maxRetries` attribute provides a mechanism for a task to be retried in the event of a failure. If this attribute is defined, the execution engine must retry the task UP TO but not exceeding the number of attempts that it specifies.

The execution engine may choose to define an upper bound (>= 1) on the number of retry attempts that it permits.

A value of `0` means that the task as not retryable, and therefore any failure in the task should never result in a retry by the execution engine, and the final status of the task should remain the same.

```wdl
task maxRetries_test {
  #.....
  runtime {
    maxRetries: 4
  }
}
```

### `returnCodes`

* Accepted types:
    * `"*"`: This special value indicates that ALL returnCodes should be considered a success.
    * `Int`: Only the specified return code should be considered a success.
    * `Array[Int]`: Any of the return codes specified in the array should be considered a success.
* Default value: `0`

The `returnCodes` attribute provides a mechanism to specify the return code, or set of return codes, that indicates a successful execution of a task. The engine must honor the return codes specified within the `runtime` section and set the tasks status appropriately.

Example: single_return_code_task.wdl


```wdl
version 1.1

task single_return_code {
  command <<<
  exit 1
  >>>

  runtime {
    returnCodes: 1
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
  "return_code": 0
}
```


</details>

Example: multi_return_code_fail_task.wdl


```wdl
version 1.1

task multi_return_code {
  command <<<
  exit 42
  >>>

  runtime {
    returnCodes: [1, 2, 5, 10]
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
  "fail": true,
  "return_code": 42
}
```


</details>

Example: all_return_codes_task.wdl


```wdl
version 1.1

task all_return_codes {
  command <<<
  exit 42
  >>>

  runtime {
    returnCodes: "*"
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
  "return_code": 0
}
```


</details>

## Reserved `runtime` hints

The following attributes are considered "hints" rather than requirements. They are optional for execution engines to support. The purpose of reserving these attributes is to encourage interoperability of tasks and workflows between different execution engines.

Note: in a future version of WDL, these attributes will move to a new `hints` section.

Example: test_hints_task.wdl


```wdl
version 1.1

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

  runtime {
    container: "ubuntu:latest"
    maxMemory: "36 GB"
    maxCpu: 24
    shortTask: true
    localizationOptional: false
    inputs: object {
      foo: object {
        localizationOptional: true
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

### `maxCpu`

Specifies the maximum CPU to be provisioned for a task. The value of this hint has the same specification as [`requirements.cpu`](#cpu).

### `maxMemory`

Specifies the maximum memory provisioned for a task. The value of this hint has the same specification as [`requirements.memory`](#memory).

### `shortTask`

* Allowed type: `Boolean`

A `Boolean` value for which `true` indicates that that this task is not expected to take long to execute. The execution engine can interpret this as permission to attempt to optimize the execution of the task - e.g., by batching together multiple `shortTask`s, or by using the cost-optimized instance types that many cloud vendors provide, e.g., `preemptible` instances on `GCP` and `spot` instances on `AWS`. "Short" is a bit ambiguous, but should generally be interpreted as << 24h.

### `localizationOptional`

* Allowed type: `Boolean`

A `Boolean` value, for which `true` indicates that, if possible, any `File` inputs for this task should not be (immediately) localized. For example, a task that processes its input file once in linear fashion could have that input streamed (e.g., using a `fifo`) rather than requiring the input file to be fully localized prior to execution. This directive must not have any impact on the success or failure of a task (i.e., a task must run the same with or without localization).

### `inputs`

* Allowed type: `object`

Provides input-specific hints in the form of an object. Each key within this hint should refer to an actual input defined for the current task. A key may also refer to a specific member of a struct/object input.

Example: input_hint_task.wdl


```wdl
version 1.1

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

  runtime {
    inputs: object {
      person: object {
        cv: object {
          localizationOptional: true
        }
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

* `inputs.<key>.localizationOptional`: Tells the execution engine that a specific `File` input does not need to be localized for this task.

### `outputs`

* Allowed type: `object`

Provides outputs specific hints in the form of a hints object. Each key within this hint should refer to an actual output defined for the current task. A key may also refer to a specific member of a struct/object input.

## Conventions and Best Practices

In order to encourage interoperable workflows, WDL authors and execution engine implementors should view hints strictly as an optimization that can be made for a specific task at runtime; hints should not be interpreted as requirements for that task. By following this principle, we can guarantee that a workflow is runnable on all platforms assuming the `runtime` section has the required parameters, regardless of whether it contains any additional hints.

The following guidelines should be followed when using hints:

* A hint should never be required.
* Less is more. Before adding a new hint key, ask yourself "do I really need another hint?", or "is there a better way to specify the behavior I require". If there is, then adding a hint is likely not the right way to achieve your aims.
* Complexity is killer. By allowing any arbitrary keys, it is possible that the `runtime` section can get quite unruly and complex. This should be discouraged, and instead a pattern of simplicity should be stressed.
* Sharing is caring. People tend to look for similar behavior between different execution engines. It is strongly encouraged that execution engines agree on common names and accepted values for hints that describe common usage patterns. A good example of hints that have conventions attached to them is cloud provider specific details:
    ```wdl
    task foo {
      ....
      runtime {
        gcp: {
        ...
        }
        aws: {
        ...
        }
        azure: {
          ...
        }
        alibaba: {
          ...
        }
      }
    }
    ```
* Use objects to avoid collisions. If there are specific hints that are unlikely to ever be shared between execution engines, it is good practice to encapsulate these within their own execution engine-specific hints object:
    ```wdl
    task foo {
      ....
      runtime {
        cromwell: {
          # cromwell specific
          ...
        }
        miniwdl: {
          # miniwdl specific
          ...
        }
      }
    }
    ```
