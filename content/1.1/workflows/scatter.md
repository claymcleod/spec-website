+++
title = "Scatter Statement"
description = "Parallel execution over collections"
weight = 80
+++

Scatter/gather is a common parallelization pattern in computer science. Given a collection of inputs (such as an array), the "scatter" step executes a set of operations on each input in parallel. In the "gather" step, the outputs of all the individual scatter-tasks are collected into the final output.

WDL provides a mechanism for scatter/gather using the `scatter` statement. A `scatter` statement begins with the `scatter` keyword and has three essential pieces:

* An expression that evaluates to an `Array[X]` - the array to be scattered over.
* The scatter variable - an identifier that will hold the input value in each iteration of the scatter. The scatter variable is always of type `X`, where `X` is the item type of the `Array`. The scatter variable may only be referenced in the body of the scatter.
* A body that contains any number of nested statements - declarations, calls, scatters, conditionals - that are executed for each value in the collection.

After evaluation has completed for all iterations of a `scatter`, each declaration or call output in the scatter body (except for the scatter variable) is collected into an array, and those array declarations are exposed in the enclosing context. In other words, for a declaration or call output `T <name>` within a scatter body, a declaration `Array[T] <name>` is implicitly available outside of the scatter body. The ordering of an exported array is guaranteed to match the ordering of the input array. In the example below, `String greeting` is accessible anywhere in the `scatter` body, and `Array[String] greeting` is a collection of all the values of `greeting` - in the same order as `name_array` - that is accessible outside of the `scatter` anywhere in `workflow test_scatter`.

Example: test_scatter.wdl


```wdl
version 1.1

task say_hello {
  input {
    String greeting
  }

  command <<<
  printf "~{greeting}, how are you?"
  >>>

  output {
    String msg = read_string(stdout())
  }
}

workflow test_scatter {
  input {
    Array[String] name_array = ["Joe", "Bob", "Fred"]
    String salutation = "Hello"
  }

  # `name_array` is an identifier expression that evaluates to an Array
  # of Strings.
  # `name` is a `String` declaration that is assigned a different value
  # - one of the elements of `name_array` - during each iteration.
  scatter (name in name_array) {
    # these statements are evaluated for each different value of `name`,s
    String greeting = "~{salutation} ~{name}"
    call say_hello { input: greeting = greeting }
  }

  output {
    Array[String] messages = say_hello.msg
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
  "test_scatter.messages": [
    "Hello Joe, how are you?",
    "Hello Bob, how are you?",
    "Hello Fred, how are you?"
  ]
}
```


</details>

In this example, the scatter body is evaluated three times - once for each value in `name_array`. On a multi-core computer, these evaluations might happen in parallel, with each evaluation running in a separate thread or subprocess; on a cloud platform, each of these evaluations might take place in a different virtual machine.

The scatter body is a nested scope in which the scatter variable is accessible, along with all of the declarations and call outputs that are accessible in the enclosing scope. The scatter variable is *not* accessible outside the scatter body. In the preceding example, it would be an error to reference `name` in the workflow's output section. However, if the `scatter` contained a nested `scatter`, `name` would be accessible in that nested `scatter`'s body. Similarly, calls within the scatter body are able to depend on each other and reference each others' outputs.

If scatters are nested to multiple levels, the output types are also nested to the same number of levels.

Example: nested_scatter.wdl


```wdl
version 1.1

import "test_scatter.wdl" as scat

task make_name {
  input {
    String first
    String last
  }

  command <<<
  printf "~{first} ~{last}"
  >>>

  output {
    String name = read_string(stdout())
  }
}

workflow nested_scatter {
  input {
    Array[String] first_names = ["Bilbo", "Gandalf", "Merry"]
    Array[String] last_names = ["Baggins", "the Grey", "Brandybuck"]
    Array[String] salutations = ["Hello", "Goodbye"]
  }

  Array[String] honorifics = ["Mr.", "Wizard"]

  # the zip() function creates an array of pairs
  Array[Pair[String, String]] name_pairs = zip(first_names, last_names)
  # the range() function creates an array of increasing integers
  Array[Int] counter = range(length(name_pairs))

  scatter (name_and_index in zip(name_pairs, counter) ) {
    Pair[String, String] names = name_and_index.left

    # Use a different honorific for even and odd items in the array
    # `honorifics` is accessible here
    String honorific = honorifics[name_and_index.right % 2]

    call make_name {
      input:
        first = names.left,
        last = names.right
    }

    scatter (salutation in salutations) {
      # `names`, and `salutation` are all accessible here
      String short_greeting = "~{salutation} ~{honorific} ~{names.left}"
      call scat.say_hello { input: greeting = short_greeting }

      # the output of `make_name` is also accessible
      String long_greeting = "~{salutation} ~{honorific} ~{make_name.name}"
      call scat.say_hello as say_hello_long { input: greeting = long_greeting }

      # within the scatter body, when we access the output of the
      # say_hello call, we get a String
      Array[String] messages = [say_hello.msg, say_hello_long.msg]
    }

    # this would be an error - `salutation` is not accessible here
    # String scatter_saluation = salutation
  }

  # Outside of the scatter body, we can access all of the names that
  # are inside the scatter body, but the types are now all Arrays.
  # Each of these outputs will be an array of length 3 (the same
  # length as `name_and_index`).
  output {
    # Here we are one level of nesting away from `honorific`, so
    # the implicitly created array is one level deep
    Array[String] used_honorifics = honorific

    # Here we are two levels of nesting away from `messages`, so
    # the array is two levels deep
    Array[Array[Array[String]]] out_messages = messages

    # This would be an error - 'names' is not accessible here
    # String scatter_names = names
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
  "nested_scatter.out_messages": [
    [
      ["Hello Mr. Bilbo, how are you?", "Hello Mr. Bilbo Baggins, how are you?"],
      ["Goodbye Mr. Bilbo, how are you?", "Goodbye Mr. Bilbo Baggins, how are you?"]
    ],
    [
      ["Hello Wizard Gandalf, how are you?", "Hello Wizard Gandalf the Grey, how are you?"],
      ["Goodbye Wizard Gandalf, how are you?", "Goodbye Wizard Gandalf the Grey, how are you?"]
    ],
    [
      ["Hello Mr. Merry, how are you?", "Hello Mr. Merry Brandybuck, how are you?"],
      ["Goodbye Mr. Merry, how are you?", "Goodbye Mr. Merry Brandybuck, how are you?"]
    ]
  ],
  "nested_scatter.used_honorifics": ["Mr.", "Wizard", "Mr."]
}
```


</details>
