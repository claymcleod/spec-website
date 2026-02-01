+++
title = "Input and Output Formats"
weight = 60
sort_by = "weight"
+++

WDL uses [JSON](https://www.json.org) as its native serialization format for task and workflow inputs and outputs. The specifics of these formats are described below.

All WDL implementations are required to support the standard JSON input and output formats. WDL compliance testing is performed using test cases whose inputs and expected outputs are given in these formats. A WDL implementation may choose to provide additional input and output mechanisms so long as they are documented, and/or tools are provided to interconvert between engine-specific input and the standard JSON format, to foster interoperability between tools in the WDL ecosystem.
