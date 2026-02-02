+++
title = "Introduction"
description = "Overview of the Workflow Description Language specification"
sort_by = "weight"
+++

Workflow Description Language (WDL) is an open, standardized, *human readable and writable* language for expressing tasks and workflows. WDL is designed to be a general-purpose workflow language, but it is most widely used in the field of bioinformatics. There is a large community of WDL users who share their workflows and tasks on sites such as [Dockstore](https://dockstore.org/search?descriptorType=WDL&searchMode=files).

This document provides a detailed technical specification for WDL. Users who are new to WDL may appreciate a more gentle introduction, such as the [learn-wdl](https://github.com/openwdl/learn-wdl) repository.

Here is provided a short example of WDL, after which are several sections that provide the necessary details both for WDL users and for implementers of WDL execution engines:

* [Language Specification](@/types/_index.md): a description of the WDL grammar and all the parts of the WDL document.
* [Standard Library](@/standard-library/_index.md): a catalog of the functions available to be called from within a WDL document.
* [Input and Output Formats](@/input-output/_index.md): a description of the standard input and output formats that must be supported by all WDL implementations.
* [Appendices](@/appendices/_index.md): Sections with more detailed information about various parts of the specification.
