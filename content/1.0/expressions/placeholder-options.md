+++
title = "Placeholder Options"
weight = 70
+++

## Expression Placeholder Options

Expression placeholder options are `option="value"` pairs that precede the expression in an expression command part and customize the interpolation of the WDL value into the command string being built. The following options are available:

* `sep` - e.g., `${sep=", " array_value}`
* `true` and `false` - e.g., `${true="--yes" false="--no" boolean_value}`
* `default` - e.g., `${default="foo" optional_value}`

Additional explanation for these command part options follows:

### sep

`sep` is interpreted as the separator string used to join multiple parameters together. `sep` is only valid if the expression evaluates to an `Array`.

For example, if there were a declaration `Array[Int] ints = [1,2,3]`, the command `python script.py ${sep=',' numbers}` would yield the command line:

```
python script.py 1,2,3
```

Alternatively, if the command were `python script.py ${sep=' ' numbers}` it would parse to:

```
python script.py 1 2 3
```

> *Additional Requirements*:
>
> 1. `sep` MUST accept only a string as its value

### true and false

`true` and `false` are available for expressions which evaluate to `Boolean`s. They specify a string literal to insert into the command block when the result is true or false respectively.

For example, `${true='--enable-foo' false='--disable-foo' allow_foo}` would evaluate the expression `allow_foo` as a variable lookup and depending on its value would either insert the string `--enable-foo` or `--disable-foo` into the command.

Both `true` and `false` cases are required. If one case should insert no value then an empty string literal should be used, e.g., `${true='--enable-foo' false='' allow_foo}`

> 1. `true` and `false` values MUST be string literals.
> 2. `true` and `false` are only allowed if the type is `Boolean`
> 3. Both `true` and `false` cases are required.
> 4. Consider using the expression `${if allow_foo then "--enable-foo" else "--disable-foo"}` as a more readable alternative which allows full expressions (rather than string literals) for the true and false cases.

### default

This specifies the default value if no other value is specified for this parameter.

```wdl
task default_test {
  input {
    String? s
  }
  command {
    ./my_cmd ${default="foobar" s}
  }
}
```

This task takes an optional `String` parameter and if a value is not specified, then the value of `foobar` will be used instead.

> *Additional Requirements*:
>
> 1. The type of the expression must match the type of the parameter
> 2. If `default` is specified, the `$type_postfix_quantifier` for the variable's type MUST be `?`
