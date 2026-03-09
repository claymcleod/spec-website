+++
title = "Workflows"
description = "WDL workflow definitions and structure"
sort_by = "weight"
weight = 50
+++

## Workflow Definition

A workflow is declared using the keyword `workflow` followed by the workflow name and the workflow body in curly braces.

An example of a workflow that runs one task (not defined here) would be:

```wdl
workflow wf {
  input {
    Array[File] files
    Int threshold
    Map[String, String] my_map
  }
  call analysis_job {
    input: search_paths = files, threshold = threshold, gender_lookup = my_map
  }
}
```

### Parameter Metadata

```
$wf_parameter_meta = 'parameter_meta' $ws* '{' ($ws* $wf_parameter_meta_kv $ws*)* '}'
$wf_parameter_meta_kv = $identifier $ws* '=' $ws* $meta_value
```

This purely optional section contains key/value pairs where the keys are names of parameters and the values are JSON like expressions that describe those parameters.

> *Additional requirement*: Any key in this section MUST correspond to a workflow input or output.

As an example:
```wdl
  parameter_meta {
    memory_mb: "Amount of memory to allocate to the JVM"
    param: "Some arbitrary parameter"
    sample_id: "The ID of the sample in format foo_bar_baz"
  }
```

### Metadata

```
$wf_meta = 'meta' $ws* '{' ($ws* $wf_meta_kv $ws*)* '}'
$wf_meta_kv = $identifier $ws* '=' $ws* $meta_value
```

This purely optional section contains key/value pairs for any additional meta data that should be stored with the workflow.  For example, perhaps author or contact email.

As an example:
```wdl
  meta {
    author: "Joe Somebody"
    email: "joe@company.org"
  }
```
