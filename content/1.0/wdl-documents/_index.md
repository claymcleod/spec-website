+++
title = "WDL Documents"
description = "WDL document structure, versioning, and imports"
sort_by = "weight"
weight = 35
+++

## Document

```wdl
$document = ($import | $task | $workflow)+
```

`$document` is the root of the parse tree and it consists of one or more import statement, task, or workflow definition
