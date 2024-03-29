# VS Code PTXdist

Integrates PTXdist commands in VS Code.

> This extension is still WIP.

<a href="https://github.com/Viperinius/vscode-ptxdist/actions/workflows/test.yaml">
<img alt="Test status" src="https://img.shields.io/github/actions/workflow/status/Viperinius/vscode-ptxdist/test.yaml?label=checks">
</a>
<a href="https://github.com/Viperinius/vscode-ptxdist">
<img alt="MIT license" src="https://img.shields.io/github/license/Viperinius/vscode-ptxdist">
</a>
<a href="https://github.com/Viperinius/vscode-ptxdist/releases">
<img alt="Current release" src="https://img.shields.io/github/release/Viperinius/vscode-ptxdist">
</a>

## Features

Adds a new view to the side bar from which you can
- change the selected PTXdist menuconfig, platformconfig and toolchain
- execute common PTXdist commands such as `images`, `clean` or `targetinstall`

This extension also provides language features / syntax highlighting for PTXdist menu files (`.in`) as well as snippets for PTXdist rule files (`.make`).

## Requirements

You need to have PTXdist installed... obviously. This also means that this extension is only supported on Linux.

## Extension Settings

This extension contributes the following settings:

* `vscode-ptxdist.current.menuconfig`: contains the currently selected PTXdist menuconfig
* `vscode-ptxdist.current.platformconfig`: contains the currently selected PTXdist platformconfig
* `vscode-ptxdist.current.toolchain`: contains the currently selected toolchain
* `vscode-ptxdist.workspaceRoot`: base path of the workspace (to determine available configs)
* `vscode-ptxdist.search.configs.restrict`: only search for PTXdist configs using the default path below the workspace root
* `vscode-ptxdist.presets.favouritePackages`: add package names to this list to use them with PTXdist commands
* `vscode-ptxdist.presets.favouriteCommands`: WIP, has no effect yet

## Build

If you want to create an extension package to install it, follow these steps:

Install the packaging tool:
```sh
npm install -g @vscode/vsce
```

Inside the `vscode-ptxdist` directory, trigger a package build:
```sh
vsce package
```
