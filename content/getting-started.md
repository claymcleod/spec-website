+++
title = "Getting Started"
date = 2026-01-04
+++

## Introduction

This is a sample page demonstrating Tailwind CSS typography styles.

### Code Example

```wdl
workflow hello {
  call say_hello
}

task say_hello {
  command {
    echo "Hello, World!"
  }
  output {
    String message = read_string(stdout())
  }
}
```

### Lists

- First item
- Second item
- Third item

### Links

Visit the [WDL GitHub repository](https://github.com/openwdl/wdl) for more information.
