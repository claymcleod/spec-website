+++
title = "Enumeration Types (Enums)"
description = "Enumeration types in WDL"
weight = 330
+++

An enumeration (or "enum") is a closed set of enumerated values (known as "choices") that are considered semantically valid in a specific context. An enum is defined at the top-level of the WDL document and can be used as a declaration type anywhere in the document.

An enum is defined using the `enum` keyword, followed by a globally unique name, followed by a comma-delimited list of identifiers---optionally tagged with values---in braces. When referring to a choice within an enum, for example, when assigning to an enum declaration, the `<name>.<choice>` syntax should be used.

```wdl
enum FileKind {
  FASTQ,
  BAM
}

task process_file {
  input {
    File infile
    FileKind kind = FileKind.FASTQ
  }

  command <<<
  echo "Processing ~{kind} file"
  ...
  >>>
}
workflow process_files {
  input {
    Array[File] files
    FileKind kind
  }

  scatter (file in files) {
    call process_file {
      input:
        infile = file,
        kind = kind
    }
  }
}
```

As an example, consider a workflow that processes different types of NGS files and has a `file_kind` input parameter that is expected to be either "FASTQ" or "BAM". Using `String` as the type of `file_kind` is not ideal - if the user specifies an invalid value, the error will not be caught until runtime, perhaps after the workflow has already run for several hours. Alternatively, using an `enum` type for `file_kind` restricts the allowed values such that the execution engine can validate the input prior to executing the workflow.

Enums are valued, meaning that each choice within an enum has an associated value. Enum values can be of any WDL type, including primitive types (`String`, `Int`, `Float`, `Boolean`), compound types (`Array`, `Map`, `Pair`, `Object`), and user-defined types (`Struct`). To assign a type to the values therein, enums can either be _explicitly_ or _implicitly_ typed.

* Explicitly typed enums take an explicit type assignment within square brackets after the enum's identifier that declares the type of the value. Explicitly typed enums may include values that coerce to the declared type.
* Implicitly typed enums are enums where the values can be unambiguously resolved to a single type following WDL's type coercion rules. If the values do not coerce to a single common type, an error is thrown. Enums that are implicitly typed and for which no values are assigned are assumed to be `String` valued with values matching the choice names.

If any non-`String` values are provided for an enum's choices, then all choices must have explicit values. In the case where all values are `String` (or the enum is implicitly typed as `String`), choices without explicit values are automatically assigned a value equal to the choice name.

Enum values must be literal expressions only. This includes string literals (which may contain escape sequences like `"\t"`), numeric literals, boolean literals, collection literals (`Array`, `Map`, `Pair`), object literals, and struct literals. String interpolation, variable references, and computed expressions are not allowed in enum values, as enums are global declarations that must be evaluable at parse time.

```wdl
# An explicitly typed enum that is `String`-valued.
enum FruitColors[String] {
  Banana = "yellow",
  Orange = "orange",
  Apple = "red",
}

# An explicitly typed enum that is `Float`-valued. Because the enum is
# explicitly typed, the `ThreePointOh` choice can be coerced to a `Float`,
# which is a valid enumeration definition.
enum FavoriteFloat[Float] {
  ThreePointOh = 3,
  FourPointOh = 4.0
}

# An implicitly typed enum where the inner type is unambiguously resolved to
# `Float`. Following WDL's type coercion rules, `Int` values coerce to `Float`.
enum FavoriteNumber {
  ThreePointOh = 3,
  FourPointOh = 4.0
}

# ERROR: the inner type of this enum cannot be unambiguously resolved, as
# `Int` and `String` do not coerce to a common type.
enum InvalidEnum {
  Number = 42,
  Text = "hello"
}

# ERROR: cannot use computed expressions in enum values
enum Bad1 {
  Two = 1 + 1
}

# ERROR: cannot use string interpolation in enum values
enum Bad2 {
  Greeting = "Hello ~{world}"
}

# ERROR: cannot use function calls in enum values
enum Bad3 {
  Three = length([1, 2, 3])
}

# An implicitly typed enum that is `String`-valued.
enum Whitespace {
  Tab = "\t",
  Space = " "
}

# An implicitly typed enum that is implied to be `String`-valued with the
# values "FASTQ" and "BAM" respectively.
enum FileKind {
  FASTQ,
  BAM
}

# An explicitly typed enum with `Array[String]` values. This allows for
# defining sets of related string constants as enum choices.
enum Contigs[Array[String]] {
  Canonical = ["chr1", "chr2", "chr3", "chr4", "chr5"],
  All = ["chr1", "chr2", "chr3", "chr4", "chr5", "chrM", "chrX", "chrY"]
}

# An implicitly typed enum with `Map[String, Int]` values.
enum DefaultConfig {
  Fast = { "threads": 4, "memory_gb": 8 },
  Standard = { "threads": 8, "memory_gb": 16 },
  HighMem = { "threads": 16, "memory_gb": 64 }
}
```

