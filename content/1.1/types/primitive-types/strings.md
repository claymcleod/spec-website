+++
title = "Strings"
description = "String literals and escape sequences in WDL"
weight = 110
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
