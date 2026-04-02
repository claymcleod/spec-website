+++
title = "Optional Types"
description = "Optional type declarations and the <code>None</code> value in WDL"
weight = 200
+++

[Types](@/1.0/types/_index.md) can be optionally suffixed with a `?` or `+` in certain cases.

* `?` means that the parameter is optional. A user does not need to specify a value for the parameter in order to satisfy all the inputs to the workflow.
* `+` applies only to `Array` types and it represents a constraint that the `Array` value must contain one-or-more elements.

```wdl
task test {
  input {
    Array[File]  a
    Array[File]+ b
    Array[File]? c
    #File+ d <-- can't do this, + only applies to Arrays
  }
  command {
    /bin/mycmd ${sep=" " a}
    /bin/mycmd ${sep="," b}
    /bin/mycmd ${write_lines(c)}
  }
}

workflow wf {
  call test
}
```

If you provided these values for inputs:

| var | value |
|-|-|
| wf.test.a | ["1", "2", "3"] |
| wf.test.b | [] |

The workflow engine should reject this because `wf.test.b` is required to have at least one element. If we change it to:

| var | value |
|-|-|
| wf.test.a | ["1", "2", "3"] |
| wf.test.b | ["x"] |

This would be valid input because `wf.test.c` is not required. Given these values, the command would be instantiated as:

```
/bin/mycmd 1 2 3
/bin/mycmd x
/bin/mycmd
```

If our inputs were:

| var | value |
|-|-|
| wf.test.a | ["1", "2", "3"] |
| wf.test.b | ["x","y"] |
| wf.test.c | ["a","b","c","d"] |

Then the command would be instantiated as:

```
/bin/mycmd 1 2 3
/bin/mycmd x,y
/bin/mycmd /path/to/c.txt
```

## Prepending a String to an Optional Parameter

Sometimes, optional parameters need a string prefix. Consider this task:

```wdl
task test {
  input {
    String? val
  }
  command {
    python script.py --val=${val}
  }
}
```

Since `val` is optional, this command line can be instantiated in two ways:

```
python script.py --val=foobar
```

Or

```
python script.py --val=
```

The latter case is very likely an error case, and this `--val=` part should be left off if a value for `val` is omitted. To solve this problem, modify the expression inside the template tag as follows:

```
python script.py ${"--val=" + val}
```