## Enum Definition

An `enum` is an enumerated type. Enums enable the creation of types that represent closed sets of alternatives (called "choices") that are semantically valid in a specific context. Once defined, an `enum` type can be used as the type of a declaration like any other type. However, new choices of an `enum` cannot be created. Instead, a declaration having an `enum` type must be assigned one of the choices created as part of the `enum`'s definition.

An enum definition is a top-level WDL element, meaning it is defined at the same level as tasks, workflows, and structs, and it cannot be defined within a task or workflow body. An enum is defined using the `enum` keyword, followed by a name that is unique within the WDL document, and a body containing a comma-delimited list of choices in braces (`{}`). Choice names within an enum must be unique, and enum names must not conflict with struct names or other enum names.

```wdl
enum Color {
  Red,
  Blue,
  Green
}
```

An enum can be thought of as a closed type with a fixed set of instances. The `enum` keyword creates both a type (that can be used in declarations) and a global namespace containing the enum's choices. For example, `Color.Red` refers to a specific instance of the `Color` enum type.

Unlike structs, it is not possible to create new instances of an `enum` outside of the enum's definition. An enum value can only be one of the choices defined in the enum's declaration.

## Enum Usage

An `enum`'s choices are [accessed](@/1.3/expressions/member-access.md) using a `.` to separate the choice name from the `enum`'s identifier.

A declaration with an `enum` type can only be initialized by referencing a choice directly or by assigning it to the value of another declaration of the same `enum` type.

Two enum values can be tested for equality (i.e., using `==` or `!=`). To be equal, two enum values must be the same choice of the same `enum` type. For example, `Color.Red == Color.Red` evaluates to `true`, while `Color.Red == Color.Blue` evaluates to `false`. A comparison of two enum values of different `enum` types is considered a type mismatch error. Enum values are not ordered, so they cannot be compared with ordinal operators (i.e., using `>`, `>=`, `<`, `<=`).

When an enum value is serialized using string interpolation, it is serialized to its choice name. To extract the inner value of an enum choice, use the [`value()`](@/1.3/standard-library/enum-functions/value.md) standard library function.

An `enum` cannot be coerced to or from any other type. However, an enum value can be [serialized to/deserialized from JSON](#json-input-and-output-for-enums) and can be used in [command sections](#command-section-serialization-of-enums).

```wdl
version 1.3

enum Pet {
  Cat,
  Mouse,
  Bird
}

enum ComputerDevice {
  Mouse,
  Keyboard,
  Monitor
}

task compare_enum_types {
  input {
    Pet? pet
  }

  Pet my_pet = select_first([pet, Pet.Mouse])

  command <<<
    echo "I have a pet ~{my_pet}"
  >>>

  output {
    Boolean different_types = Pet.Mouse != ComputerDevice.Mouse
  }
}
```

## Enum Serialization and Deserialization

Enum values are serialized and deserialized differently depending on the context.

### JSON Input and Output for Enums

When an enum value appears in JSON input or output files, it is represented by its **choice name** (not its inner value). The choice name is specified as a string without the enum type prefix.

For example, given this enum:

```wdl
enum Color {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF"
}

workflow example {
  input {
    Color favorite_color
  }

  output {
    Color result = favorite_color
  }
}
```

**Input JSON** uses the choice name:

```json
{
  "example.favorite_color": "Red"
}
```

**Output JSON** also uses the choice name:

```json
{
  "example.result": "Red"
}
```

The execution engine validates that the provided string matches one of the enum's choice names. If an invalid choice name is provided, the execution engine must raise an error during input validation.

### Command Section Serialization of Enums

When an enum value is used in a command section with string interpolation, it is serialized to its **choice name** (not the inner value). To access the inner value, use the [`value()`](@/1.3/standard-library/enum-functions/value.md) function.

For example:

```wdl
enum VerbosityFlag {
  Quiet = "",
  Info = "-v",
  Debug = "-vv",
  Trace = "-vvv"
}

task run_tool {
  input {
    VerbosityFlag verbosity = VerbosityFlag.Info
  }

  command <<<
  echo "Using verbosity level: ~{verbosity}"
  my_tool ~{value(verbosity)} input.txt
  >>>
}
```

When `verbosity` is `VerbosityFlag.Info`, the command becomes:

```
Using verbosity level: Info
my_tool -v input.txt
```

This demonstrates that `~{verbosity}` produces the choice name "Info", while `~{value(verbosity)}` produces the inner value "-v".
