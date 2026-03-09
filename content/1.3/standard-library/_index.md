+++
title = "Standard Library"
sort_by = "weight"
description = "Built-in functions available in WDL"
weight = 60
+++

The following functions are available to be called in WDL expressions. The signature of each function is given as `R func_name(T1, T2, ...)`, where `R` is the return type and `T1`, `T2`, ... are the parameter types. All function parameters must be specified in order, and all function parameters are required, with the exception that the last parameter(s) of some functions is optional (denoted by the type in brackets `[]`).

A function is called using the following syntax: `R' val = func_name(arg1, arg2, ...)`, where `R'` is a type that is coercible from `R`, and `arg1`, `arg2`, ... are expressions whose types are coercible to `T1`, `T2`, ...

A function may be generic, which means that one or more of its parameters and/or its return type are generic. These functions are defined using letters (e.g. `X`, `Y`) for the type parameters, and the bounds of each type parameter is specified in the function description.

A function may be polymorphic, which means it is actually multiple functions ("choices") with the same name but different signatures. Such a function may be defined using `|` to denote the set of alternative valid types for one or more of its parameters, or it may have each choice defined separately.

Functions are grouped by their argument types and restrictions. Some functions may be restricted as to where they may be used. An unrestricted function may be used in any expression.
