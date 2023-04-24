# mockc-slang

Sublanguage of C language. 

You can also try it out at https://mockc-slang.github.io/CS4215-frontend/ (note that it is only supported on Chrome). 

## Requirements

- node: known working version: v16.14.0

## Usage

To build,

```{.}
$ git clone https://github.com/mockc-slang/mockc-slang
$ cd mockc-slang
$ yarn
$ yarn antlr4ts
$ yarn build
```

To add \"mockc-slang\" to your PATH, build it as per the above instructions, then
run

```{.}
$ cd dist
$ npm link
```

If you do not wish to add \"mockc-slang\" to your PATH, replace \"mockc-slang\" with
\"node dist/repl/repl.js\" in the following examples.

To try out `mockc-slang` in a REPL, you can take the `PROGRAM_STRING` out of a file as follows:

```{.}
$ mockc-slang "$(< my_c_program.c)"
```

Note that running the program on non x86 architectures might result in nondeterministic outputs. 

## Using mockc-slang in your local Source Academy Frontend

First, clone and build the frontend following the instructions here: https://github.com/mockc-slang/CS4215-frontend

Then, build and link your local mockc-slang: 

```{.}
$ cd mockc-slang
$ yarn build
$ yarn link
```

Then, from your local copy of frontend:

```{.}
$ cd frontend
$ yarn link "mockc-slang"
```

Then start the frontend and mockc-slang will be used.