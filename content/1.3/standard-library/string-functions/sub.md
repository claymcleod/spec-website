+++
title = "sub"
description = "Replace occurrences of a pattern in a string"
weight = 30
+++

```
String sub(String, String, String)
```

Given three String parameters `input`, `pattern`, `replace`, this function replaces all non-overlapping occurrences of `pattern` in `input` by `replace`. `pattern` is a [regular expression](https://en.wikipedia.org/wiki/Regular_expression) and is evaluated as a [POSIX Extended Regular Expression (ERE)](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended).
Regular expressions are written using regular WDL strings, so backslash characters need to be double-escaped (e.g., `"\\t"`).

The replacement string `replace` supports the special sequence `\n` (where `n` is a digit 1-9) is replaced by the text matched by the `n`th capturing group from the pattern, or an empty string if the capturing group did not participate in the match. Only `\1` through `\9` are supported as capturing group references, matching the limit of POSIX ERE. Named capture groups are not currently supported.

As with patterns, backslashes in the replace string must be double-escaped. For example, to reference the first capturing group in a WDL workflow, write `"\\1"` (which becomes `\1` when evaluated).

**Parameters**:

1. `String`: the input string.
2. `String`: the pattern to search for.
3. `String`: the replacement string.

**Returns**: the input string, with all occurrences of the pattern replaced by the replacement string.

<details>
<summary>
Example: test_sub.wdl

```wdl
version 1.3

workflow test_sub {
  String chocolike = "I like chocolate when\nit's late"
  String question = "when chocolate"

  output {
    String chocolove = sub(chocolike, "like", "love") # I love chocolate when\nit's late
    String chocoearly = sub(chocolike, "late", "early") # I like chocoearly when\nit's early
    String chocolate = sub(chocolike, "late$", "early") # I like chocolate when\nit's early
    String chocoearlylate = sub(chocolike, "[^ ]late", "early") # I like chocearly when\nit's late
    String choco4 = sub(chocolike, " [[:alpha:]]{4} ", " 4444 ") # I 4444 chocolate when\nit's late
    String no_newline = sub(chocolike, "\\n", " ") # "I like chocolate when it's late"
    String new_question = sub(question, "([^ ]+) ([^ ]+)", "\\2, \\1?") # "chocolate, when?"
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
  "test_sub.chocolove": "I love chocolate when\nit's late",
  "test_sub.chocoearly": "I like chocoearly when\nit's early",
  "test_sub.chocolate": "I like chocolate when\nit's early",
  "test_sub.chocoearlylate": "I like chocearly when\nit's late",
  "test_sub.choco4": "I 4444 chocolate when\nit's late",
  "test_sub.no_newline": "I like chocolate when it's late",
  "test_sub.new_question": "chocolate, when?"
}
```
</p>
</details>

Any arguments are allowed so long as they can be coerced to `String`s. For example, this can be useful to swap the extension of a filename:

<details>
<summary>
Example: change_extension_task.wdl

```wdl
version 1.3

task change_extension {
  input {
    String prefix
  }

  command <<<
    printf "data" > ~{prefix}.data
    printf "index" > ~{prefix}.index
  >>>

  output {
    File data_file = "~{prefix}.data"
    String data = read_string(data_file)
    String index = read_string(sub("~{data_file}", "\\.data$", ".index"))
  }

  requirements {
    container: "ubuntu:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "change_extension.prefix": "foo"
}
```

Example output:

```json
{
  "change_extension.data": "data",
  "change_extension.index": "index"
}
```

Test config:

```json
{
  "exclude_outputs": ["change_extension.data_file"]
}
```
</p>
</details>
