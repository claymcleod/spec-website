+++
title = "Syntax"
description = "WDL syntax rules: whitespace, comments, keywords, and literals"
sort_by = "weight"
weight = 15
+++

# Language Specification

## Global Grammar Rules

### Whitespace, Strings, Identifiers, Constants

These are common among many of the following sections

```wdl
$ws = (0x20 | 0x9 | 0xD | 0xA)+
$identifier = [a-zA-Z][a-zA-Z0-9_]+
$string = "([^\\\"\n]|\\[\\"\'nrbtfav\?]|\\[0-7]{1,3}|\\x[0-9a-fA-F]+|\\[uU]([0-9a-fA-F]{4})([0-9a-fA-F]{4})?)*"
$string = '([^\\\'\n]|\\[\\"\'nrbtfav\?]|\\[0-7]{1,3}|\\x[0-9a-fA-F]+|\\[uU]([0-9a-fA-F]{4})([0-9a-fA-F]{4})?)*'
$boolean = 'true' | 'false'
$integer = [1-9][0-9]*|0[xX][0-9a-fA-F]+|0[0-7]*
$float = (([0-9]+)?\.([0-9]+)|[0-9]+\.|[0-9]+)([eE][-+]?[0-9]+)?
```

`$string` can accept the following between single or double-quotes:

* Any character not in set: `\\`, `"` (or `'` for single-quoted string), `\n`
* An escape sequence starting with `\\`, followed by one of the following characters: `\\`, `"`, `'`, `[nrbtfav]`, `?`
* An escape sequence starting with `\\`, followed by 1 to 3 digits of value 0 through 7 inclusive.  This specifies an octal escape code.
* An escape sequence starting with `\\x`, followed by hexadecimal characters `0-9a-fA-F`.  This specifies a hexidecimal escape code.
* An escape sequence starting with `\\u` or `\\U` followed by either 4 or 8 hexadecimal characters `0-9a-fA-F`.  This specifies a unicode code point
