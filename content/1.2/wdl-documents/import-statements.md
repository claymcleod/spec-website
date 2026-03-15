+++
title = "Import Statements"
description = "Importing WDL documents and struct definitions"
weight = 20
+++

Although a WDL workflow and the task(s) it calls may be defined completely within a single WDL document, splitting it into multiple documents can be beneficial in terms of modularity and code resuse. Furthermore, complex workflows that consist of multiple subworkflows must be defined in multiple documents because each document is only allowed to contain at most one workflow.

The `import` statement is the basis for modularity in WDL. A WDL document may have any number of `import` statements, each of which references another WDL document and allows access to that document's top-level members (`task`s, `workflow`s, and `struct`s).

The `import` statement specifies a WDL document source as a string literal, which is interpreted as a URI. The execution engine is responsible for resolving each import URI and retrieving the contents of the WDL document. The contents of the document in each URI must be WDL source code **of the same version as the importing document**.

Each imported WDL document must be assigned a unique namespace that is used to refer to its members. By default, the namespace of an imported WDL document is the filename of the imported WDL, minus the `.wdl` extension. A namespace can be assigned explicitly using the `as <identifier>` syntax. The tasks and workflows imported from a WDL file are only accessible through the assigned [namespace](@/1.2/appendices/appendix-b.md#namespaces) - see [Fully Qualified Names & Namespaced Identifiers](@/1.2/workflows/qualified-names.md) for details.

```wdl
import "http://example.com/lib/analysis_tasks" as analysis
import "http://example.com/lib/stdlib.wdl"

workflow wf {
  input {
    File bam_file
  }

  # file_size is from "http://example.com/lib/stdlib"
  call stdlib.file_size {
    file=bam_file
  }

  call analysis.my_analysis_task {
    size=file_size.bytes, file=bam_file
  }
}
```

## Import URIs

A document is imported using it's [URI](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier), which uniquely describes its local or network-accessible location. The execution engine must at least support the following protocols for import URIs:

* `http://`
* `https://`
* <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> `file://` - Using the `file://` protocol for local imports can be problematic. Its use is deprecated and will be removed in WDL 2.0.

In the event that there is no protocol specified, the import is resolved **relative to the location of the current document**. In the primary WDL document, a protocol-less import is relative to the folder that contains the primary WDL file. If a protocol-less import starts with `/` it is interpreted as relative to the root of the file system that contains the primary WDL file.

Some examples of correct import resolution:

| Root Workflow Location | Imported Path | Resolved Path |
|-|-|-|
| /foo/bar/baz/qux.wdl | some/task.wdl | /foo/bar/baz/some/task.wdl |
| http://www.github.com/openwdl/coolwdls/myWorkflow.wdl | subworkflow.wdl | http://www.github.com/openwdl/coolwdls/subworkflow.wdl |
| http://www.github.com/openwdl/coolwdls/myWorkflow.wdl | /openwdl/otherwdls/subworkflow.wdl | http://www.github.com/openwdl/otherwdls/subworkflow.wdl |
| /some/path/hello.wdl | /another/path/world.wdl | /another/path/world.wdl |

## Importing and Aliasing Structs

When importing a WDL document, any struct definitions in that document are "copied" into the importing document. This enables structs to be used by their name alone, without the need for any `namespace.` prefix.

A document may import two or more struct definitions with the same name so long as they are all identical. To be identical, two struct definitions must have members with exactly the same names and types and defined in exactly the same order.

A struct may be imported with a different name using an `alias` clause of the form `alias <source name> as <new name>`. If two structs have the same name but are not identical, at least one of them must be imported with a unique alias. To alias multiple structs, simply add more alias clauses to the `import` statement. If aliases are used for some structs in an imported WDL but not others, the unaliased structs are still imported under their original names.

Example: import_structs.wdl


```wdl
version 1.2

import "person_struct_task.wdl"
  alias Person as Patient
  alias Income as PatientIncome

# This struct has the same name as a struct in 'structs.wdl',
# but they have identical definitions so an alias is not required.
struct Name {
  String first
  String last
}

# This struct also has the same name as a struct in 'structs.wdl',
# but their definitions are different, so it was necessary to
# import the struct under a different name.
struct Income {
  Float dollars
  Boolean annual
}

struct Person {
  Int age
  Name name
  Float? height
  Income income
}

task calculate_bill {
  input {
    Person doctor
    Patient patient
    PatientIncome average_income = PatientIncome {
      amount: 50000,
      currency: "USD",
      period: "annually"
    }
  }

  PatientIncome income = select_first([patient.income, average_income])
  String currency = select_first([income.currency, "USD"])
  Float hourly_income = if income.period == "hourly" then income.amount else income.amount / 2000
  Float hourly_income_usd = if currency == "USD" then hourly_income else hourly_income * 100

  command <<<
  printf "The patient makes $~{hourly_income_usd} per hour\n"
  >>>

  output {
    Float amount = hourly_income_usd * 5
  }
}

workflow import_structs {
  input {
    File infile
    Person doctor = Person {
      age: 10,
      name: Name {
        first: "Joe",
        last: "Josephs"
      },
      income: Income {
        dollars: 140000,
        annual: true
      }
    }

    Patient patient = Patient {
      name: Name {
        first: "Bill",
        last: "Williamson"
      },
      age: 42,
      income: PatientIncome {
        amount: 350,
        currency: "Yen",
        period: "hourly"
      },
      assay_data: {
        "glucose": infile
      }
    }
  }

  call person_struct_task.greet_person {
    person = patient
  }

  call calculate_bill {
    doctor = doctor, patient = patient
  }

  output {
    Float bill = calculate_bill.amount
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "import_structs.infile": "data/hello.txt"
}
```

Example output:

```json
{
  "import_structs.bill": 175000.0
}
```


</details>

When a struct `A` in document `X` is imported with alias `B` in document `Y`, any other structs imported from `X` into `Y` with members of type `A` are updated to replace `A` with `B` when copying them into `Y`'s namespace. The execution engine is responsible for maintaining mappings between structs in different namespaces, such that when a task or workflow in `X` with an input of type `A` is called from `Y` with a value of type `B` it is coerced appropriately.

To put this in concrete terms of the preceding example, when `Person` is imported from `structs.wdl` as `Patient` in `import_structs.wdl`, its `income` member is updated to have type `PatientIncome`. When the `person_struct.greet_person` task is called, the input of type `Patient` is coerced to the `Person` type that is defined in the `person_struct` namespace.

```wdl
struct Patient {
  Name name
  Int age
  PatientIncome? income
  Map[String, Array[File]] assay_data
}
```
