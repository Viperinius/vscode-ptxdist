import * as vscode from 'vscode';
import * as path from 'path';

export class PtxGeneralConfigProvider implements vscode.TreeDataProvider<PtxGenConfig> {
    constructor(private workspaceRoot?: string) {
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<PtxGenConfig | undefined | null | void> = new vscode.EventEmitter<PtxGenConfig | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PtxGenConfig | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(elementsToModify: PtxGenConfig[]): void {
        elementsToModify.forEach(element => {
            this._onDidChangeTreeData.fire(element);
        });
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
            /*new PtxGenConfig(
                "Current platform :", 
                "-", 
                "Shows the currently selected platform based on the selected menu- and platformconfig",
                "currPlatform", 
                vscode.TreeItemCollapsibleState.None),*/
            new PtxGenConfig(
                "Current menuconfig :", 
                "-", 
                "",
                "selMenuConfig", 
                vscode.TreeItemCollapsibleState.None, 
                "vscode-ptxdist.selectPtxConfig"),
            new PtxGenConfig(
                "Current platformconfig :", 
                "-", 
                "",
                "selPlatformConfig", 
                vscode.TreeItemCollapsibleState.None,
                "vscode-ptxdist.selectPlatformConfig"),
            new PtxGenConfig(
                "Current toolchain :", 
                "-", 
                "",
                "selToolchain", 
                vscode.TreeItemCollapsibleState.None,
                "vscode-ptxdist.selectToolchain")
        ];
        
        return rootCmds;
    }
}

export class PtxGenConfig extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private desc: string,
        public tooltip: string,
        private readonly cmdId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public clickCmd?: string,
        private iconNameNoExt?: string,
        private contextVal?: string
    ) {
        super(label, collapsibleState);
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

    getCmdId(): string {
        return this.cmdId;
    }
}
