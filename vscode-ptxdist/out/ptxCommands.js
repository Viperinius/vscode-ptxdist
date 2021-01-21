"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtxCommandsProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class PtxCommandsProvider {
    constructor() { }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve(this.getCmds(element.getCmdId()));
        }
        else {
            return Promise.resolve(this.getCmds());
        }
    }
    getCmds(parentCmdId) {
        const rootCmds = [
            new PtxCommand("Clean", "Run ptxdist clean", "clean", vscode.TreeItemCollapsibleState.Collapsed, "trash"),
            new PtxCommand("Go", "Run ptxdist go", "go", vscode.TreeItemCollapsibleState.Collapsed, "build")
        ];
        const children = {
            "clean": [
                new PtxCommand("All", "Cleans all packages", "cleanAll", vscode.TreeItemCollapsibleState.None, "run-all"),
                new PtxCommand("Specified package(s)", "Cleans only some packages", "cleanSpecific", vscode.TreeItemCollapsibleState.None, "run", 'isCmdWithPreset')
            ],
            "go": [
                new PtxCommand("Default", "Runs in parallel und quiet mode", "goDefault", vscode.TreeItemCollapsibleState.None, "run-all"),
                new PtxCommand("No parallel", "Runs without -j but with -q", "goNoParallel", vscode.TreeItemCollapsibleState.None, "run"),
                new PtxCommand("Gimme output", "Runs without -q but with -j", "goNoQuiet", vscode.TreeItemCollapsibleState.None, "run"),
                new PtxCommand("Gimme slow output", "Runs without -j and -q", "goNoParallelNoQuiet", vscode.TreeItemCollapsibleState.None, "run-all")
            ]
        };
        if (parentCmdId) {
            return children[parentCmdId];
        }
        else {
            return rootCmds;
        }
    }
}
exports.PtxCommandsProvider = PtxCommandsProvider;
class PtxCommand extends vscode.TreeItem {
    constructor(label, desc, cmdId, collapsibleState, iconNameNoExt, contextVal) {
        super(label, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.cmdId = cmdId;
        this.collapsibleState = collapsibleState;
        this.iconNameNoExt = iconNameNoExt;
        this.contextVal = contextVal;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'light', this.iconNameNoExt + '.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'dark', this.iconNameNoExt + '.svg')
        };
        this.tooltip = `${this.label}: ${this.desc}`;
        this.description = this.desc;
        this.contextValue = this.contextVal;
    }
    getCmdId() {
        return this.cmdId;
    }
}
//# sourceMappingURL=ptxCommands.js.map