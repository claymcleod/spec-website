+++
title = "Appendix A: WDL Value Serialization and Deserialization"
weight = 10
+++

This section provides suggestions for ways to deal with primitive and compound values in the task [command section](@/1.3/tasks/command.md). When a WDL execution engine instantiates a command specified in the `command` section of a task, it must evaluate all expression placeholders (`~{...}` and `${...}`) in the command and coerce their values to strings. There are multiple different ways that WDL values can be communicated to the command(s) being called in the `command` section, and the best method will vary by command.

For example, a task that wraps a tool that operates on an `Array` of FASTQ files has several ways that it can specify the list of files to the tool:

* A file containing one file path per line, e.g. `Rscript analysis.R --files=fastq_list.txt`
* A file containing a JSON list, e.g. `Rscript analysis.R --files=fastq_list.json`
* Enumerated on the command line, e.g. `Rscript analysis.R 1.fastq 2.fastq 3.fastq`

On the other end, command line tools will output results in files or to standard output, and these outputs need to be converted to WDL values to be used as task outputs. For example, the FASTQ processor task mentioned above outputs a mapping of the input files to the number of reads in each file. This output might be represented as a two-column TSV or as a JSON object, both of which would need to be deserialized to a WDL `Map[File, Int]` value.

The various methods for serializing and deserializing primitive and compound values are enumerated below.

## Primitive Values

WDL primitive values are naturally converted to string values. This is described in detail in the [string interpolation](@/1.3/types/primitive-types/strings.md) section.

Deserialization of primitive values is done via one of the `read_*` functions, each of which deserializes a different type of primitive value from a file. The file must contain a single value of the expected type, with optional whitespace. The value is read as a string and then converted to the appropriate type, or raises an error if the value cannot be converted.

<details>
<summary>
Example: read_write_primitives_task.wdl

```wdl
version 1.3

task read_write_primitives {
  input {
    String s
    Int i
  }

  command <<<
  printf ~{s} > str_file
  printf ~{i} > int_file
  >>>

  output {
    String sout = read_string("str_file")
    String istr = read_string("int_file")
    Int iout = read_int("int_file")
    # This would cause an error since "hello" cannot be converted to an Int:
    #Int sint = read_int("str_file")
  }
  
  requirements {
    container: "ubuntu:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "read_write_primitives.s": "hello",
  "read_write_primitives.i": 42
}
```

Example output:

```json
{
  "read_write_primitives.sout": "hello",
  "read_write_primitives.istr": "42",
  "read_write_primitives.iout": 42
}
```
</p>
</details>

## Compound Values

A compound value such as `Array` or `Map` must be serialized to a string before it can be used in the command. There are a two general strategies for converting a compound value to a string:

* JSON: most compound values can be written to JSON format using [`write_json`](@/1.3/standard-library/file-functions/write_json.md).
* Delimitation: convert each element of the compound value to a string, then join them together into a single string using a delimiter. Some common approaches are:
    * Separate values by a tool-specific delimiter (e.g., whitespace or comma) and pass the string as a single command line argument. This can be accomplished with the [`sep`](@/1.3/standard-library/array-string-functions/sep.md) function.
    * Prefix each value with a command line option. This can be accomplished with the [`prefix`](@/1.3/standard-library/array-string-functions/prefix.md) function.
    * Separate values by newlines (`\n`) and write them to a file. This can be accomplished with the [`write_lines`](@/1.3/standard-library/file-functions/write_lines.md) function.
    * For nested types such as `Struct`s and `Object`, separate the fields of each value with a tab (`\t`), and write each tab-delimited line to a file. This is commonly called tab_separated value (TSV) format. This can be accomplished using [`write_tsv`](@/1.3/standard-library/file-functions/write_tsv.md), [`write_map`](@/1.3/standard-library/file-functions/write_map.md), [`write_object`](@/1.3/standard-library/file-functions/write_object.md), or [`write_objects`](@/1.3/standard-library/file-functions/write_objects.md).

Similarly, data output by a command must be deserialized to be used in WDL. Commands generally either write output to `stdout` (or sometimes `stderr`) or to a regular file. The contents of `stdout` and `stderr` can be read a files using the [`stdout`](@/1.3/standard-library/file-functions/stdout.md) and [`stderr`](@/1.3/standard-library/file-functions/stderr.md) functions. The two general strategies for deserializing data from a file are:

