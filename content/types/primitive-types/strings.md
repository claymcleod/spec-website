+++
title = "Strings"
description = "String literals, escape sequences, multi-line strings, Files and Directories"
weight = 10
+++

A string literal may contain any unicode characters between single or double-quotes, with the exception of a few special characters that must be escaped:

| Escape Sequence | Meaning      | \x Equivalent | Context                       |
| --------------- | ------------ | ------------- | ----------------------------- |
| `\\`            | `\`          | `\x5C`        |                               |
| `\n`            | newline      | `\x0A`        |                               |
| `\t`            | tab          | `\x09`        |                               |
| `\'`            | single quote | `\x22`        | within a single-quoted string |
| `\"`            | double quote | `\x27`        | within a double-quoted string |
| `\~`            | tilde        | `\x7E`        | literal `"~{"`                |
| `\$`            | dollar sign  | `\x24`        | literal `"${"`                |

Strings can also contain the following types of escape sequences:

* An octal escape code starts with `\`, followed by 3 digits of value 0 through 7 inclusive.
* A hexadecimal escape code starts with `\x`, followed by 2 hexadecimal digits `0-9a-fA-F`.
* A unicode code point starts with `\u` followed by 4 hexadecimal characters or `\U` followed by 8 hexadecimal characters `0-9a-fA-F`.

## Multi-line Strings

Strings that begin with `<<<` and end with `>>>` may span multiple lines.

<details>
  <summary>
  Example: multiline_strings1.wdl

  ```wdl
  version 1.2

  workflow multiline_strings1 {
    output {
      String s = <<<
        This is a
        multi-line string!
      >>>
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
    "multiline_strings1.s": "This is a\nmulti-line string!"
  }
  ```
  </p>
</details>

In multi-line strings, leading *whitespace* is removed according to the following rules. In the context of multi-line strings, whitespace refers to space (`\x20`) and tab characters only and is treated differently from newline characters.

1. Remove all line continuations and subsequent white space.
   * A line continuation is a backslash (`\`) immediately preceding the newline. A line continuation indicates that two consecutive lines are actually the same line (e.g. when breaking a long line for better readability).
   * If a line ends in multiple `\` then standard character escaping applies. Each pair of consecutive backslashes (`\\`) is an escaped backslash. So a line is continued only if it ends in an odd number of backslashes.
   * Removing a line continuation means removing the last `\` character, the immediately following newline, and all the whitespace preceeding the next non-whitespace character or end of line (whichever comes first).
2. Remove all whitespace following the opening `<<<`, up to and including a newline (if any).
3. Remove all whitespace preceeding the closing `>>>`, up to and including a newline (if any).
4. Use all remaining non-*blank* lines to determine the *common leading whitespace*.
   * A blank line contains zero or more whitespace characters followed by a newline.
   * Common leading whitespace is the minimum number of whitespace characters occuring before the first non-whitespace character in a non-blank line.
   * Each whitespace character is counted once regardless of whether it is a space or tab (so care should be taken when mixing whitespace characters).
5. Remove common leading whitespace from each line.

<details>
  <summary>
  Example: multiline_strings2.wdl

  ```wdl
  version 1.2

  workflow multiline_strings2 {
    output {
      # all of these strings evaluate to "hello  world"
      String hw0 = "hello  world"
      String hw1 = <<<hello  world>>>
      String hw2 = <<<   hello  world   >>>
      String hw3 = <<<
          hello  world>>>
      String hw4 = <<<
          hello  world
          >>>
      String hw5 = <<<
          hello  world
      >>>
      # The line continuation causes the newline and all whitespace preceding 'world' to be
      # removed - to put two spaces between 'hello' and world' we need to put them before
      # the line continuation.
      String hw6 = <<<
          hello  \
              world
      >>>

      # This string is not equivalent - the first line ends in two backslashes, which is an
      # escaped backslash, not a line continuation. So this string evaluates to
      # "hello \\\n  world".
      String not_equivalent = <<<
      hello \\
        world
      >>>
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
    "multiline_strings2.hw0": "hello  world",
    "multiline_strings2.hw1": "hello  world",
    "multiline_strings2.hw2": "hello  world",
    "multiline_strings2.hw3": "hello  world",
    "multiline_strings2.hw4": "hello  world",
    "multiline_strings2.hw5": "hello  world",
    "multiline_strings2.hw6": "hello  world",
    "multiline_strings2.not_equivalent": "hello \\\n  world"
  }
  ```
  </p>
</details>

Common leading whitespace is also removed from blank lines that contain whitespace characters; newlines are *not* removed from blank lines. This means blank lines may be used to ensure that a multi-line string begins/ends with a newline.

<details>
  <summary>
  Example: multiline_strings3.wdl

  ```wdl
  version 1.2

  workflow multiline_strings3 {
    output {
      # These strings are all equivalent. In strings B, C, and D, the middle lines are blank and
      # so do not count towards the common leading whitespace determination.

      String multi_line_A = "\nthis is a\n\n  multi-line string\n"

      # This string's common leading whitespace is 0.
      String multi_line_B = <<<

      this is a

        multi-line string

      >>>

      # This string's common leading whitespace is 2. The middle blank line contains two spaces
      # that are also removed.
      String multi_line_C = <<<

        this is a

          multi-line string

      >>>

      # This string's common leading whitespace is 8.
      String multi_line_D = <<<

              this is a

                multi-line string

      >>>
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
    "multiline_strings3.multi_line_A": "\nthis is a\n\n  multi-line string\n",
    "multiline_strings3.multi_line_B": "\nthis is a\n\n  multi-line string\n",
    "multiline_strings3.multi_line_C": "\nthis is a\n\n  multi-line string\n",
    "multiline_strings3.multi_line_D": "\nthis is a\n\n  multi-line string\n"
  }
  ```
  </p>
</details>

Single- and double-quotes do not need to be escaped within a multi-line string.

<details>
  <summary>
  Example: multiline_strings4.wdl

  ```wdl
  version 1.2

  workflow multiline_strings4 {
    output {
      String multi_line_with_quotes = <<<
        multi-line string \
        with 'single' and "double" quotes
      >>>
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
    "multiline_strings4.multi_line_with_quotes": "multi-line string with 'single' and \"double\" quotes"
  }
  ```
  </p>
</details>

## Files and Directories

A `File` or `Directory` declaration may have have a string value indicating a relative or absolute path on the local file system.

### Path Canonicalization and Validation

When a `File` or `Directory` value is created, the following operations are performed:

- **Path Canonicalization.** Intermediate path components are normalized (resolving `.` for current directory and `..` for parent directory segments), symbolic links are resolved to their final targets, and relative paths are converted to their absolute path form. For `Directory` values, trailing directory separators are removed.
- **Path Validation.** The path must exist at value creation time. If the path does not exist, an error occurs immediately. The file/directory must accessible for reading (i.e., assigned the appropriate permissions). Additionally, a `File` value cannot refer to a directory; if the path refers to a directory, an error occurs. Similarly, a `Directory` value cannot refer to a file; if the path refers to a file, an error occurs.

Value creation occurs when the value is materialized as a `File`/`Directory` within the execution engine, including

- When a `File` or `Directory` declaration is evaluated
- When a `String` is coerced to a `File` or `Directory` type

After canonicalization, two `File` or `Directory` values that refer to the same underlying resource are considered equal for all comparison operations, even if they were initialized from different string representations.

```wdl
task literals_paths {
  input {
    File f1 = "/foo/bar.txt"
    File? f2
  }

  # If baz.txt does not exist, this is an error.
  File f3 = "baz.txt"

  # If qux.txt does not exist, this is set to `None`.
  File? f4 = "qux.txt"

  command <<<
    # If the user does not overide the value of `f1`, and /foo/bar.txt
    # does not exist, an error will occur when the `File` value is created.
    cat "~{f1}"

    # If the user does not specify the value of `f2` it's value is `None`,
    # which results in the empty-string when interpolated. `-f ""` is
    # always false.
    if [ -f "~{f2}" ]; then
      echo "~{f2}"
    fi
}
```

Within a WDL file, the execution engine is only required to support literal values for files and directories that are paths local to the execution environment.

During task execution, the following additional constraints apply:

* To write to a file, the path's parent directory must be accessible for writing.
* To write to a directory, it must exist and be accessible for writing.

An execution engine may support [other ways](#) to specify `File` and `Directory` inputs (e.g., as URIs), but prior to task execution it must [localize inputs](#) so that the runtime value of a `File`/`Directory` variable is a local path. Remote files must be treated as read-only. For remote files, localization occurs as part of value creation—the remote file must be accessible and valid when the `File` or `Directory` value is evaluated, at which point it is localized and the resulting local path is validated according to the rules above.

### Relative and Absolute Paths

The interpretation of relative paths (paths that do not start with `/`) depends on the context in which they appear:

* *Outside the `output` section (e.g., in `input` or private declarations)*, relative paths are interpreted relative to the parent directory of the WDL document itself on the host filesystem, similar to how [import](#) paths are resolved.
* *Inside the `output` section*, relative paths are interpreted relative to the task's execution directory. This is where task commands create their output files. See [Task Outputs](#) for details.

In both contexts, if an optional `File?` or `Directory?` declaration refers to a path that does not exist, the value is set to `None`.

Absolute paths (paths starting with `/`) refer to specific locations on the host filesystem when used outside the `output` section. Within the `output` section, absolute paths may be interpreted in a container-dependent way—see [Task Outputs](#) for details.

<details>
<summary>
Example: relative_paths_context.wdl

```wdl
version 1.2

task relative_paths_context {
  # This relative path is resolved relative to the WDL document's parent directory.
  File input_file = "data/hello.txt"

  command <<<
    cat ~{input_file} > output.txt
  >>>

  output {
    # This relative path is resolved relative to the execution directory.
    File result = "output.txt"
    String content = read_string(result)
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
  "relative_paths_context.result": "hello.txt"
  "relative_paths_context.content": "hello"
}
```

Test config:

```json
{
  "exclude_outputs": ["result"]
}
```

</p>
</details>

In this example,

- The `input_file` input uses a relative path that refers to a file co-located with the WDL document on the host filesystem.
- The `result` output uses a relative path that refers to a file created by the command in the execution directory.
