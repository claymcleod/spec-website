+++
title = "Operator Precedence"
weight = 25
+++

| Precedence | Operator type | Associativity | Example |
|-|-|-|-|
| 12 | Grouping | n/a | `(x)` |
| 11 | Member Access | left-to-right | `x.y` |
| 10 | Index | left-to-right | `x[y]` |
| 9 | Function Call | left-to-right | `x(y,z,...)` |
| 8 | Logical NOT | right-to-left | `!x` |
| | Unary Negation | right-to-left | `-x` |
| 7 | Exponentiation | left-to-right | `x**y` |
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
