import * as vscode from 'vscode';
import * as path from 'path';
import { ptxdistGetAvailableMenuconfigs, ptxdistGetAvailablePlatformconfigs, ptxdistGetAvailableToolchains, ptxdistGetSelectedConfig, ptxdistGetSelectedPlatform, ptxdistGetSelectedToolchain } from './util/ptxInteraction';
import { buildPtxprojPath } from './util/fsInteraction';

export class PtxGeneralConfigProvider implements vscode.TreeDataProvider<PtxGenConfig> {
    constructor(private workspaceRoot?: string) {
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
        this._rootElems = this.getRootElems();
        this._childElems = {};
    }

    private _rootElems: PtxGenConfig[];
    private _childElems: Record<string, PtxGenConfig[]>;

    private _onDidChangeTreeData: vscode.EventEmitter<PtxGenConfig | undefined | null | void> = new vscode.EventEmitter<PtxGenConfig | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PtxGenConfig | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(elementsToModify: PtxGenConfig[]): void {
        this._childElems = {};
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PtxGenConfig): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PtxGenConfig): Thenable<PtxGenConfig[]> {
        if (element) {
            return this.getChildElems(element.getCmdId());
        }
        else {
            return Promise.resolve(this._rootElems);
        }
    }

    private getRootElems(): PtxGenConfig[] {
        return [
            /*new PtxGenConfig(
                "Current platform :", 
                "-", 
                "Shows the currently selected platform based on the selected menu- and platformconfig",
                "currPlatform", 
                vscode.TreeItemCollapsibleState.None),*/
            new PtxGenConfig(
                "Menuconfig",
                '',
                '',
                "menuConfig",
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                undefined,
                undefined,
                "menuConfig"),
            new PtxGenConfig(
                "Platformconfig",
                '',
                '',
                "platformConfig",
                vscode.TreeItemCollapsibleState.Expanded),
            new PtxGenConfig(
                "Toolchain",
                '',
                '',
                "toolchain",
                vscode.TreeItemCollapsibleState.Expanded)
        ];
    }

    private async getChildElems(parentCmdId: string): Promise<PtxGenConfig[]> {
        if (parentCmdId in this._childElems) {
            return Promise.resolve(this._childElems[parentCmdId]);
        }

        let selMenuconfig = '-';
        let selPlatformconfig = '-';
        let selToolchain = '-';

        if (!this.workspaceRoot) {
            return [];
        }

        let ws = this.workspaceRoot;
        if (!ws.endsWith('ptxproj/') && !this.workspaceRoot.endsWith('ptxproj')) {
            ws = buildPtxprojPath(ws);
        }
        const selectedPtxconfig = await ptxdistGetSelectedConfig(ws);
        const selectedPlatformconfig = await ptxdistGetSelectedPlatform(ws);
        const selectedToolchain = await ptxdistGetSelectedToolchain(ws);
        if (selectedPtxconfig.length === 1) {
            selMenuconfig = selectedPtxconfig[0];
        }
        if (selectedPlatformconfig.length === 1) {
            selPlatformconfig = selectedPlatformconfig[0];
        }
        if (selectedToolchain.length === 1) {
            selToolchain = selectedToolchain[0];
        }
        
        const children: Record<string, PtxGenConfig[]> = {
            "menuConfig": [],
            "platformConfig": [],
            "toolchain":  []
        };

        const availableMenuconfigs = await ptxdistGetAvailableMenuconfigs(this.workspaceRoot);
        availableMenuconfigs.forEach(m => {
            children['menuConfig'].push(new PtxGenConfig(
                path.basename(m),
                path.basename(path.dirname(m)),
                m,
                '',
                vscode.TreeItemCollapsibleState.None,
                'vscode-ptxdist.selectPtxConfig',
                m === selMenuconfig ? 'issue-closed' : 'issue-draft',
                m === selMenuconfig ? new vscode.ThemeColor('testing.iconPassed') : undefined,
                m === selMenuconfig ? "menuConfig" : undefined
            ));
        });

        const availablePlatformconfigs = await ptxdistGetAvailablePlatformconfigs(this.workspaceRoot);
        availablePlatformconfigs.forEach(p => {
            children['platformConfig'].push(new PtxGenConfig(
                path.basename(p),
                path.basename(path.dirname(p)),
                p,
                '',
                vscode.TreeItemCollapsibleState.None,
                'vscode-ptxdist.selectPlatformConfig',
                p === selPlatformconfig ? 'issue-closed' : 'issue-draft',
                p === selPlatformconfig ? new vscode.ThemeColor('testing.iconPassed') : undefined
            ));
        });

        const availableToolchains = await ptxdistGetAvailableToolchains();
        availableToolchains.forEach(t => {
            children['toolchain'].push(new PtxGenConfig(
                t,
                '',
                t,
                '',
                vscode.TreeItemCollapsibleState.None,
                'vscode-ptxdist.selectToolchain',
                t === selToolchain ? 'issue-closed' : 'issue-draft',
                t === selToolchain ? new vscode.ThemeColor('testing.iconPassed') : undefined
            ));
        });

        this._childElems = children;
        return this._childElems[parentCmdId];
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
        private iconName?: string,
        private iconColor?: vscode.ThemeColor,
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
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName, iconColor);
        }
    }

    getCmdId(): string {
        return this.cmdId;
    }
}
