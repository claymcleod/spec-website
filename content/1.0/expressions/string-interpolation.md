+++
title = "String Interpolation"
weight = 60
+++

## String Interpolation

Within tasks, any string literal can use string interpolation to access the value of any of the task's inputs. The most obvious example of this is being able to define an output file which is named as function of its input. For example:

```wdl
task example {
  input {
    String prefix
    File bam
  }
  command {
    python analysis.py --prefix=${prefix} ${bam}
  }
  output {
    File analyzed = "${prefix}.out"
    File bam_sibling = "${bam}.suffix"
  }
}
```

Any `${identifier}` inside of a string literal must be replaced with the value of the identifier. If prefix were specified as `foobar`, then `"${prefix}.out"` would be evaluated to `"foobar.out"`.

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
