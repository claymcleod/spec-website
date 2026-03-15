+++
title = "Requirements Section"
description = "Specifying minimum runtime environment conditions"
weight = 70
+++

The `requirements` section defines a set of key/value pairs that represent the minimum requirements needed to run a task and the conditions under which a task should be interpreted as a failure or success. The `requirements` section is limited to the attributes defined in this specification. Arbitrary key/value pairs are not allowed in the `requirements` section, and must instead be placed in the [`hints`](@/1.2/tasks/hints.md) section.

During execution of a task, all resource requirements within the `requirements` section must be enforced by the engine. If the engine is not able to provision the requested resources, then the task immediately fails. 

All attributes of the `requirements` section have well-defined meanings and default values. Default values for the optional attributes are directly defined by the WDL specification to encourage portability of workflows and tasks; execution engines should not provide additional mechanisms to set default values for when no requirements are defined.

The value of a `requirements` attribute may be any expression that evaluates to the expected type - and, in some cases, matches the accepted format - for that attribute. Expressions in the `requirements` section may reference input and private declarations.

Example: dynamic_container_task.wdl


```wdl
version 1.2

task dynamic_container {
  input {
    String ubuntu_version = "latest"
  }

  command <<<
    cat /etc/*-release | grep DISTRIB_CODENAME | cut -f 2 -d '='
  >>>
  
  output {
    Boolean is_true = ubuntu_version == read_string(stdout())
  }

  requirements {
    container: "ubuntu:~{ubuntu_version}"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "dynamic_container.ubuntu_version": "focal"
}
```

Example output:

```json
{
  "dynamic_container.is_true": true
}
```


</details>

#### Units of Storage

