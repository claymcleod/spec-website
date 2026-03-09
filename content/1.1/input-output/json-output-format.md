+++
title = "JSON Output Format"
weight = 20
+++

The outputs from a workflow invocation may be serialized as a JSON object that contains one member for each top-level workflow output; subworkflow and task outputs are not provided. The name of the object member is the [fully-qualified name](@/1.1/workflows/qualified-names.md) of the output parameter, and the value is the [serialized form](@/1.1/appendices/appendix-a.md) of the WDL value.

Every WDL implementation must provide the ability to serialize workflow outputs in this standard format. It is suggested that WDL implementations make the standard format be the default output format.

For example, given this workflow:

```wdl
workflow example {
  ...
  output {
    String foo = cafeteria.inn
    File analysis_results = analysis.results
    Int read_count = readcounter.result
    Float kessel_run_parsecs = trip_to_space.distance
    Boolean sample_swap_detected = array_concordance.concordant
    Array[File] sample_variants = variant_calling.vcfs
    Map[String, Int] droids = escape_pod.cargo
  }
}
```

The output JSON will look like:

```json
{
  "example.foo": "bar",
  "example.analysis_results": "/path/to/my/analysis/results.txt",
  "example.read_count": 50157187,
  "example.kessel_run_parsecs": 11.98,
  "example.sample_swap_detected": false,
  "example.sample_variants": ["/data/patient1.vcf", "/data/patient2.vcf"],
  "example.droids": {"C": 3, "D": 2, "P": 0, "R": 2}
}
```

It is recommended (but not required) that JSON outputs be "pretty printed" to be more human-readable.
