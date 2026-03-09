+++
title = "Operator Precedence Table"
description = "Order of operations for WDL expressions"
weight = 30
+++

| Precedence | Operator type | Associativity | Example |
|-|-|-|-|
| 11 | Grouping | n/a | `(x)` |
| 10 | Member Access | left-to-right | `x.y` |
| 9 | Index | left-to-right | `x[y]` |
| 8 | Function Call | left-to-right | `x(y,z,...)` |
| 7 | Logical NOT | right-to-left | `!x` |
| | Unary Negation | right-to-left | `-x` |
| 6 | Multiplication | left-to-right | `x*y` |
| | Division | left-to-right | `x/y` |
| | Remainder | left-to-right | `x%y` |
| 5 | Addition | left-to-right | `x+y` |
| | Subtraction | left-to-right | `x-y` |
| 4 | Less Than | left-to-right | `x<y` |
| | Less Than Or Equal | left-to-right | `x<=y` |
| | Greater Than | left-to-right | `x>y` |
| | Greater Than Or Equal | left-to-right | `x>=y` |
| 3 | Equality | left-to-right | `x==y` |
| | Inequality | left-to-right | `x!=y` |
| 2 | Logical AND | left-to-right | `x&&y` |
| 1 | Logical OR | left-to-right | `x\|\|y` |
