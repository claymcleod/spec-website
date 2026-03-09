+++
title = "Extended File/Directory Input/Output Format"
weight = 30
+++

There is no guarantee that executing a workflow multiple times with the same input file or directory URIs will result in the same outputs. For example the contents of a file may change between one execution and the next, or a file may be added to or removed from a directory.

To help ensure the reproducibility of workflow executions, and to support job output reuse features of the runtime engine (sometimes called "call caching"), it is strongly recommended that runtime engines support the more explicit extended format for `File` and `Directory` inputs and outputs.

In the extended format, `File` and `Directory` inputs and outputs may be specified using either a JSON string or object.

A directory object has the following attributes:

* `type`: Always "Directory"; optional for the top-level inputs/outputs but required within directory listings.
* `location`: The directory URI. This is equivalent to the string value in the simple form. May be absent if the directory is within a listing as long as `basename` is specified. If location is not specified, then `basename` and `listing` are both required, and all files/directories in the listing must have a location that is an absolute path or URI.
* `basename`: The name of the directory relative to the containing directory. If the basename differs from the actual directory name at the given location, the file must be localized with the given basename.
* `listing`: An array of files/subdirectories within the directory. May be nested to any degree.

A file object has the following attributes:

* `type`: Always "File"; optional for top-level inputs/outputs but required within directory listings.
* `location`: The file URI. This is equivalent to the string value in the simple form. May be absent if the file is within a listing so long as `basename` is specified.
* `basename`: The name of the file relative to the containing directory. If the basename differs from the actual file name at the given location, the file must be localized with the given basename.

It is recommended that the runtime engine support additional attributes to promote reproducibility, such as a file checksum.

The following example shows a directory input in extended format. The directory listing makes explicit the structure of the directory. If a file were added to the source directory between one execution and the next, the new file would be ignored since it doesn't appear in the listing. If a file were removed from the source directory between one execution and the next, the workflow execution would fail because the input directory would not match the expected structure.

```json
{
  "wf.indir": {
    "location": "/mnt/data/results/foo",
    "listing": [
      {
        "type": "File",
        "location": "/mnt/data/results/foo/bar.txt",
        "basename": "something_else.txt"
      },
      {
        "type": "Directory",
        "basename": "baz",
        "listing": [
          {
            "type": "File",
            "basename": "qux.fa"
          }
        ]
      }
    ]
  }
}
```

When this directory is localized, it will result in the following local folder structure:

```
<workdir>
|_ foo
   |_ something_else.txt
   |_ baz
      |_ qux.fa
```

A directory listing can also be used to construct an input directory from files that originate from disparate locations. The following input would result in the same local directory structure as above:

```json
{
  "wf.indir": {
    "basename": "foo",
    "listing": [
      {
        "type": "File",
        "location": "/mnt/data/results/foo/bar.txt",
        "basename": "something_else.txt"
      },
      {
        "type": "Directory",
        "basename": "baz",
        "listing": [
          {
            "type": "File",
            "location": "/home/fred/qux.fa"
          }
        ]
      }
    ]
  }
}
```
