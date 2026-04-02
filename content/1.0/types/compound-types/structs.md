+++
title = "Structs"
description = "User-defined struct types in WDL"
weight = 320
+++

WDL provides the ability to define custom compound types called `Structs`. `Structs` are defined directly in the WDL and are usable like any other type.

## Struct Definition

A struct is a C-like construct which enables the user to create new compound types consisting of previously existing types. Structs can then be used within a `Task` or `Workflow` definition as a declaration in place of any other normal types. The struct takes the place of the `Object` type in many circumstances and enables proper typing of its members.

Structs are declared separately from any other constructs, and cannot be declared within any `workflow` or `task` definition. They belong to the namespace of the WDL file which they are written in and are therefore accessible globally within that WDL. Additionally, all structs must be evaluated prior to their use within a `task`, `workflow` or another `struct`.

Structs may be defined using the `struct` keyword and have a single section consisting of typed declarations.

```wdl
struct name { ... }
```

### Struct Declarations

The only contents of struct are a set of declarations. Declarations can be any primitive or compound type, as well as other structs, and are defined the same way as they are in any other section. The one caveat to this is that declarations within a struct do not allow an expression statement after the initial member declaration. Once defined all structs are added to a global namespace accessible from any other construct within the WDL.

For example the following is a valid struct definition:

```wdl
struct Name {
    String myString
    Int myInt
}
```

Whereas the following is invalid:

```wdl
struct Invalid {
    String myString = "Cannot do this"
    Int myInt
}
```

Compound types can also be used within a struct to easily encapsulate them within a single object. For example:

```wdl
struct Name {
    Array[Array[File]] myFiles
    Map[String,Pair[String,File]] myComplexType
    String cohortName
}
```

#### Optional and non Empty Struct Values

Struct declarations can be optional or non-empty (if they are an array type).

```wdl
struct Name {
    Array[File]+ myFiles
    Boolean? myBoolean
}
```

### Using a Struct

When using a struct in the declaration section of either a `workflow` or a `task` or `output` section you define them in the same way you would define any other type.

For example, if I have a struct like the following:

```wdl
struct Person {
    String name
    Int age
}
```

Then usage of the struct in a workflow would look like the following:

```wdl
task task_a {
    Person a
    command {
        echo "hello my name is ${a.name} and I am ${a.age} years old"
    }
}

workflow myWorkflow {
    Person a
    call task_a {
        input:
            a = a
    }
}
```

#### Struct Assignment from Object Literal

Structs can be assigned using an object literal. When writing the object, all entries must conform or be coercible into the underlying type they are being assigned to.

```wdl
Person a = {"name": "John","age": 30}
```

### Struct Member Access

In order to access members within a struct, use object notation; i.e. `myStruct.myName`. If the underlying member is a complex type which supports member access, you can access its elements in the way defined by that specific type.

For example, if we have defined a struct like the following:

```wdl
struct Experiment {
    Array[File] experimentFiles
    Map[String,String] experimentData
}
```

Example 1:

Accessing the nth element of `experimentFiles` and any element in `experimentData` would look like:

```wdl
workflow workflow_a {
    Experiment myExperiment
    File firstFile = myExperiment.experimentFiles[0]
    String experimentName = myExperiment.experimentData["name"]
}
```

Example 2:

If the struct itself is a member of an `Array` or another type:

```wdl
workflow workflow_a {
    Array[Experiment] myExperiments

    File firstFileFromFirstExperiment = myExperiments[0].experimentFiles[0]
    File experimentNameFromFirstExperiment = myExperiments[0].experimentData["name"]
}
```

### Importing Structs

Any `struct` defined within an imported WDL will be added to a global namespace and will not be a part of the imported WDL's namespace. If two structs are named the same it will be necessary to resolve the conflicting names. To do this, one or more structs may be imported under an alias defined within the import statement.

For example, if your current WDL defines a struct named `Experiment` and the imported WDL also defines another struct named `Experiment` you can alias them as follows:

```wdl
import http://example.com/example.wdl as ex alias Experiment as OtherExperiment
```

In order to resolve multiple structs, simply add additional alias statements.

```wdl
import http://example.com/another_example.wdl as ex2
    alias Parent as Parent2
    alias Child as Child2
    alias GrandChild as GrandChild2
```

It is important to note that when importing from file 2, all structs from file 2's global namespace will be imported. This includes structs from another imported WDL within file 2, even if they are aliased. If a struct is aliased in file 2, it will be imported into file 1 under its aliased name.

*Note: Alias can be used even when no conflicts are encountered to uniquely identify any struct.*
