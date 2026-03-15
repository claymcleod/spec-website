+++
title = "matches"
description = "Test whether a pattern matches a string"
weight = 20
+++

*as of version 1.2*

Given two `String` parameters `input` and `pattern`, tests whether `pattern` matches `input` at least once. `pattern` is a [regular expression](https://en.wikipedia.org/wiki/Regular_expression) and is evaluated as a [POSIX Extended Regular Expression (ERE)](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended).

To test whether `pattern` matches the entire `input`, make sure to begin and end the pattern with anchors. For example:

```wdl
Boolean full_match = matches("abc123", "^a.+3$")
```

Note that regular expressions are written using regular WDL strings, so backslash characters need to be double-escaped. For example:

```wdl
Boolean has_tab = matches("hello\tBob", "\\t")
```

**Parameters**

1. `String`: the input string to search.
2. `String`: the pattern to search for.

**Returns**: `true` if `pattern` matches `input` at least once, otherwise `false`.

Example: test_matches_task.wdl


```wdl
version 1.3

workflow contains_string {
  input {
    File json
  }
  output {
    Boolean is_compressed = matches(basename(json), "\\.(gz|zip|zstd)")
    Boolean is_read1 = matches(basename(json), "_R1")
  }
}
```


<details>
<summary></summary>


Example input:

```json
{
  "contains_string.json": "data/person.json"
}
```

Example output:

```json
{
  "contains_string.is_compressed": false,
  "contains_string.is_read1": false
}
```


</details>
