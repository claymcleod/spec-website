+++
title = "Introduction"
description = "An overview of WDL and this version of the specification"
sort_by = "weight"
weight = 10
+++

This is version 1.3.0 of the Workflow Description Language (WDL) specification. It describes WDL `version 1.3`. It introduces a number of new features (denoted by the <span class="wdl-badge wdl-badge-new">New</span> symbol) and clarifications to the [1.2.*](@/1.2/introduction/_index.md) version of the specification. For an execution engine to be considered compliant with WDL 1.3, you must pass 100% of the compliance tests using [`spectool`](https://github.com/openwdl/spectool).

Aspects of the specification that will be removed in the next major WDL version are denoted by the <span class="wdl-badge wdl-badge-deprecated">Deprecated</span> symbol.

### Revisions

Revisions to this specification are made periodically in order to correct errors, clarify language, or add additional examples. Revisions are released as "patches" to the specification, i.e., the third number in the specification version is incremented. No functionality is added or removed after the initial revision of the specification is ratified.

* [1.3.0](https://github.com/openwdl/wdl/tree/release-1.3.0/SPEC.md): 2026-01-12

## Overview

Workflow Description Language (WDL) is an open, standardized, *human readable and writable* language for expressing tasks and workflows. WDL is designed to be a general-purpose workflow language, but it is most widely used in the field of bioinformatics. There is a large community of WDL users who share their workflows and tasks on sites such as [Dockstore](https://dockstore.org/search?descriptorType=WDL&searchMode=files).

This document provides a detailed technical specification for WDL. Users who are new to WDL may appreciate a more gentle introduction, such as the [learn-wdl](https://github.com/openwdl/learn-wdl) repository.

Here is provided a short example of WDL, after which are several sections that provide the necessary details both for WDL users and for implementers of WDL execution engines:

* [Language Specification](@/1.3/types/_index.md): a description of the WDL grammar and all the parts of the WDL document.
* [Standard Library](@/1.3/standard-library/_index.md): a catalog of the functions available to be called from within a WDL document.
* [Input and Output Formats](@/1.3/input-output/_index.md): a description of the standard input and output formats that must be supported by all WDL implementations.
* [Appendices](@/1.3/appendices/_index.md): Sections with more detailed information about various parts of the specification.
