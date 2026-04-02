+++
title = "sub"
description = "Substitute substring"
weight = 2030
+++

```
String sub(String, String, String)
```

Given 3 String parameters `input`, `pattern`, `replace`, this function will replace any occurrence matching `pattern` in `input` by `replace`. `pattern` is expected to be a [regular expression](https://en.wikipedia.org/wiki/Regular_expression). Details of regex evaluation will depend on the execution engine running the WDL.

**Parameters**:

1. `String`: the input string.
2. `String`: the pattern to search for.
3. `String`: the replacement string.

**Returns**: the input string, with all occurrences of the pattern replaced by the replacement string.

The `sub` function will also accept `input` and `replace` parameters that can be coerced to a `String` (e.g. `File`). This can be useful to swap the extension of a filename for example.

Example 1:

```wdl
String chocolike = "I like chocolate when it's late"

String chocolove = sub(chocolike, "like", "love") # I love chocolate when it's late
String chocoearly = sub(chocolike, "late", "early") # I like chocoearly when it's early
String chocolate = sub(chocolike, "late$", "early") # I like chocolate when it's early
```


Example 2: Swapping a file extension

```wdl
task example {
  input {
    File input_file = "my_input_file.bam"
    String output_file_name = sub(input_file, "\\.bam$", ".index") # my_input_file.index
  }
  command {
    echo "I want an index instead" > ${output_file_name}
  }

  output {
    File outputFile = output_file_name
  }
}
```

