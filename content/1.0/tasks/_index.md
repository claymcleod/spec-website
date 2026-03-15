+++
title = "Tasks"
description = "How to define units of computation that run commands"
sort_by = "weight"
weight = 40
+++

## Task Definition

A task is a declarative construct with a focus on constructing a command from a template. The command specification is interpreted in an engine and backend agnostic way. The command is a UNIX bash command line which will be run (ideally in a Docker image).

Tasks explicitly define their inputs and outputs which is essential for building dependencies between tasks.

To declare a task, use `task name { ... }`. Inside the curly braces are the following sections:

### Task Sections

The task may have the following component sections:

- An `input` section (required if the task will have inputs)
- Non-input declarations (as many as needed, optional)
- A `command` section (required)
- A `runtime` section (optional)
- An `output` section (required if the task will have outputs)
- A `meta` section (optional)
- A `parameter_meta` section (optional)

## Examples

### Example 1: Simplest Task

```wdl
task hello_world {
  command {echo hello world}
}
```

### Example 2: Inputs/Outputs

```wdl
task one_and_one {
  input {
    String pattern
    File infile
  }
  command {
    grep ${pattern} ${infile}
  }
  output {
    File filtered = stdout()
  }
}
```

### Example 3: Runtime/Metadata

```wdl
task runtime_meta {
  input {
    String memory_mb
    String sample_id
    String param
    String sample_id
  }
  command {
    java -Xmx${memory_mb}M -jar task.jar -id ${sample_id} -param ${param} -out ${sample_id}.out
  }
  output {
    File results = "${sample_id}.out"
  }
  runtime {
    docker: "broadinstitute/baseimg"
  }
  parameter_meta {
    memory_mb: "Amount of memory to allocate to the JVM"
    param: "Some arbitrary parameter"
    sample_id: "The ID of the sample in format foo_bar_baz"
  }
  meta {
    author: "Joe Somebody"
    email: "joe@company.org"
  }
}
```

### Example 4: BWA mem

```wdl
task bwa_mem_tool {
  input {
    Int threads
    Int min_seed_length
    Int min_std_max_min
    File reference
    File reads
  }
  command {
    bwa mem -t ${threads} \
            -k ${min_seed_length} \
            -I ${sep=',' min_std_max_min+} \
            ${reference} \
            ${sep=' ' reads+} > output.sam
  }
  output {
    File sam = "output.sam"
  }
  runtime {
    docker: "broadinstitute/baseimg"
  }
}
```

Notable pieces in this example is `${sep=',' min_std_max_min+}` which specifies that min_std_max_min can be one or more integers (the `+` after the variable name indicates that it can be one or more). If an `Array[Int]` is passed into this parameter, then it's flattened by combining the elements with the separator character (`sep=','`).

This task also defines that it exports one file, called 'sam', which is the stdout of the execution of bwa mem.

The 'docker' portion of this task definition specifies which that this task must only be run on the Docker image specified.

### Example 5: Word Count

```wdl
task wc2_tool {
  input {
    File file1
  }
  command {
    wc ${file1}
  }
  output {
    Int count = read_int(stdout())
  }
}

workflow count_lines4_wf {
  input {
    Array[File] files
  }
  scatter(f in files) {
    call wc2_tool {
      input: file1=f
    }
  }
  output {
    wc2_tool.count
  }
}
```

In this example, it's all pretty boilerplate, declarative code, except for some language-y like features, like `firstline(stdout)` and `append(list_of_count, wc2-tool.count)`. These both can be implemented fairly easily if we allow for custom function definitions. Parsing them is no problem. Implementation would be fairly simple and new functions would not be hard to add. Alternatively, this could be something like JavaScript or Python snippets that we run.

### Example 6: tmap

This task should produce a command line like this:

```
tmap mapall \
stage1 map1 --min-seq-length 20 \
       map2 --min-seq-length 20 \
stage2 map1 --max-seq-length 20 --min-seq-length 10 --seed-length 16 \
       map2 --max-seed-hits -1 --max-seq-length 20 --min-seq-length 10
```

Task definition would look like this:

```wdl
task tmap_tool {
  input {
    Array[String] stages
    File reads
  }
  command {
    tmap mapall ${sep=' ' stages} < ${reads} > output.sam
  }
  output {
    File sam = "output.sam"
  }
}
```

For this particular case where the command line is *itself* a mini DSL, The best option at that point is to allow the user to type in the rest of the command line, which is what `${sep=' ' stages+}` is for. This allows the user to specify an array of strings as the value for `stages` and then it concatenates them together with a space character

|Variable|Value|
|-|-|
|reads|/path/to/fastq|
|stages|["stage1 map1 --min-seq-length 20 map2 --min-seq-length 20", "stage2 map1 --max-seq-length 20 --min-seq-length 10 --seed-length 16  map2 --max-seed-hits -1 --max-seq-length 20 --min-seq-length 10"]|
