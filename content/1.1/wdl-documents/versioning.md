+++
title = "Versioning"
description = "WDL version statements and compatibility"
weight = 10
+++

There are multiple versions of the WDL specification. Every WDL document must include a version statement to specify which version (major and minor) of the specification it adheres to. From `draft-3` forward, the first non-comment statement of all WDL files must be a `version` statement. For example:

```wdl
version 1.1
```

or

```wdl
#Licence header

version 1.1
```

A WDL file that does not have a `version` statement must be treated as [`draft-2`](https://github.com/openwdl/wdl/blob/main/versions/draft-2/SPEC.md).

Because patches to the WDL specification do not change any functionality, all revisions that carry the same major and minor version numbers are considered equivalent. For example, `version 1.1` is used for a WDL document that adheres to the `1.1.x` specification, regardless of the value of `x`.
