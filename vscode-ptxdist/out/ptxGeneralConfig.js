"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtxGenConfig = exports.PtxGeneralConfigProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class PtxGeneralConfigProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
    }
    refresh(elementsToModify) {
        elementsToModify.forEach(element => {
            this._onDidChangeTreeData.fire(element);
        });
    }
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
            new PtxGenConfig("Current platform :", "-", "Shows the currently selected platform based on the selected menu- and platformconfig", "currPlatform", vscode.TreeItemCollapsibleState.None),
            new PtxGenConfig("Current menuconfig :", "-", "", "selMenuConfig", vscode.TreeItemCollapsibleState.None, "vscode-ptxdist.selectPtxConfig"),
            new PtxGenConfig("Current platformconfig :", "-", "", "selPlatformConfig", vscode.TreeItemCollapsibleState.None)
        ];
        return rootCmds;
    }
}
exports.PtxGeneralConfigProvider = PtxGeneralConfigProvider;
class PtxGenConfig extends vscode.TreeItem {
    constructor(label, desc, tooltip, cmdId, collapsibleState, clickCmd, iconNameNoExt, contextVal) {
        super(label, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.tooltip = tooltip;
        this.cmdId = cmdId;
        this.collapsibleState = collapsibleState;
        this.clickCmd = clickCmd;
        this.iconNameNoExt = iconNameNoExt;
        this.contextVal = contextVal;
        if (this.tooltip === '') {
            this.tooltip = this.desc;
        }
        this.description = this.desc;
        this.contextValue = this.contextVal;
        if (this.clickCmd) {
            this.command = {
                "title": "",
                "command": this.clickCmd,
                "arguments": [this]
            };
        }
        if (iconNameNoExt) {
            this.iconPath = {
                light: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'light', this.iconNameNoExt + '.svg'),
                dark: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'dark', this.iconNameNoExt + '.svg')
            };
        }
    }
    getCmdId() {
        return this.cmdId;
    }
}
exports.PtxGenConfig = PtxGenConfig;
//# sourceMappingURL=ptxGeneralConfig.js.map