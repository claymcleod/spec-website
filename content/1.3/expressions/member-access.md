+++
title = "Member Access"
weight = 30
+++

The syntax `x.y` refers to member access. The left-hand side `x` is evaluated as an expression and must be one of the following:

- A `Struct` or `Object` value, where `y` is a member name
- A call in a workflow, where `y` is an output name (a call can be thought of as a struct where the members are the outputs of the called task)
- A type name reference to an enum, where `y` is a choice name

<details>
<summary>
Example: member_access.wdl

```wdl
version 1.3

struct MyType {
  String s
}

task foo {
  command <<<
  printf "bar"
  >>>

  output {
    String bar = read_string(stdout())
  }
}

workflow member_access {
  # task foo has an output y
  call foo
  MyType my = MyType { s: "hello" }

  output {
    String bar = foo.bar
    String hello = my.s
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
  "member_access.bar": "bar",
  "member_access.hello": "hello"
}
```
</p>
</details>

Access to elements of compound members can be chained into a single expression.

<details>
<summary>
Example: nested_access.wdl

```wdl
version 1.3

struct Experiment {
  String id
  Array[String] variables
  Map[String, String] data
}

workflow nested_access {
  input {
    Array[Experiment]+ my_experiments
  }

  Experiment first_experiment = my_experiments[0]

  output {
    # these are equivalent
    String first_var = first_experiment.variables[0]
    String first_var_from_first_experiment = my_experiments[0].variables[0]

    # these are equivalent
    String subject_name = first_experiment.data["name"]
    String subject_name_from_first_experiment = my_experiments[0].data["name"]
  }
}
```
</summary>
<p>
Example input:

```json
{
  "nested_access.my_experiments": [
    {
      "id": "mouse_size",
      "variables": ["name", "height"],
      "data": {
        "name": "Pinky",
        "height": "7"
      }
    },
    {
      "id": "pig_weight",
      "variables": ["name", "weight"],
      "data": {
        "name": "Porky",
        "weight": "1000"
      }
    }
  ]
}
```

Example output:

```json
{
  "nested_access.first_var": "name",
  "nested_access.first_var_from_first_experiment": "name",
  "nested_access.subject_name": "Pinky",
  "nested_access.subject_name_from_first_experiment": "Pinky"
}
```
</p>
</details>

Attempting to access a non-existent member of an object, struct, or call results in an error.

<details>
<summary>
Example: illegal_access_fail.wdl

```wdl
version 1.3

import "member_access.wdl"

workflow illegal_access {
  input {
    MyStruct my
  }

  Int i = my.x  # error: field 'x' does not exist in MyStruct

  call foo

  output {
    String baz = foo.baz  # error: 'baz' is not an output field of task 'foo'
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
{}
```

Test config:

```json
{
  "fail": true
}
```
</p>
</details>