* If the output is in JSON format, it can be read into a WDL value using [`read_json`](@/1.3/standard-library/file-functions/read_json.md).
* If the output is line-oriented (i.e., one value per line), it can be read into a WDL `Array` using [`read_lines`](@/1.3/standard-library/file-functions/read_lines.md).
* If the output is tab-delimited (TSV), it can be read into a structured value using [`read_tsv`](@/1.3/standard-library/file-functions/read_tsv.md), [`read_map`](@/1.3/standard-library/file-functions/read_map.md), [`read_object`](@/1.3/standard-library/file-functions/read_object.md), or [`read_objects`](@/1.3/standard-library/file-functions/read_objects.md).

Specific examples of serializing and deserializing each type of compound value are given below.

### Array

#### Array serialization by delimitation

This method applies to an array of a primitive type. Each element of the array is coerced to a string, and the strings are then joined into a single string separated by a delimiter. This is done using the [`sep`](@/1.3/standard-library/array-string-functions/sep.md) function.

<details>
<summary>
Example: serialize_array_delim_task.wdl

```wdl
version 1.3

task serialize_array_delim {
  input {
    File infile
    Array[Int] counts
  }

  Array[String] args = squote(prefix("-n", counts))

  command <<<
  for arg in ~{sep(" ", args)}; do
    head $arg ~{infile}
  done
  >>>
  
  output {
    Array[String] heads = read_lines(stdout())
  }

  requirements {
    container: "ubuntu:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serialize_array_delim.infile": "data/greetings.txt",
  "serialize_array_delim.counts": [1, 2]
}
```

Example output:

```json
{
  "serialize_array_delim.heads": [
    "hello world",
    "hello world",
    "hi_world"
  ]
}
```
</p>
</details>

Given an array `[1, 2]`, the instantiated command would be:

```sh
for arg in '-n1' '-n2'; do
  head $arg greetings.txt
done
```

#### Array serialization/deserialization using `write_lines()`/`read_lines()`

This method applies to an array of a primitive type. Using `write_lines`, Each element of the array is coerced to a string, and the strings are written to a file, one element per line. Using `read_lines`, each line of the file is read as a `String` and coerced to the target type.

<details>
<summary>
Example: serde_array_lines_task.wdl

```wdl
version 1.3

task serde_array_lines {
  input {
    File infile
    Array[String] patterns
  }

  command <<<
  while read -r pattern; do
    grep -c "$pattern" ~{infile}
  done < ~{write_lines(patterns)}
  >>>

  output {
    Array[String] matches = read_lines(stdout())
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_array_lines.infile": "data/greetings.txt",
  "serde_array_lines.patterns": ["hello", "world"]
}
```

Example output:

```json
{
  "serde_array_lines.matches": ["2", "2"]
}
```
</p>
</details>

Given an array of patterns `["hello", "world"]`, the instantiated command would be:

```sh
while read pattern; do
  grep "$pattern" greetings.txt | wc -l
done < /jobs/564758/patterns
```

Where `/jobs/564758/patterns` contains:

```txt
hello
world
```

#### Array serialization/deserialization using `write_json()`/`read_json()`

This method applies to an array of any type that can be serialized to JSON. Calling [`write_json`](@/1.3/standard-library/file-functions/write_json.md) with an `Array` parameter results in the creation of a file containing a JSON array.

<details>
<summary>
Example: serde_array_json_task.wdl

```wdl
version 1.3

task serde_array_json {
  input {
    Map[String, Int] string_to_int
  }

  command <<<
    python <<CODE
    import json
    import sys
    with open("~{write_json(string_to_int)}") as j:
      d = json.load(j)
      json.dump(list(d.keys()), sys.stdout)
    CODE
  >>>

  output {
    Array[String] keys = read_json(stdout())
  }
  
  requirements {
    container: "python:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_array_json.string_to_int": {
    "a": 1,
    "b": 2
  }
}
```

Example output:

```json
{
  "serde_array_json.keys": ["a", "b"]
}
```
</p>
</details>

Given the `Map` `{"a": 1, "b": 2}`, the instantiated command would be:

```python
import json
import sys
with open("/jobs/564758/string_to_int.json") as j:
  d = json.load(j)
  json.dump(list(d.keys()), sys.stdout)
```

Where `/jobs/564758/string_to_int.json` would contain:

```json
{
  "a": 1,
  "b": 2
}
```

### Pair

A `Pair` cannot be directly serialized to a `String`, nor can it be deserialized from a string or a file.

The most common approach to `Pair` serialization is to serialize the `left` and `right` values separately, e.g., by converting each to a `String` or writing each to a separate file using one of the `write_*` functions. Similarly, two values can be deserialized independently and then used to create a `Pair`.

