+++
title = "join_paths"
description = "Join path components together"
weight = 15
+++

*as of version 1.2*

```
String join_paths(Directory, String)
String join_paths(Directory, Array[String]+)
String join_paths(Array[String]+)
```

Joins together two or more paths into an absolute path in the execution environment's filesystem.

There are three choices of this function:

1. `String join_paths(Directory, String)`: Joins together exactly two paths. The second path is relative to the first directory and may specify a file or directory.
2. `String join_paths(Directory, Array[String]+)`: Joins together any number of relative paths with a base directory. The paths in the array argument must all be relative. The *last* element may specify a file or directory; all other elements must specify a directory.
3. `String join_paths(Array[String]+)`: Joins together any number of paths. The array must not be empty. The *first* element of the array may be either absolute or relative; subsequent path(s) must be relative. The *last* element may specify a file or directory; all other elements must specify a directory.

An absolute path starts with `/` and indicates that the path is relative to the root of the environment in which the task is executed. Only the first path may be absolute. If any subsequent paths are absolute, it is an error.

A relative path does not start with `/` and indicates the path is relative to its parent directory. It is up to the execution engine to determine which directory to use as the parent when resolving relative paths; by default it is the working directory in which the task is executed.

**Parameters**

1. `Directory|Array[String]+`: Either a directory path or an array of paths.
2. `String|Array[String]+`: A relative path or paths; only allowed if the first argument is a `Directory`.

**Returns**: A `String` representing an absolute path that results from joining all the paths in order (left-to-right), and resolving the resulting path against the default parent directory if it is relative.

Example: join_paths_task.wdl


```wdl
version 1.3

task join_paths {
  input {
    Directory abs_dir = "/usr"
    String abs_str = "/usr"
    String rel_dir_str = "bin"
    String rel_file = "echo"
  }

  # these are all equivalent to '/usr/bin/echo'
  String bin1 = join_paths(abs_dir, [rel_dir_str, rel_file])
  String bin2 = join_paths(abs_str, [rel_dir_str, rel_file])
  String bin3 = join_paths([abs_str, rel_dir_str, rel_file])

  command <<<
    ~{bin1} -n "hello" > output.txt
  >>>

  output {
    Boolean bins_equal = (bin1 == bin2) && (bin1 == bin3)
    String result = read_string("output.txt")
  }

  runtime {
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
  "join_paths.bins_equal": true,
  "join_paths.result": "hello"
}
```


</details>
