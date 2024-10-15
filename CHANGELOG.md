# Change Log

All notable changes to the "vscode-ptxdist" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.3.0] - 2024-10-15

### Added

- Add button to call `ptxdist menuconfig`
- Save favourite commands / shortcuts to commands

### Changed

- Only show the parent directory name in the description of PTXdist configurations

## [1.2.0] - 2023-03-24

### Added

- Add output channel `PTXdist` that is used for logging
- The PTXdist tasks can now be cancelled with `Ctrl+C`

### Changed

- Colourise the icon of any selected config / toolchain to help with visibility

### Fixed

- Fix the detection of the selected configs if the `ptxproj` is a symlink

## [1.1.0] - 2023-03-08

- Bugfixes and a new view for the PTXdist configurations

### Added

- New setting "Restrict config search" to speed up searching for configurations by just looking in the default location
- File icon for `.in` files

### Changed

- Reorder the PTXdist commands to represent the workflow as best as possible
- Rework the "General configuration" view to show available configs as a tree with a refresh button
- Update dependencies

### Fixed

- Fix opening the settings when the respective modal was dismissed by the user
- Fix broken evaluation of PTXdist config selection result

## [1.0.0] - 2023-01-30

- Initial release

### Added

- View for PTXdist
- Commands for common PTXdist commands
- Configuration entries for PTXdist configs and the workspace root
- Language support for `.in` menu entries
- Snippets for rule files
- Key binding for canceling a running task in a focused terminal