<details>
<summary>
Example: serde_pair.wdl

```wdl
version 1.3

task tail {
  input {
    Pair[File, Int] to_tail
  }

  command <<<
  tail -n ~{to_tail.right} ~{to_tail.left}
  >>>

  output {
    Array[String] lines = read_lines(stdout())
  }
}

workflow serde_pair {
  input {
    Map[File, Int] to_tail
  }

  scatter (item in as_pairs(to_tail)) {
    call tail {
      to_tail = item
    }
    Pair[String, String]? two_lines = 
      if item.right >= 2 then (tail.lines[0], tail.lines[1]) else None
  }

  output {
    Map[String, String] tails_of_two = as_map(select_all(two_lines))
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_pair.to_tail": {
    "data/cities.txt": 2,
    "data/hello.txt": 1
  }
}
```

Example output:

```json
{
  "serde_pair.tails_of_two": {
    "Chicago": "Piscataway"
  }
}
```
</p>
</details>

#### Homogeneous Pair serialization/deserialization as Array

A homogeneous `Pair[X, X]` can be converted to/from an `Array` and then serialized/deserialized by any of the methods in the previous section.

<details>
<summary>
Example: serde_homogeneous_pair.wdl

```wdl
version 1.3

task serde_int_strings {
  input {
    Pair[String, String] int_strings
  }

  Array[String] pair_array = [int_strings.left, int_strings.right]

  command <<<
  cat ~{write_lines(pair_array)}
  >>>

  output {
    Array[String] ints = read_lines(stdout())
  }
}

workflow serde_homogeneous_pair {
  input {
    Map[String, String] int_strings
  }

  scatter (pair in as_pairs(int_strings)) {
    call serde_int_strings { int_strings = pair }
  }

  output {
    Array[String] ints = flatten(serde_int_strings.ints)
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_homogeneous_pair.int_strings": {
    "1": "2",
    "3": "4"
  }
}
```

Example output:

```json
{
  "serde_homogeneous_pair.ints": ["1", "2", "3", "4"]
}
```
</p>
</details>

#### Pair serialization/deserialization using `read_json`/`write_json`

A `Pair[X, Y]` can be [converted to JSON](@/1.3/input-output/json-serialization.md) and then serialized using [`write_json`](@/1.3/standard-library/file-functions/write_json.md) and deserialized using [`read_json`](@/1.3/standard-library/file-functions/read_json.md).

### Map

#### Map serialization by delimitation

A `Map` is a common way to represent a set of arguments that need to be passed to a command. Each key/value pair can be converted to a `String` using a `scatter`, or the keys and value can be independently converted to Bash arrays and referenced by index.

<details>
<summary>
Example: serialize_map.wdl

```wdl
version 1.3

task grep1 {
  input {
    File infile
    String pattern
    Array[String] args
  }

  command <<<
  grep ~{sep(" ", args)} ~{pattern} ~{infile}
  >>>
  
  output {
    Array[String] results = read_lines(stdout())
  }
}

task grep2 {
  input {
    File infile
    String pattern
    Map[String, String] args
  }

  Pair[Array[String], Array[String]] opts_and_values = unzip(as_pairs(args))
  Int n = length(opts_and_values.left)

  command <<<
  opts=( ~{sep(" ", quote(opts_and_values.left))} )
  values=( ~{sep(" ", quote(opts_and_values.right))} )
  command="grep"
  for i in {0..~{n-1}}; do
    command="$command ${opts[i]}"="${values[i]}"
  done
  $command ~{pattern} ~{infile}
  >>>

  output {
    Array[String] results = read_lines(stdout())
  }
}

workflow serialize_map {
  input {
    File infile
    String pattern
    Map[String, String] args
  }

  scatter (arg in as_pairs(args)) {
    String arg_str = "~{arg.left}=~{arg.right}"
  }

  call grep1 { infile, pattern, args = arg_str }

  call grep2 { infile, pattern, args }

  output {
    Array[String] results1 = grep1.results
    Array[String] results2 = grep2.results
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serialize_map.infile": "data/greetings.txt",
  "serialize_map.pattern": "hello",
  "serialize_map.args": {
    "--after-context": "1",
    "--max-count": "1"
  }
}
```

Example output:

```json
{
  "serialize_map.results1": ["hello world", "hi_world"],
  "serialize_map.results2": ["hello world", "hi_world"]
}
```
</p>
</details>

