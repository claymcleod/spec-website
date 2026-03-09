+++
title = "write_tsv"
description = "Write a 2D array as a TSV file"
weight = 140
+++

```
File write_tsv(Array[Array[String]])
```

Given something that's compatible with `Array[Array[String]]`, this writes a TSV file of the data structure.

**Parameters**

1. `Array[Array[String]]`: The 2D array of strings to write.

**Returns**: A `File` containing the data in TSV format.

<details>
<summary>
Example: write_tsv_task.wdl

```wdl
task example {
  Array[String] array = [["one", "two", "three"], ["un", "deux", "trois"]]
  command {
    ./script --tsv=${write_tsv(array)}
  }
}
```
</summary>
<p>

If this task were run, the command might look like:

```
./script --tsv=/local/fs/tmp/array.tsv
```

And `/local/fs/tmp/array.tsv` would contain:

```
one	two	three
un	deux	trois
```

</p>
</details>