Several of the `requirements` attributes (and some [Standard Library](@/1.2/standard-library/_index.md) functions) accept a string value with an optional unit suffix, using one of the valid [SI or IEC abbreviations](https://en.wikipedia.org/wiki/Binary_prefix). At a minimum, execution engines must support the following suffices in a case-insensitive manner:

* B (bytes)
* Decimal: KB, MB, GB, TB
* Binary: KiB, MiB, GiB, TiB

Optional whitespace is allowed between the number/expression and the suffix. For example: `6.2 GB`, `5MB`, `"~{ram}GiB"`.

The decimal and binary units may be shortened by omitting the trailing "B". For example, "K" and "KB" are both interpreted as "kilobytes".

#### Requirements attributes

The following attributes must be supported by the execution engine. The value for each of these attributes must be defined - if it is not specified by the user, then it must be set to the specified default value.

##### `container`

* Accepted types:
    * `"*"`: This special value indicates that the runtime engine may use any POSIX-compliant operating environment it wishes to execute the task, whether that be a container or directly in the host environment.
    * `String`: A single container URI.
    * `Array[String]`: An array of container URIs.
* Default value: `"*"`
* Alias: `docker`

The `container` attribute accepts a URI string that describes a container resource the execution engine can use when executing the task.

It is strongly suggested to specify a `container` for every task. If `container` is not specified, or is specified with the special `"*"` value, the execution behavior is determined by the execution engine. A task that depends on the engine to determine the execution environment should be careful to only use built-in Bash operations and tools specified as mandatory by the [POSIX standard](https://unix.stackexchange.com/questions/228888/what-are-the-posix-mandatory-utilities).

The format of a container URI is `protocol://location`, where `protocol` is one of the protocols supported by the execution engine. Execution engines must, at a minimum, support the `docker` protocol. If only `location` is specified, the protocol is assumed to be `docker`. An execution engine should ignore any URI with a protocol it does not support.

A container location uses the syntax defined by the container repository. For example, the URI `ubuntu:latest` refers to a Docker image hosted on `DockerHub`, while the URI `quay.io/bitnami/python` refers to an image in a `quay.io` repository. To promote reproducibility, it is recommended to use the most specific possible URI to refer to a container; e.g. for Docker, using the [digest](https://docs.docker.com/engine/reference/commandline/image_ls/#digests) or a specific version tag rather than `latest`.

The `container` attribute also accepts an unordered array of URI strings. All the URIs must resolve to containers that are equivalent. In other words, when given the same inputs the task should produce the same outputs regardless of which of the containers is used to execute the task. It is the responsibility of the execution engine to specify the container protocols and locations it supports, and to determine which container is the "best" one to use at runtime. Defining multiple images enables greater portability across a broad range of execution environments.

If the value is a `String` or `Array[String]` and none of the specified containers can be sucessfully resolved by the exeution engine, the task fails with an error.

Example: test_containers.wdl


```wdl
version 1.2

task single_image_task {
  command <<< printf "hello" >>>

  output {
    String greeting = read_string(stdout())
  }

  requirements {
    container: "ubuntu:latest"
  }
}

task multi_image_task {
  command <<< printf "hello" >>>

  output {
    String greeting = read_string(stdout())
  }

  requirements {
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

The execution engine must cause the task to fail immediately if it is not able to resolve at least one of the URIs to a runnable container.

🗑 `docker` is supported as an alias for `container` with the exact same semantics. Exactly one of the `container` or `docker` attributes is required. The `docker` alias is deprecated and will be removed in WDL 2.0.

##### `cpu`

* Accepted types:
    * `Int`
    * `Float`
* Default value: `1`

The `cpu` attribute defines the _minimum_ number of CPU cores required for this task, which must be available prior to instantiating the command. The execution engine must provision at least the requested number of CPU cores, but it may provision more. For example, if the request is `cpu: 0.5` but only discrete values are supported, then the execution engine might choose to provision `1.0` CPU instead.

Example: test_cpu_task.wdl


```wdl
version 1.2

task test_cpu {
  command <<<
  cat /proc/cpuinfo | grep processor | wc -l
  >>>

  output {
    Boolean at_least_two_cpu = read_int(stdout()) >= 2
  }

  requirements {
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

##### `memory`

* Accepted types:
    * `Int`: Bytes of RAM.
    * `String`: A decimal value with, optionally with a unit suffix.
* Default value: `2 GiB`

The `memory` attribute defines the _minimum_ memory (RAM) required for this task, which must be available prior to instantiating the command. The execution engine must provision at least the requested amount of memory, but it may provision more. For example, if the request is `1 GB` but only blocks of `4 GB` are available, then the execution engine might choose to provision `4.0 GB` instead.

Example: test_memory_task.wdl


```wdl
version 1.2

task test_memory {
  command <<<
  free --bytes -t | tail -1 | sed -E 's/\s+/\t/g' | cut -f 2
  >>>

  output {
    Boolean at_least_two_gb = read_int(stdout()) >= (2 * 1024 * 1024 * 1024)
  }

  requirements {
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

##### Hardware Accelerators (`gpu` and ✨ `fpga`)

* Accepted type: `Boolean`
* Default value: `false`

The `gpu` and `fpga` attributes indicate to the execution engine whether a task requires a GPU and/or FPGA accelerator to run to completion. The execution engine must guarantee that at least one of each of the request types of accelerators is available or immediately fail the task prior to instantiating the command.

The [`gpu` and `fpga` hints](@/1.2/tasks/hints.md#sparkles-gpu-and-sparkles-fpga) can be used to request specific attributes for the provisioned accelerators (e.g., quantity, model, driver version).

Example: test_gpu_task.wdl


```wdl
version 1.2

task test_gpu {
  command <<<
  lspci -nn | grep ' \[03..\]: ' | wc -l
  >>>

  output {
    Boolean at_least_one_gpu = read_int(stdout()) >= 1
  }
  
  requirements {
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

##### `disks`

* Accepted types:
    * `Int`: Amount disk space to request, in `GiB`.
    * `String`: A disk specification - one of the following:
        * `"<size>"`: Amount of disk space to request, in `GiB`.
        * `"<size> <units>"`: Amount of disk space to request, in the given units.
        * `"<mount-point> <size>"`: A mount point and the amount of disk space to request, in `GiB`.
        * `"<mount-point> <size> <units>"`: A mount point and the amount of disk space to request, in the given units.
    * `Array[String]` - An array of disk specifications.
* Default value: `1 GiB`

The `disks` attribute provides a way to request one or more persistent volumes, each of which has a minimum size and is mounted at a specific location with both read and write permissions. When the `disks` attribute is provided, the execution engine must guarantee the requested resources are available or immediately fail the task prior to instantiating the command.

If the mount point is omitted, it is assumed to be a persistent volume mounted at the root of the execution directory within a task.

If a mount point is specified, then it must be an absolute path to a location in the execution environment (i.e., within the container). The specified path either must not already exist in the execution environment, or it must be empty and have at least the requested amount of space available. The mount point should be assumed to be ephemeral, i.e., it will be deleted after the task completes.

The execution engine is free to provision any class(es) of persistent volume it has available (e.g., SSD or HDD). The [`disks` hint](@/1.2/tasks/hints.md#sparkles-disks) hint can be used to request specific attributes for the provisioned disks.

Example: one_mount_point_task.wdl


```wdl
version 1.2

task one_mount_point {
  command <<<
    findmnt -bno size /mnt/outputs
  >>>
  
  output {
    Boolean at_least_ten_gb = read_int(stdout()) >= (10 * 1024 * 1024 * 1024)
  }

  requirements {
    disks: "/mnt/outputs 10 GiB"
    container: "ubuntu"
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
version 1.2

task multi_mount_points {
  command <<<
    findmnt -bno size /
  >>>
  
  output {
    Boolean at_least_two_gb = read_int(stdout()) >= (2 * 1024 * 1024 * 1024)
  }

  requirements {
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

##### `max_retries`

* Accepted type: `Int`
* Default value: `0`
* Alias: `maxRetries`

The `max_retries` attribute specifies the maximum number of times a task should be retried in the event of failure. The execution engine must retry the task at least once and up to (but not exceeding) the specified number of attempts.

The execution engine may choose to define an upper bound (>= 1) on the number of retry attempts that it permits.

A value of `0` means that the task as not retryable, and therefore any failure in the task should never result in a retry by the execution engine, and the final status of the task should remain the same.

```wdl
task max_retries_test {
  #.....
  requirements {
    max_retries: 4
  }
}
```

##### `return_codes`

* Accepted types:
    * `"*"`: This special value indicates that ALL returnCodes should be considered a success.
    * `Int`: Only the specified return code should be considered a success.
    * `Array[Int]`: Any of the return codes specified in the array should be considered a success.
* Default value: `0`
* Alias: `returnCodes`

The `return_codes` attribute specifies the return code, or set of return codes, that indicates a successful execution of a task. If the task exits with one of the specified return codes, it must be considered successful if possible (i.e., assuming all output expressions are evaluated successfully). 

Example: single_return_code_task.wdl


```wdl
version 1.2

task single_return_code {
  command <<<
  exit 1
  >>>

  requirements {
    return_codes: 1
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
version 1.2

task multi_return_code {
  command <<<
  exit 42
  >>>

  requirements {
    return_codes: [1, 2, 5, 10]
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
version 1.2

task all_return_codes {
  command <<<
  exit 42
  >>>

  requirements {
    return_codes: "*"
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

