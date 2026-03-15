+++
title = "Custom Types (Structs)"
description = "User-defined struct types in WDL"
weight = 20
+++

WDL provides the ability to define custom compound types called structs. `Struct` types are defined directly in the WDL document and are usable like any other type. A struct is defined using the `struct` keyword, followed by a unique name, followed by member declarations within braces. A struct definition contains any number of declarations of any types, including other `Struct`s.

A declaration with a custom type can be initialized with a struct literal, which begins with the `Struct` type name followed by a comma-separated list of name-value pairs in braces (`{}`), where name-value pairs are delimited by `:`. The member names in a struct literal are not quoted. A struct literal must provide values for all of the struct's non-optional members, and may provide values for any of the optional members. The members of a struct literal are validated against the struct's definition at the time of creation. Members do not need to be in any specific order. Once a struct literal is created, it is immutable like any other WDL value.

The value of a specific member of a struct value can be accessed by placing a `.` followed by the member name after the identifier.

Example: test_struct.wdl


```wdl
version 1.2

struct BankAccount {
  String account_number
  Int routing_number
  Float balance
  Array[Int]+ pin_digits
  String? username
}

struct Person {
  String name
  BankAccount? account
}

workflow test_struct {
  output {
    Person john = Person {
      name: "John",
      # it's okay to leave out username since it's optional
      account: BankAccount {
        account_number: "123456",
        routing_number: 300211325,
        balance: 3.50,
        pin_digits: [1, 2, 3, 4]
      }
    }
    Boolean has_account = defined(john.account)
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
  "test_struct.john": {
    "name": "John",
    "account": {
      "account_number": "123456",
      "routing_number": 300211325,
      "balance": 3.5,
      "pin_digits": [1, 2, 3, 4],
      "username": null
    }
  },
  "test_struct.has_account": true
}
```


</details>

Example: incomplete_struct_fail.wdl


```wdl
version 1.2

# importing a WDL automatically imports all its structs into
# the current namespace
import "test_struct.wdl"

workflow incomplete_struct {
  output {
    # error! missing required account_number
    Person fail1 = Person {
      "name": "Sam",
      "account": BankAccount {
        routing_number: 611325474,
        balance: 9.99,
        pin_digits: [5, 5, 5, 5]
      }
    }
    # error! pin_digits is empty
    Person fail2 = Person {
      "name": "Bugs",
      "account": BankAccount {
        account_number: "FATCAT42",
        routing_number: 880521345,
        balance: 50.01,
        pin_digits: []
      }
    }
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
  "fail": true
}
```


</details>

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> It is also possible to assign an `Object` or `Map[String, X]` value to a `Struct` declaration. In the either case:

* The value of each `Object`/`Map` member must be coercible to the declared type of the struct member.
* The `Object`/`Map` must at least contain values for all of the struct's non-optional members.
* Any `Object`/`Map` member that does not correspond to a member of the struct is ignored.

Note that the ability to assign values to `Struct` declarations other than struct literals is deprecated and will be removed in WDL 2.0.

## Struct Definition

A `Struct` type is a user-defined data type. Structs enable the creation of compound data types that bundle together related attributes in a more natural way than is possible using the general-purpose compound types like `Pair` or `Map`. Once defined, a `Struct` type can be used as the type of a declaration like any other data type.

`Struct` definitions are top-level WDL elements, meaning they exist at the same level as [import](@/1.2/wdl-documents/import-statements.md), [`task` definition](@/1.2/tasks/_index.md), and [`workflow` definition](@/1.2/workflows/_index.md) definitions. A struct cannot be defined within a task or workflow body.

A struct is defined using the `struct` keyword, followed by a name that is unique within the WDL document, and a body containing the member declarations. A struct member may be of any type, including compound types and even other `Struct` types. A struct member may be optional. Declarations in a struct body differ from those in a task or workflow in that struct members cannot have default initializers.

A `struct` definition may include a `meta` section with metadata about the struct, and a `parameter_meta` section with metadata about any of the struct's members. These sections have identical sematics to task and workflow [`meta` and `parameter_meta` sections](@/1.2/tasks/metadata.md). Any key in the `parameter_meta` section *must* correspond to a member of the `struct`.

Example: person_struct_task.wdl


```wdl
version 1.2

struct Name {
  String first
  String last
}

struct Income {
  Float amount
  String period
  String? currency
}

struct Person {
  Name name
  Int age
  Income? income
  Map[String, File] assay_data

  meta {
    description: "Encapsulates data about a person"
  }

  parameter_meta {
    name: "The person's name"
    age: "The person's age"
    income: "How much the person makes (optional)"
    assay_data: "Mapping of assay name to the file that contains the assay data"
  }
}

task greet_person {
  input {
    Person person
  }

  Array[Pair[String, File]] assay_array = as_pairs(person.assay_data)

  command <<<
  printf "Hello ~{person.name.first}! You have ~{length(assay_array)} test result(s) available.\n"

  if ~{defined(person.income)}; then
    if [ "$(printf "%.0f" ~{select_first([person.income]).amount})" -gt 1000 ]; then
      currency="~{select_first([select_first([person.income]).currency, "USD"])}"
      printf "Please transfer $currency 500 to continue"
    fi
  fi
  >>>

  output {
    String message = read_string(stdout())
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "greet_person.person": {
    "name": {
      "first": "Richard",
      "last": "Rich"
    },
    "age": 14,
    "income": {
      "amount": 1000000,
      "period": "annually"
    },
    "assay_data": {
      "wealthitis": "data/hello.txt"
    }
  }
}
```

Example output:

```json
{
  "greet_person.message": "Hello Richard! You have 1 test result(s) available.\nPlease transfer USD 500 to continue"
}
```

Test config:


</details>

An invalid struct:

```wdl
struct Invalid {
  String myString = "Cannot do this"
  Int myInt
}
```
