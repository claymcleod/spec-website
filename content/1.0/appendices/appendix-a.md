+++
title = "Appendix A: Serialization"
weight = 10
+++

## Data Types & Serialization

Tasks and workflows are given values for their input parameters in order to run.  The type of each of those input parameters are declarations on the `task` or `workflow`.  Those input parameters can be any valid type:

Primitive Types:

* String
* Int
* Float
* File
* Boolean

Compound Types:

* Array
* Map
* Object
* Pair

When a WDL workflow engine instantiates a command specified in the `command` section of a `task`, it must serialize all `${...}` tags in the command into primitive types.

For example, if I'm writing a tool that operates on a list of FASTQ files, there are a variety of ways that this list can be passed to that task:

* A file containing one file path per line (e.g. `Rscript analysis.R --files=fastq_list.txt`)
* A file containing a JSON list (e.g. `Rscript analysis.R --files=fastq_list.json`)
* Enumerated on the command line (e.g. (`Rscript analysis.R 1.fastq 2.fastq 3.fastq`)

Each of these methods has its merits and one method might be better for one tool while another method would be better for another tool.

On the other end, tasks need to be able to communicate data structures back to the workflow engine.  For example, let's say this same tool that takes a list of FASTQs wants to return back a `Map[File, Int]` representing the number of reads in each FASTQ.  A tool might choose to output it as a two-column TSV or as a JSON object and WDL needs to know how to convert that to the proper data type.

WDL provides some [standard library functions](@/1.0/standard-library/_index.md) for converting compound types like `Array` into primitive types, like `File`.

When a task finishes, the `output` section defines how to convert the files and stdout/stderr into WDL types.  For example,

```wdl
task test {
  input {
    Array[File] files
  }
  command {
    Rscript analysis.R --files=${sep=',' files}
  }
  output {
    Array[String] strs = read_lines(stdout())
  }
}
```

Here, the expression `read_lines(stdout())` says "take the output from stdout, break into lines, and return that result as an Array[String]".  See the definition of `read_lines` and `stdout` for more details.

## Serialization of Task Inputs

### Primitive Types

Serializing primitive inputs into strings is intuitively easy because the value is just turned into a string and inserted into the command line.

Consider this example:

```wdl
task output_example {
  input {
    String s
    Int i
    Float f
  }

  command {
    python do_work.py ${s} ${i} ${f}
  }
}
```

If I provide values for the declarations in the task as:

|var|value|
|-|-|
|s  |"str"|
|i  |2    |
|f  |1.3  |

Then, the command would be instantiated as:

```
python do_work.py str 2 1.3
```

### Compound Types

Compound types, like `Array` and `Map` must be converted to a primitive type before it can be used in the command.  There are many ways to turn a compound types into primitive types, as laid out in following sections

#### Array serialization

Arrays can be serialized in two ways:

* **Array Expansion**: elements in the list are flattened to a string with a separator character.
* **File Creation**: create a file with the elements of the array in it and passing that file as the parameter on the command line.

##### Array serialization by expansion

The array flattening approach can be done if a parameter is specified as `${sep=' ' my_param}`.  `my_param` must be declared as an `Array` of primitive types.  When the value of `my_param` is specified, then the values are joined together with the separator character (a space in this case).  For example:

```wdl
task test {
  input {
    Array[File] bams
  }
  command {
    python script.py --bams=${sep=',' bams}
  }
}
```

If passed an array for the value of `bams`:

|Element|
|-|
|/path/to/1.bam|
|/path/to/2.bam|
|/path/to/3.bam|

Would produce the command `python script.py --bams=/path/to/1.bam,/path/to/2.bam,/path/to/1.bam`

##### Array serialization using write_lines()

An array may be turned into a file with each element in the array occupying a line in the file.

```wdl
task test {
  input {
    Array[File] bams
  }
  command {
    sh script.sh ${write_lines(bams)}
  }
}
```

if `bams` is given this array:

|Element|
|-|
|/path/to/1.bam|
|/path/to/2.bam|
|/path/to/3.bam|

Then, the resulting command line could look like:

```
sh script.sh /jobs/564758/bams
```

Where `/jobs/564758/bams` would contain:

```
/path/to/1.bam
/path/to/2.bam
/path/to/3.bam
```

##### Array serialization using write_json()

The array may be turned into a JSON document with the file path for the JSON file passed in as the parameter:

```wdl
task test {
  input {
    Array[File] bams
  }
  command {
    sh script.sh ${write_json(bams)}
  }
}
```

if `bams` is given this array:

|Element|
|-|
|/path/to/1.bam|
|/path/to/2.bam|
|/path/to/3.bam|

Then, the resulting command line could look like:

```
sh script.sh /jobs/564758/bams.json
```

Where `/jobs/564758/bams.json` would contain:

```json
[
  "/path/to/1.bam",
  "/path/to/2.bam",
  "/path/to/3.bam"
]
```

#### Map serialization

Map types cannot be serialized on the command line directly and must be serialized through a file

##### Map serialization using write_map()

The map type can be serialized as a two-column TSV file and the parameter on the command line is given the path to that file, using the `write_map()` function:

```wdl
task test {
  input {
    Map[String, Float] sample_quality_scores
  }
  command {
    sh script.sh ${write_map(sample_quality_scores)}
  }
}
```

if `sample_quality_scores` is given this Map[String, Float] as:

|Key|Value|
|-|-|
|sample1|98|
|sample2|95|
|sample3|75|

Then, the resulting command line could look like:

```
sh script.sh /jobs/564757/sample_quality_scores.tsv
```

Where `/jobs/564757/sample_quality_scores.tsv` would contain:

```
sample1	98
sample2	95
sample3	75
```

##### Map serialization using write_json()

The map type can also be serialized as a JSON file and the parameter on the command line is given the path to that file, using the `write_json()` function:

```wdl
task test {
  input {
    Map[String, Float] sample_quality_scores
  }
  command {
    sh script.sh ${write_json(sample_quality_scores)}
  }
}
```

if sample_quality_scores is given this map:

|Key|Value|
|-|-|
|sample1|98|
|sample2|95|
|sample3|75|

Then, the resulting command line could look like:

```
sh script.sh /jobs/564757/sample_quality_scores.json
```

Where `/jobs/564757/sample_quality_scores.json` would contain:

```json
{
  "sample1": 98,
  "sample2": 95,
  "sample3": 75
}
```

#### Object serialization

An object is a more general case of a map where the keys are strings and the values are of arbitrary types and treated as strings.  Objects can be serialized with either `write_object()` or `write_json()` functions:

##### Object serialization using write_object()

```wdl
task test {
  input {
    Object sample
  }
  command {
    perl script.pl ${write_object(sample)}
  }
}
```

if sample is provided as:

|Attribute|Value|
|-|-|
|attr1|value1|
|attr2|value2|
|attr3|value3|
|attr4|value4|

Then, the resulting command line could look like:

```
perl script.pl /jobs/564759/sample.tsv
```

Where `/jobs/564759/sample.tsv` would contain:

```
attr1	attr2	attr3	attr4
value1	value2	value3	value4
```

##### Object serialization using write_json()

```wdl
task test {
  input {
    Object sample
  }
  command {
    perl script.pl ${write_json(sample)}
  }
}
```

if sample is provided as:

|Attribute|Value|
|-|-|
|attr1|value1|
|attr2|value2|
|attr3|value3|
|attr4|value4|

Then, the resulting command line could look like:

```
perl script.pl /jobs/564759/sample.json
```

Where `/jobs/564759/sample.json` would contain:

```json
{
  "attr1": "value1",
  "attr2": "value2",
  "attr3": "value3",
  "attr4": "value4",
}
```

#### Array[Object] serialization

`Array[Object]` must guarantee that all objects in the array have the same set of attributes.  These can be serialized with either `write_objects()` or `write_json()` functions, as described in following sections.

##### Array[Object] serialization using write_objects()

an `Array[Object]` can be serialized using `write_objects()` into a TSV file:

```wdl
task test {
  input {
    Array[Object] sample
  }
  command {
    perl script.pl ${write_objects(sample)}
  }
}
```

if sample is provided as:

|Index|Attribute|Value|
|-|-|-|
|0|attr1|value1|
| |attr2|value2|
| |attr3|value3|
| |attr4|value4|
|1|attr1|value5|
| |attr2|value6|
| |attr3|value7|
| |attr4|value8|

Then, the resulting command line could look like:

```
perl script.pl /jobs/564759/sample.tsv
```

Where `/jobs/564759/sample.tsv` would contain:

```
attr1	attr2	attr3	attr4
value1	value2	value3	value4
value5	value6	value7	value8
```

##### Array[Object] serialization using write_json()

an `Array[Object]` can be serialized using `write_json()` into a JSON file:

```wdl
task test {
  input {
    Array[Object] sample
  }
  command {
    perl script.pl ${write_json(sample)}
  }
}
```

if sample is provided as:

|Index|Attribute|Value|
|-|-|-|
|0|attr1|value1|
| |attr2|value2|
| |attr3|value3|
| |attr4|value4|
|1|attr1|value5|
| |attr2|value6|
| |attr3|value7|
| |attr4|value8|

Then, the resulting command line could look like:

```
perl script.pl /jobs/564759/sample.json
```

Where `/jobs/564759/sample.json` would contain:

```json
[
  {
    "attr1": "value1",
    "attr2": "value2",
    "attr3": "value3",
    "attr4": "value4"
  },
  {
    "attr1": "value5",
    "attr2": "value6",
    "attr3": "value7",
    "attr4": "value8"
  }
]
```


## De-serialization of Task Outputs

A task's command can only output data as files.  Therefore, every de-serialization function in WDL takes a file input and returns a WDL type

### Primitive Types

De-serialization of primitive types is done through a `read_*` function.  For example, `read_int("file/path")` and `read_string("file/path")`.

For example, if I have a task that outputs a `String` and an `Int`:

```wdl
task output_example {
  input {
    String param1
    String param2
  }
  command {
    python do_work.py ${param1} ${param2} --out1=int_file --out2=str_file
  }
  output {
    Int my_int = read_int("int_file")
    String my_str = read_string("str_file")
  }
}
```

Both files `file_with_int` and `file_with_uri` should contain one line with the value on that line.  This value is then validated against the type of the variable.  If `file_with_int` contains a line with the text "foobar", the workflow must fail this task with an error.

### Compound Types

Tasks can also output to a file or stdout/stderr an `Array`, `Map`, or `Object` data structure in a two major formats:

* JSON - because it fits naturally with the types within WDL
* Text based / TSV - These are usually simple table and text-based encodings (e.g. `Array[String]` could be serialized by having each element be a line in a file)

#### Array deserialization

Maps are deserialized from:

* Files that contain a JSON Array as their top-level element.
* Any file where it is desirable to interpret each line as an element of the `Array`.

##### Array deserialization using read_lines()

`read_lines()` will return an `Array[String]` where each element in the array is a line in the file.

This return value can be auto converted to other `Array` types.  For example:

```wdl
task test {
  command <<<
    python <<CODE
    import random
    for i in range(10):
      print(random.randrange(10))
    CODE
  >>>
  output {
    Array[Int] my_ints = read_lines(stdout())
  }
}
```

`my_ints` would contain ten random integers ranging from 0 to 10.

##### Array deserialization using read_json()

`read_json()` will return whatever data type resides in that JSON file

```wdl
task test {
  command <<<
    echo '["foo", "bar"]'
  >>>
  output {
    Array[String] my_array = read_json(stdout())
  }
}
```

This task would assign the array with elements `"foo"` and `"bar"` to `my_array`.

If the echo statement was instead `echo '{"foo": "bar"}'`, the engine MUST fail the task for a type mismatch.

#### Map deserialization

Maps are deserialized from:

* Files that contain a JSON Object as their top-level element.
* Files that contain a two-column TSV file.

##### Map deserialization using read_map()

`read_map()` will return an `Map[String, String]` where the keys are the first column in the TSV input file and the corresponding values are the second column.

This return value can be auto converted to other `Map` types.  For example:

```wdl
task test {
  command <<<
    python <<CODE
    for i in range(3):
      print("key_{idx}\t{idx}".format(idx=i)
    CODE
  >>>
  output {
    Map[String, Int] my_ints = read_map(stdout())
  }
}
```

This would put a map containing three keys (`key_0`, `key_1`, and `key_2`) and three respective values (`0`, `1`, and `2`) as the value of `my_ints`

##### Map deserialization using read_json()

`read_json()` will return whatever data type resides in that JSON file.  If that file contains a JSON object with homogeneous key/value pair types (e.g. `string -> int` pairs), then the `read_json()` function would return a `Map`.

```wdl
task test {
  command <<<
    echo '{"foo":"bar"}'
  >>>
  output {
    Map[String, String] my_map = read_json(stdout())
  }
}
```

This task would assign the one key-value pair map in the echo statement to `my_map`.

If the echo statement was instead `echo '["foo", "bar"]'`, the engine MUST fail the task for a type mismatch.

#### Object deserialization

Objects are deserialized from files that contain a two-row, n-column TSV file.  The first row are the object attribute names and the corresponding entries on the second row are the values.

##### Object deserialization using read_object()

`read_object()` will return an `Object` where the keys are the first row in the TSV input file and the corresponding values are the second row (corresponding column).

```wdl
task test {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    CODE
  >>>
  output {
    Object my_obj = read_object(stdout())
  }
}
```

This would put an object containing three attributes (`key_0`, `key_1`, and `key_2`) and three respective values (`value_0`, `value_1`, and `value_2`) as the value of `my_obj`

#### Array[Object] deserialization

`Array[Object]` MUST assume that all objects in the array are homogeneous (they have the same attributes, but the attributes don't have to have the same values)

An `Array[Object]` is deserialized from files that contains at least 2 rows and a uniform n-column TSV file.  The first row are the object attribute names and the corresponding entries on the subsequent rows are the values

##### Object deserialization using read_objects()

`read_object()` will return an `Object` where the keys are the first row in the TSV input file and the corresponding values are the second row (corresponding column).

```wdl
task test {
  command <<<
    python <<CODE
    print('\t'.join(["key_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    print('\t'.join(["value_{}".format(i) for i in range(3)]))
    CODE
  >>>
  output {
    Array[Object] my_obj = read_objects(stdout())
  }
}
```

This would create an array of **three identical** `Object`s containing three attributes (`key_0`, `key_1`, and `key_2`) and three respective values (`value_0`, `value_1`, and `value_2`) as the value of `my_obj`
