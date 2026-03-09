+++
title = "Import Statements"
weight = 20
+++

A WDL file may contain import statements to include WDL code from other sources

```wdl
$import = 'import' $ws+ $string ($ws+ 'as' $ws+ $identifier)?
```

The import statement specifies that `$string` which is to be interpted as a URI which points to a WDL file.  The engine is responsible for resolving the URI and downloading the contents.  The contents of the document in each URI must be WDL source code.

Every imported WDL file requires a namespace which can be specified using an identifier (via the `as $identifier` syntax). If you do not explicitly specify a namespace identifier then the default namespace is the filename of the imported WDL, minus the .wdl extension.
For all imported WDL files, the tasks and workflows imported from that file will only be accessible through that assigned [namespace](@/1.0/appendices/appendix-b.md).

```wdl
import "http://example.com/lib/analysis_tasks" as analysis
import "http://example.com/lib/stdlib"


workflow wf {
  input {
    File bam_file
  }
  # file_size is from "http://example.com/lib/stdlib"
  call stdlib.file_size {
    input: file=bam_file
  }
  call analysis.my_analysis_task {
    input: size=file_size.bytes, file=bam_file
  }
}
```

Engines should at the very least support the following protocols for import URIs:

* `http://` and `https://`
* `file://`
* no protocol (which should be interpreted as `file://`
