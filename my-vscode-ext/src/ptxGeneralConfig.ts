import * as vscode from 'vscode';
import * as path from 'path';

export class PtxGeneralConfigProvider implements vscode.TreeDataProvider<PtxGenConfig> {
    constructor(private workspaceRoot?: string) {
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
    }

    getTreeItem(element: PtxGenConfig): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PtxGenConfig): Thenable<PtxGenConfig[]> {
        if (element) {
            return Promise.resolve(
                this.getCmds(element.getCmdId())
            );
        }
        else {
            return Promise.resolve(
                this.getCmds()
            );
        }
    }

    private getCmds(parentCmdId?: string): PtxGenConfig[] {
        const rootCmds = [
            new PtxGenConfig("Current menuconfig :", "-", "selMenuConfig", vscode.TreeItemCollapsibleState.None),
            new PtxGenConfig("Current platformconfig :", "-", "selPlatformConfig", vscode.TreeItemCollapsibleState.None)
        ];
        
        return rootCmds;
    }
}

class PtxGenConfig extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private desc: string,
        private readonly cmdId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private iconNameNoExt?: string,
        private contextVal?: string
    ) {
        super(label, collapsibleState);
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

    getCmdId(): string {
        return this.cmdId;
    }
}
