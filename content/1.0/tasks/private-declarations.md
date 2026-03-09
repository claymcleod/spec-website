+++
title = "Private Declarations"
weight = 20
+++

## Non-Input Declarations

A task can have declarations which are intended as intermediate values rather than inputs. These declarations can be based on input values and can be used within the command section.

For example, this task takes a single `inputs` `Object` but writes it to a JSON file which can then be used by the command:

```wdl
task t {
  input {
    Object inputs
  }
  File objects_json = write_json(inputs)

  # [... other task sections]
}
```
