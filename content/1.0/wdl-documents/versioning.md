+++
title = "Versioning"
weight = 10
+++

For portability purposes it is critical that WDL documents be versioned so an engine knows how to process it. From `draft-3` forward, the first line of all WDL files must be a `version` statement, for example

```wdl
version draft-3
```

Any WDL files which do not have a `version` field must be treated as `draft-2`.  All WDL files used by a workflow must have the same version.
