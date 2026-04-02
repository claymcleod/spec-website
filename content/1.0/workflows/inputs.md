+++
title = "Workflow Inputs"
description = "Declaring input parameters for workflows"
weight = 30
+++

### Workflow Inputs

As with tasks, a workflow must declare its inputs in an `input` section, like this:
```wdl
workflow w {
  input {
    Int i
    String s
  }
}
```

#### Optional Inputs

An optional input is specified like this:

```wdl
workflow foo {
  input {
    Int? x
    File? y
  }
  # ... remaining workflow content
}
```

In these situations, a value may or may not be provided for this input. The following would all be valid input files for the above workflow:
- No inputs:

```json
{ }
```
- Only x:
```json
{
  "x": 100
}
```
- Only y:
```json
{
  "x": null,
  "y": "/path/to/file"
}
```
- x and y:
```json
{
  "x": 1000,
  "y": "/path/to/file"
}
```

#### Declared Inputs: Defaults and Overrides

Tasks and workflows can have default values built-in via expressions, like this:
```wdl
workflow foo {
  input {
    Int x = 5
  }
  ...
}
```

```wdl
task foo {
  input {
    Int x = 5
  }
  ...
}
```

In this case, `x` should be considered an optional input to the task or workflow, but unlike optional inputs without defaults, the type can be `Int` rather than `Int?`. If an input is provided, that value should be used. If no input value for x is provided then the default expression is evaluated and used.

Note that to be considered an optional input, the default value must be provided within the `input` section. If the declaration is in the main body of the workflow it is considered an intermediate value and is not overridable. For example below, the `Int x` is an input whereas `Int y` is not.
```wdl
workflow foo {
  input {
    Int x = 10
  }
  call my_task as t1 { input: int_in = x }
  Int y = my_task.out
  call my_task as t2 { input: int_in = y }
}
```

Note that it is still possible to override intermediate expressions via optional inputs if that's important to the workflow author. A modified version of the above workflow demonstrates this:
```wdl
workflow foo {
  input {
    Int x = 10
    Int y = my_task.out
  }

  call my_task as t1 { input: int_in = x }
  call my_task as t2 { input: int_in = y }
}
```
Note that the control flow of the workflow changes depending on whether the value `Int y` is provided:

* If an input value is provided for `y` then it receives that value immediately and `t2` may start running as soon as the workflow starts.
* In no input value is provided for `y` then it will need to wait for `t1` to complete before it is assigned.


##### Optional inputs with defaults
It *is* possible to provide a default to an optional input type:
```wdl
input {
  String? s = "hello"
}
```
Since the expression is static, this is interpreted as a `String?` value that is set by default, but can be overridden in the inputs file, just like above. Note that if you give a value an optional type like this then you can only use this value in calls or expressions that can handle optional inputs. Here's an example:
```wdl
workflow foo {
  input {
    String? s = "hello"
  }

  call valid { input: s_maybe = s }

  # This would cause a validation error. Cannot use String? for a String input:
  call invalid { input: s_definitely = s }
}

task valid {
  input {
    String? s_maybe
  }
  ...
}

task invalid {
  input {
    String s_definitely
  }
}
```

The rational for this is that a user may want to provide the following input file to alter how `valid` is called, and such an input would invalidate the call to `invalid` since it is unable to accept optional values:
```json
{
  "foo.s": null
}
```
