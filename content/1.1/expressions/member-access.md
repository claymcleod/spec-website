+++
title = "Member Access"
description = "Accessing members of structs, objects, and call outputs"
weight = 40
+++

The syntax `x.y` refers to member access. `x` must be a `Struct` or `Object` value, or a call in a workflow. A call can be thought of as a struct where the members are the outputs of the called task.

<details>
<summary>
Example: member_access.wdl

```wdl
version 1.1

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
version 1.1

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
        "height": "10"
      }
    },
    {
      "id": "pig_weight",
      "variables": ["name", "weight"],
      "data": {
        "name": "Porky",
        "weight": "100"
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
