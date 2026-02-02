+++
title = "Runtime Section"
description = "Deprecated runtime environment specification"
weight = 90
+++

<div class="flex items-center gap-1 my-4">
  <h2 class="inline">Runtime Section</h2>
  <span class="wdl-badge wdl-badge-deprecated mt-6">Deprecated</span>
</div>

The `runtime` section is essentially the same as the [`requirements`](@/tasks/requirements.md) section, with the only difference being that arbitrary attributes *are* allowed in the `runtime` section. All attributes defined in the `requirements` section have the same semantics when used in the `runtime` section and are considered as reserved.

The `runtime` section is mutually exclusive with `requirements` and `hints`, i.e., if you use `runtime` in a task, you cannot also use `requirements` or `hints` in that task.

The `runtime` section is deprecated and will be removed in WDL 2.0.

