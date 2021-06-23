import * as vscode from 'vscode';
import * as path from 'path';
import { ptxdistGetSelectedConfig, ptxdistGetSelectedPlatform, ptxdistGetSelectedToolchain } from './util/ptxInteraction';

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
            return this.getCmds(element.getCmdId());
        }
        else {
            return this.getCmds();
        }
    }

    private async getCmds(parentCmdId?: string): Promise<PtxGenConfig[]> {
        console.log('test')
        let descMenuconfig = '-';
        let descPlatformconfig = '-';
        let descToolchain = '-';
        let ws = '';
        if (this.workspaceRoot && this.workspaceRoot !== '') {
            ws = this.workspaceRoot;
            const selectedPtxconfig = await ptxdistGetSelectedConfig(this.workspaceRoot);
            const selectedPlatformconfig = await ptxdistGetSelectedPlatform(this.workspaceRoot);
            const selectedToolchain = await ptxdistGetSelectedToolchain(this.workspaceRoot);
            console.log(selectedPtxconfig);
            if (selectedPtxconfig.length == 1) {
                descMenuconfig = selectedPtxconfig[0];
            }
            if (selectedPlatformconfig.length == 1) {
                descPlatformconfig = selectedPlatformconfig[0];
            }
            if (selectedToolchain.length == 1) {
                descToolchain = selectedToolchain[0];
            }
        }
        const rootCmds = [
            /*new PtxGenConfig(
                "Current platform :", 
                "-", 
                "Shows the currently selected platform based on the selected menu- and platformconfig",
                "currPlatform", 
                vscode.TreeItemCollapsibleState.None),*/
            new PtxGenConfig(
                "Current menuconfig :", 
                descMenuconfig.replace(ws, '.'), 
                descMenuconfig,
                "selMenuConfig", 
                vscode.TreeItemCollapsibleState.None, 
                "vscode-ptxdist.selectPtxConfig"),
            new PtxGenConfig(
                "Current platformconfig :", 
                descPlatformconfig.replace(ws, '.'), 
                descPlatformconfig,
                "selPlatformConfig", 
                vscode.TreeItemCollapsibleState.None,
                "vscode-ptxdist.selectPlatformConfig"),
            new PtxGenConfig(
                "Current toolchain :", 
                descToolchain, 
                descToolchain,
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
