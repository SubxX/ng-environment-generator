# ng-environment-generator

## Introduction

`ng-environment-generator` is a command-line utility designed to automate the environment creation process for your Angular projects. It simplifies the often tedious task of setting up different environments, such as staging, internal, testing by providing a user-friendly command-line interface.

## Installation

You can install `ng-environment-generator` globally using npm:

```bash
npm install -g ng-environment-generator
```

## Usage

### Display Help

To see available commands and options, you can run:

```bash
ng-env --help
```

### Generate Environment

To generate an environment configuration, you can use the following command:

```bash
ng-env generate [environment-name]
```

Replace `[environment-name]` with the name of the environment you want to generate (e.g., "staging").

#### Options

- `--project ProjectName`: Specify the name of the Angular project for which you want to generate the environment (it take the first project as default if no projectName is passed).

- `--e2e true`: Include this option to also add configuration for end-to-end (e2e) testing.

## Example

Generate a staging environment configuration for the project "MyApp" and include e2e environment files:

```bash
ng-env generate staging --project MyApp --e2e true
```

## Motivation

Setting up environment configurations manually for Angular projects can be time-consuming and error-prone. `ng-environment-generator` aims to simplify this process and make it more efficient.

## Issues

If you encounter any issues or have suggestions for improvements, please feel free to open an issue on the [GitHub repository](https://github.com/SubxX/ng-environment-generator/issues).
