+++
title = "Metadata Sections"
description = "Task and parameter-level metadata"
weight = 70
+++

There are two optional sections that can be used to store metadata with the task: `meta` and `parameter_meta`. These sections are designed to contain metadata that is only of interest to human readers. The engine can ignore these sections with no loss of correctness. The extra information can be used, for example, to generate a user interface. Any attributes that may influence execution behavior should go in the `runtime` section.

Both of these sections can contain key/value pairs. Metadata values are different than in `runtime` and other sections:

* Only string, numeric, and boolean primitives are allowed.
* Only array and "meta object" compound values are allowed.
* The special value `null` is allowed for undefined attributes.
* Expressions are not allowed.

A meta object is similar to a struct literal, except:

* A type name is not required.
* Its values must conform to the same metadata rules defined above.

```wdl
task {
  meta {
    authors: ["Jim", "Bob"]
    version: 1.1
    citation: {
      year: 2020,
      doi: "1234/10.1010"
    }
  }
}
```

Note that, unlike the WDL `Object` type, metadata objects are not deprecated and will continue to be supported in future versions.

## Task Metadata Section

This section contains task-level metadata. For example: author and contact email.

## Parameter Metadata Section

This section contains metadata specific to input and output parameters. Any key in this section *must* correspond to a task input or output.

Example: ex_paramter_meta_task.wdl


```wdl
version 1.1

task ex_paramter_meta {
  input {
    File infile
    Boolean lines_only = false
    String? region
  }

  meta {
    description: "A task that counts the number of words/lines in a file"
  }

  parameter_meta {
    infile: {
      help: "Count the number of words/lines in this file"
    }
    lines_only: {
      help: "Count only lines"
    }
    region: {
      help: "Cloud region",
      suggestions: ["us-west", "us-east", "asia-pacific", "europe-central"]
    }
  }

  command <<<
    wc ~{if lines_only then '-l' else ''} < ~{infile}
  >>>

  output {
     Int result = read_int(stdout())
  }

  runtime {
    container: "ubuntu:latest"
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "ex_paramter_meta.infile": "data/greetings.txt",
  "ex_paramter_meta.lines_only": true
}
```

Example output:

```json
{
  "ex_paramter_meta.result": 3
}
```


</details>
