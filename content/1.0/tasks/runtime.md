+++
title = "Runtime"
description = "Specifying runtime environment requirements for tasks"
weight = 60
+++

## Runtime Section

```
$runtime = 'runtime' $ws* '{' ($ws* $runtime_kv $ws*)* '}'
$runtime_kv = $identifier $ws* '=' $ws* $expression
```

The runtime section defines key/value pairs for runtime information needed for this task. Individual backends will define which keys they will inspect so a key/value pair may or may not actually be honored depending on how the task is run.

Values can be any expression and it is up to the engine to reject keys and/or values that do not make sense in that context. For example, consider the following WDL:

```wdl
task test {
  command {
    python script.py
  }
  runtime {
    docker: ["ubuntu:latest", "broadinstitute/scala-baseimage"]
  }
}
```

The value for the `docker` runtime attribute in this case is an array of values. The parser should accept this. Some engines might interpret it as an "either this image or that image" or could reject it outright.

Since values are expressions, they can also reference variables in the task:

```wdl
task test {
  input {
    String ubuntu_version
  }
  command {
    python script.py
  }
  runtime {
    docker: "ubuntu:" + ubuntu_version
  }
}
```

Most key/value pairs are arbitrary. However, the following keys have recommended conventions:

### docker

Location of a Docker image for which this task ought to be run. This can have a format like `ubuntu:latest` or `broadinstitute/scala-baseimage` in which case it should be interpreted as an image on DockerHub (i.e. it is valid to use in a `docker pull` command).

```wdl
task docker_test {
  input {
    String arg
  }
  command {
    python process.py ${arg}
  }
  runtime {
    docker: "ubuntu:latest"
  }
}
```

### memory

Memory requirements for this task. Two kinds of values are supported for this attributes:

* `Int` - Intepreted as bytes
* `String` - This should be a decimal value with suffixes like `B`, `KB`, `MB` or binary suffixes `KiB`, `MiB`. For example: `6.2 GB`, `5MB`, `2GiB`.

```wdl
task memory_test {
  input {
    String arg
  }

  command {
    python process.py ${arg}
  }
  runtime {
    memory: "2GB"
  }
}
```
