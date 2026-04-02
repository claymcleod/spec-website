+++
title = "Strings"
description = "String types, escape sequences, and multi-line strings in WDL"
weight = 110
+++

A string literal may contain any unicode characters between single or double-quotes, with the exception of a few special characters that must be escaped:

| Escape Sequence | Meaning | \x Equivalent | Context |
|-|-|-|-|
| `\\` | `\` | `\x5C` | |
| `\n` | newline | `\x0A` | |
| `\t` | tab | `\x09` | |
| `\'` | single quote | `\x22` | within a single-quoted string |
| `\"` | double quote | `\x27` | within a double-quoted string |
| `\~` | tilde | `\x7E` | literal `"~{"` |
| `\$` | dollar sign | `\x24` | literal `"${"` |

Strings can also contain the following types of escape sequences:

* An octal escape code starts with `\`, followed by 3 digits of value 0 through 7 inclusive.
* A hexadecimal escape code starts with `\x`, followed by 2 hexadecimal digits `0-9a-fA-F`.
* A unicode code point starts with `\u` followed by 4 hexadecimal characters or `\U` followed by 8 hexadecimal characters `0-9a-fA-F`.

## Multi-line Strings

Strings that begin with `<<<` and end with `>>>` may span multiple lines.

Example: multiline_strings1.wdl


  ```wdl
  version 1.3

  workflow multiline_strings1 {
    output {
      String s = <<<
        This is a
        multi-line string!
      >>>
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
    "multiline_strings1.s": "This is a\nmulti-line string!"
  }
  ```


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

Example: multiline_strings2.wdl


  ```wdl
  version 1.3

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


<details>
<summary></summary>


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


</details>

Common leading whitespace is also removed from blank lines that contain whitespace characters; newlines are *not* removed from blank lines. This means blank lines may be used to ensure that a multi-line string begins/ends with a newline.

Example: multiline_strings3.wdl


  ```wdl
  version 1.3

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


<details>
<summary></summary>


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


</details>

Single- and double-quotes do not need to be escaped within a multi-line string.

Example: multiline_strings4.wdl


  ```wdl
  version 1.3

  workflow multiline_strings4 {
    output {
      String multi_line_with_quotes = <<<
        multi-line string \
        with 'single' and "double" quotes
      >>>
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
    "multiline_strings4.multi_line_with_quotes": "multi-line string with 'single' and \"double\" quotes"
  }
  ```


</details>