#### Map serialization/deserialization using `write_map()`/`read_map()`

A `Map[String, String]` value can be serialized as a two-column TSV file using [`write_map`](@/1.3/standard-library/file-functions/write_map.md), and deserialized from a two-column TSV file using [`read_map`](@/1.3/standard-library/file-functions/read_map.md).

<details>
<summary>
Example: serde_map_tsv_task.wdl

```wdl
version 1.3

task serde_map_tsv {
  input {
    Map[String, String] items
  }

  File item_file = write_map(items)

  command <<<
  cut -f 1 ~{item_file} >> lines
  cut -f 2 ~{item_file} >> lines
  paste -s -d '\t\n' lines
  >>>

  output {
    Map[String, String] new_items = read_map(stdout())
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_map_tsv.items": {
    "a": "b",
    "c": "d",
    "e": "f"
  }
}
```

Example output:

```json
{
  "serde_map_tsv.new_items": {
    "a": "c",
    "e": "b",
    "d": "f"
  }
}
```
</p>
</details>

Given a `Map` `{ "a": "b", "c": "d", "e": "f" }`, the instantiated command would be:

```sh
cut -f 1 /jobs/564757/item_file >> lines
cut -f 2 /jobs/564757/item_file >> lines
paste -s -d '\t\n' lines
```

Where `/jobs/564757/item_file` would contain:

```txt
a\tb
c\td
e\tf
```

And the created `lines` file would contain:

```txt
a\tc,
e\tb,
d\tf
```

Which is deserialized to the `Map` `{"a": "c", "e": "b", "d": "f"}`.

#### Map serialization/deserialization using `write_json()`/`read_json()`

A `Map[String, Y]` value can be serialized as a JSON `object` using [`write_json`](@/1.3/standard-library/file-functions/write_json.md), and a JSON object can be read into a `Map[String, Y]` using [`read_json`](@/1.3/standard-library/file-functions/read_json.md) so long as all the values of the JSON object are coercible to `Y`.

<details>
<summary>
Example: serde_map_json_task.wdl

```wdl
version 1.3

task serde_map_json {
  input {
    Map[String, Int] read_quality_scores
  }

  command <<<
    python <<CODE
    import json
    import sys
    with open("~{write_json(read_quality_scores)}") as j:
      d = json.load(j)
      for key in d.keys():
        d[key] += 33
      json.dump(d, sys.stdout)
    CODE
  >>>

  output {
    Map[String, Int] ascii_values = read_json(stdout())
  }

  requirements {
    container: "python:latest"
  }
}
```
</summary>
<p>
Example input:

```json
{
  "serde_map_json.read_quality_scores": {
    "read1": 32,
    "read2": 41,
    "read3": 55
  }
}
```

Example output:

```json
{
  "serde_map_json.ascii_values": {
    "read1": 65,
    "read2": 74,
    "read3": 88
  }
}
```
</p>
</details>

Given a `Map` `{ "read1": 32, "read2": 41, "read3": 55 }`, the instantiated command would be:

```python
import json
import sys
with open("/jobs/564757/sample_quality_scores.json") as j:
  d = json.load(j)
  for key in d.keys():
    d[key] += 33
  json.dump(d, sys.stdout)
```

Where `/jobs/564757/sample_quality_scores.json` would contain:

```json
{
  "read1": 32,
  "read2": 41,
  "read3": 55,
}
```

### Struct and Object serialization/deserialization

There are two alternative serialization formats for `Struct`s and `Objects:

* JSON: `Struct`s and `Object`s are serialized identically using [`write_json`](@/1.3/standard-library/file-functions/write_json.md). A JSON object is deserialized to a WDL `Object` using [`read_json`](@/1.3/standard-library/file-functions/read_json.md), which can then be coerced to a `Struct` type if necessary.
* TSV: `Struct`s and `Object`s can be serialized to TSV format using [`write_object`](@/1.3/standard-library/file-functions/write_object.md). The generated file has two lines tab-delimited: a header with the member names and the values, which must be coercible to `String`s. An array of `Struct`s or `Object`s can be written using [`write_objects`](@/1.3/standard-library/file-functions/write_objects.md), in which case the generated file has one line of values for each struct/object. `Struct`s and `Object`s can be deserialized from the same TSV format using [`read_object`](@/1.3/standard-library/file-functions/read_object.md)/[`read_objects`](@/1.3/standard-library/file-functions/read_objects.md). Object member values are always of type `String` whereas struct member types must be coercible from `String`.
