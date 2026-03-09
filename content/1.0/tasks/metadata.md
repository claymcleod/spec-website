+++
title = "Metadata"
weight = 70
+++

## Parameter Metadata Section

```
$parameter_meta = 'parameter_meta' $ws* '{' ($ws* $parameter_meta_kv $ws*)* '}'
$parameter_meta_kv = $identifier $ws* ':' $ws* $meta_value
$meta_value = $string | $number | $boolean | 'null' | $meta_object | $meta_array
$meta_object = '{}' | '{' $parameter_meta_kv (, $parameter_meta_kv)* '}'
$meta_array = '[]' |  '[' $meta_value (, $meta_value)* ']'
```

This purely optional section contains key/value pairs where the keys are names of parameters and the values are JSON like expressions that describe those parameters. The engine can ignore this section, with no loss of correctness. The extra information can be used, for example, to generate a user interface.

> *Additional requirement*: Any key in this section MUST correspond to a task input or output.

For example:

```wdl
task wc {
  File f
  Boolean l = false
  String? region
  parameter_meta {
    f : { help: "Count the number of lines in this file" },
    l : { help: "Count only lines" }
    region: {help: "Cloud region",
             suggestions: ["us-west", "us-east", "asia-pacific", "europe-central"]}
  }
  command {
    wc ${true="-l", false=' ' l} ${f}
  }
  output {
     String retval = stdout()
  }
}
```

## Metadata Section

```
$meta = 'meta' $ws* '{' ($ws* $meta_kv $ws*)* '}'
$meta_kv = $identifier $ws* '=' $ws* $meta_value
```

This purely optional section contains key/value pairs for any additional meta data that should be stored with the task. For example, author, contact email, or engine authorization policies.
