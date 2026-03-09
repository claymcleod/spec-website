+++
title = "Optional Types"
description = "Optional type declarations and the None value in WDL"
weight = 30
+++

A type may have a `?` postfix quantifier, which means that its value is allowed to be undefined without causing an error. A declaration with an optional type can only be used in calls or functions that accept optional values.

Multi-level optionals are not allowed. A value cannot have multiple levels of optionality, for example, `Int??` is not a valid type. However, nested optionals within compound types are allowed, such as `Array[String?]?`, where each `?` applies to a different structural level of the type.

WDL has a special value `None` whose meaning is "an undefined value". The `None` value has the (hidden) type [`Union`](@/1.3/types/hidden-types.md#union-hidden-type), meaning `None` can be assigned to an optional declaration of any type.

An optional declaration has a default initialization of `None`, which indicates that it is undefined. An optional declaration may be initialized to any literal or expression of the correct type, including the special `None` value.

<details>
  <summary>
  Example: optionals.wdl

  ```wdl
  version 1.3

  workflow optionals {
    input {
      Int certainly_five = 5      # an non-optional declaration
      Int? maybe_five_and_is = 5  # a defined optional declaration

      # the following are equivalent undefined optional declarations
      String? maybe_five_but_is_not
      String? also_maybe_five_but_is_not = None
    }

    output {
      Boolean test_defined = defined(maybe_five_but_is_not) # Evaluates to false
      Boolean test_defined2 = defined(maybe_five_and_is)    # Evaluates to true
      Boolean test_is_none = maybe_five_but_is_not == None  # Evaluates to true
      Boolean test_not_none = maybe_five_but_is_not != None # Evaluates to false
      Boolean test_non_equal = maybe_five_but_is_not == also_maybe_five_but_is_not
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
    "optionals.test_defined": false,
    "optionals.test_defined2": true,
    "optionals.test_is_none": true,
    "optionals.test_not_none": false,
    "optionals.test_non_equal": true
  }
  ```
  </p>
</details>

For more details, see the sections on [Input Type Constraints](@/1.3/tasks/inputs.md) and [Optional Inputs with Defaults](@/1.3/tasks/inputs.md).
