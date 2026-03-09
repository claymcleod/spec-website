+++
title = "Evaluation of Task Declarations"
description = "Order and timing of task declaration evaluation"
weight = 45
+++

All non-output declarations (i.e., input and private declarations) must be evaluated prior to evaluating the command section.

Input and private declarations may appear in any order within their respective sections and they may reference each other so long as there are no circular references. Input and private declarations may *not* reference declarations in the output section.

Declarations in the output section may reference any input and private declarations, and may also reference other output declarations.
