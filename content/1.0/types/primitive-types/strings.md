+++
title = "Strings"
weight = 10
+++

A string literal may contain any characters between single or double-quotes. The string grammar is defined in the [Syntax](@/1.0/syntax/_index.md) section.

`$string` can accept the following between single or double-quotes:

* Any character not in set: `\\`, `"` (or `'` for single-quoted string), `\n`
* An escape sequence starting with `\\`, followed by one of the following characters: `\\`, `"`, `'`, `[nrbtfav]`, `?`
* An escape sequence starting with `\\`, followed by 1 to 3 digits of value 0 through 7 inclusive. This specifies an octal escape code.
* An escape sequence starting with `\\x`, followed by hexadecimal characters `0-9a-fA-F`. This specifies a hexadecimal escape code.
* An escape sequence starting with `\\u` or `\\U` followed by either 4 or 8 hexadecimal characters `0-9a-fA-F`. This specifies a unicode code point.
