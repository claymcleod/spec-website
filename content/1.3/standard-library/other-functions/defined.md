+++
title = "defined"
description = "Test whether an optional value is defined"
weight = 10
+++

```
Boolean defined(X?)
```

Tests whether the given optional value is defined, i.e., has a non-`None` value.

**Parameters**

1. `X?`: optional value of any type.

**Returns**: `false` if the input value is `None`, otherwise `true`.

<details>
<summary>
Example: is_defined.wdl

```wdl
version 1.3

workflow is_defined {
  input {
    String? name
  }

  if (defined(name)) {
    call say_hello { name = select_first([name]) }
  }

  output {
    String? greeting = say_hello.greeting
  }
}

task say_hello {
  input {
    String name
  }

  command <<< printf "Hello ~{name}" >>>

  output {
    String greeting = read_string(stdout())
  }
}
```
</summary>
<p>
Example input:

```json
{
  "is_defined.name": "John"
}
```

Example output:

```json
{
  "is_defined.greeting": "Hello John"
}
```
</p>
</details>
