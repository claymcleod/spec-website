+++
title = "Custom Types (Structs)"
description = "User-defined struct types in WDL"
weight = 20
+++

WDL provides the ability to define custom compound types called [structs](#). `Struct` types are defined directly in the WDL document and are usable like any other type. A struct is defined using the `struct` keyword, followed by a unique name, followed by member declarations within braces. A struct definition contains any number of declarations of any types, including other `Struct`s.

A declaration with a custom type can be initialized with a struct literal, which begins with the `Struct` type name followed by a comma-separated list of name-value pairs in braces (`{}`), where name-value pairs are delimited by `:`. The member names in a struct literal are not quoted. A struct literal must provide values for all of the struct's non-optional members, and may provide values for any of the optional members. The members of a struct literal are validated against the struct's definition at the time of creation. Members do not need to be in any specific order. Once a struct literal is created, it is immutable like any other WDL value.

The value of a specific member of a struct value can be [accessed](#) by placing a `.` followed by the member name after the identifier.

<details>
<summary>
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
</summary>
<p>
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

</p>
</details>

<details>
<summary>
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

<span class="wdl-badge wdl-badge-deprecated">Deprecated</span> It is also possible to assign an `Object` or `Map[String, X]` value to a `Struct` declaration. In the either case:

* The value of each `Object`/`Map` member must be coercible to the declared type of the struct member.
* The `Object`/`Map` must at least contain values for all of the struct's non-optional members.
* Any `Object`/`Map` member that does not correspond to a member of the struct is ignored.

Note that the ability to assign values to `Struct` declarations other than struct literals is deprecated and will be removed in WDL 2.0.
