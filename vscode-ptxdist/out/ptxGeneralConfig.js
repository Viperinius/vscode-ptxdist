"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtxGeneralConfigProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class PtxGeneralConfigProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
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
            new PtxGenConfig("Current menuconfig :", "-", "selMenuConfig", vscode.TreeItemCollapsibleState.None),
            new PtxGenConfig("Current platformconfig :", "-", "selPlatformConfig", vscode.TreeItemCollapsibleState.None)
        ];
        return rootCmds;
    }
}
exports.PtxGeneralConfigProvider = PtxGeneralConfigProvider;
class PtxGenConfig extends vscode.TreeItem {
    constructor(label, desc, cmdId, collapsibleState, iconNameNoExt, contextVal) {
        super(label, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.cmdId = cmdId;
        this.collapsibleState = collapsibleState;
        this.iconNameNoExt = iconNameNoExt;
        this.contextVal = contextVal;
        this.tooltip = `${this.desc}`;
        this.description = this.desc;
        this.contextValue = this.contextVal;
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
//# sourceMappingURL=ptxGeneralConfig.js.map