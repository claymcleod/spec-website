+++
title = "find"
description = "Find first regex match in a string"
weight = 10
+++

*as of version 1.2*

Given two `String` parameters `input` and `pattern`, searches for the occurrence of `pattern` within `input` and returns the first match or `None` if there are no matches. `pattern` is a [regular expression](https://en.wikipedia.org/wiki/Regular_expression) and is evaluated as a [POSIX Extended Regular Expression (ERE)](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended).

Note that regular expressions are written using regular WDL strings, so backslash characters need to be double-escaped. For example:

```wdl
String? first_match = find("hello\tBob", "\\t")
```

**Parameters**

1. `String`: the input string to search.
2. `String`: the pattern to search for.

**Returns**: The contents of the first match, or `None` if `pattern` does not match `input`.

Example: test_find_task.wdl


```wdl
version 1.3

workflow find_string {
  input {
    String in = "hello world"
    String pattern1 = "e..o"
    String pattern2 = "goodbye"
  }
  output {
    String? match1 = find(in, pattern1)  # "ello"
    String? match2 = find(in, pattern2)  # None
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
  "find_string.match1": "ello",
  "find_string.match2": null
}
```


</details>
