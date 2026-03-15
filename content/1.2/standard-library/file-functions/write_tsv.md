+++
title = "write_tsv"
description = "Write TSV file"
weight = 140
+++

```
File write_tsv(Array[Array[String]]|Array[Struct])
File write_tsv(Array[Array[String]], true, Array[String])
File write_tsv(Array[Struct], Boolean, Array[String])
```
Given an `Array` of elements, writes a tab-separated value (TSV) file with one line for each element.

There are three variants of this function:

1. `File write_tsv(Array[Array[String]])`: Each element is concatenated using a tab ('\t') delimiter and written as a row in the file. There is no header row.

2. `File write_tsv(Array[Array[String]], true, Array[String])`: The second argument must be `true` and the third argument provides an `Array` of column names. The column names are concatenated to create a header that is written as the first row of the file. All elements must be the same length as the header array.

3. `File write_tsv(Array[Struct], [Boolean, [Array[String]]])`: Each element is a struct whose field values are concatenated in the order the fields are defined. The optional second argument specifies whether to write a header row. If it is `true`, then the header is created from the struct field names. If the second argument is `true`, then the optional third argument may be used to specify column names to use instead of the struct field names.

Each line is terminated by the newline (`\n`) character. 

The generated file should be given a random name and written in a temporary directory, so as not to conflict with any other task output files.

If the entire contents of the file can not be written for any reason, the calling task or workflow fails with an error. Examples of failure include, but are not limited to, insufficient disk space to write the file.


**Parameters**

1. `Array[Array[String]] | Array[Struct]`: An array of rows, where each row is either an `Array` of column values or a struct whose values are the column values.
2. `Boolean`: (Optional) Whether to write a header row.
3. `Array[String]`: An array of column names. If the first argument is `Array[Array[String]]` and the second argument is `true` then it is required, otherwise it is optional. Ignored if the second argument is `false`.


**Returns**: A `File`.

Example: write_tsv_task.wdl


```wdl
version 1.2

struct Numbers {
  String first
  String second
  String third
}

task write_tsv {
  input {
    Array[Array[String]] array = [["one", "two", "three"], ["un", "deux", "trois"]]
    Array[Numbers] structs = [
      Numbers {
        first: "one",
        second: "two",
        third: "three"
      },
      Numbers {
        first: "un",
        second: "deux",
        third: "trois"
      }
    ]
  }

  command <<<
    cut -f 1 ~{write_tsv(array)} >> array_no_header.txt
    cut -f 1 ~{write_tsv(array, true, ["first", "second", "third"])} > array_header.txt
    cut -f 1 ~{write_tsv(structs)} >> structs_default.txt
    cut -f 2 ~{write_tsv(structs, false)} >> structs_no_header.txt
    cut -f 2 ~{write_tsv(structs, true)} >> structs_header.txt
    cut -f 3 ~{write_tsv(structs, true, ["no1", "no2", "no3"])} >> structs_user_header.txt
  >>>

  output {
    Array[String] array_no_header = read_lines("array_no_header.txt")
    Array[String] array_header = read_lines("array_header.txt")
    Array[String] structs_default = read_lines("structs_default.txt")
    Array[String] structs_no_header = read_lines("structs_no_header.txt")
    Array[String] structs_header = read_lines("structs_header.txt")
    Array[String] structs_user_header = read_lines("structs_user_header.txt")

  }
  
  requirements {
    container: "ubuntu:latest"
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
  "write_tsv.array_no_header": ["one", "un"],
  "write_tsv.array_header": ["first", "one", "un"],
  "write_tsv.structs_default": ["one", "un"], 
  "write_tsv.structs_no_header": ["two", "deux"], 
  "write_tsv.structs_header": ["second", "two", "deux"], 
  "write_tsv.structs_user_header": ["no3", "three", "trois"]

}
```


</details>

The actual command line might look like:

```sh
cut -f 1 /local/fs/tmp/array.tsv
```

And `/local/fs/tmp/array.tsv` would contain:

```txt
one\ttwo\tthree
un\tdeux\ttrois
```

