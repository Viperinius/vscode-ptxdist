import * as vscode from 'vscode';
import * as path from 'path';

export class PtxCommandsProvider implements vscode.TreeDataProvider<PtxCommand> {
    constructor() {}

    getTreeItem(element: PtxCommand): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PtxCommand): Thenable<PtxCommand[]> {
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

    private getCmds(parentCmdId?: string): PtxCommand[] {
        const rootCmds = [
            new PtxCommand("Clean", "Run ptxdist clean", "clean", vscode.TreeItemCollapsibleState.Collapsed, "trash"),
            new PtxCommand("Go", "Run ptxdist go", "go", vscode.TreeItemCollapsibleState.Collapsed, "combine"),
            new PtxCommand("Get", "Run ptxdist get", "get", vscode.TreeItemCollapsibleState.Collapsed, "cloud-download"),
            new PtxCommand("Extract", "Run ptxdist extract", "extract", vscode.TreeItemCollapsibleState.Collapsed, "unfold"),
            new PtxCommand("Prepare", "Run ptxdist prepare", "prepare", vscode.TreeItemCollapsibleState.Collapsed, "settings"),
            new PtxCommand("Compile", "Run ptxdist compile", "compile", vscode.TreeItemCollapsibleState.Collapsed, "combine"),
            new PtxCommand("Install", "Run ptxdist install", "install", vscode.TreeItemCollapsibleState.Collapsed, "references"),
            new PtxCommand("Targetinstall", "Run ptxdist targetinstall", "targetinstall", vscode.TreeItemCollapsibleState.Collapsed, "references"),
            new PtxCommand("Images", "Run ptxdist images", "images", vscode.TreeItemCollapsibleState.Collapsed, "file-zip"),
            new PtxCommand("URLcheck", "Run ptxdist urlcheck", "urlcheck", vscode.TreeItemCollapsibleState.Collapsed, "radio-tower"),
        ];
        const children: Record<string, PtxCommand[]> = {
            "clean": [
                new PtxCommand(
                    "All", 
                    "Cleans all packages", 
                    "cleanAll", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run-all", 
                    "vscode-ptxdist.ptxcmd-cleanAll"),
                new PtxCommand(
                    "Specified package(s)", 
                    "Cleans only some packages", 
                    "cleanSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run", 
                    "vscode-ptxdist.ptxcmd-cleanPkgs",
                    "isCmdWithPreset"),
                new PtxCommand(
                    "Distclean", 
                    "Runs distclean to clean even more!", 
                    "distclean", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run-all", 
                    "vscode-ptxdist.ptxcmd-distclean")
            ],
            "go": [
                new PtxCommand(
                    "All", 
                    "Builds all packages", 
                    "goAll", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run-all",
                    "vscode-ptxdist.ptxcmd-goAll"),
                new PtxCommand(
                    "Specified package(s)", 
                    "Builds only some packages", 
                    "goSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-goPkgs",
                    "isCmdWithPreset")
            ],
            "targetinstall": [
                new PtxCommand(
                    "Specified package(s)", 
                    "Installs only some packages", 
                    "targetinstallSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-targetinstallPkgs",
                    "isCmdWithPreset")
            ],
            "install": [
                new PtxCommand(
                    "Specified package(s)", 
                    "Installs only some packages", 
                    "installSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-installPkgs",
                    "isCmdWithPreset")
            ],
            "compile": [
                new PtxCommand(
                    "Specified package(s)", 
                    "Compiles only some packages", 
                    "compileSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-compilePkgs",
                    "isCmdWithPreset")
            ],
            "prepare": [
                new PtxCommand(
                    "Specified package(s)", 
                    "Prepares only some packages", 
                    "prepareSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-preparePkgs",
                    "isCmdWithPreset")
            ],
            "extract": [
                new PtxCommand(
                    "Specified package(s)", 
                    "Extract only some packages", 
                    "extractSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-extractPkgs",
                    "isCmdWithPreset")
            ],
            "urlcheck": [
                new PtxCommand(
                    "All", 
                    "Check URLs of all packages", 
                    "urlcheckAll", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run-all",
                    "vscode-ptxdist.ptxcmd-urlcheckAll"),
                new PtxCommand(
                    "Specified package(s)", 
                    "Check URLs of only some packages", 
                    "urlcheckSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-urlcheckPkgs",
                    "isCmdWithPreset")
            ],
            "get": [
                new PtxCommand(
                    "All", 
                    "Get all packages", 
                    "getAll", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run-all",
                    "vscode-ptxdist.ptxcmd-getAll"),
                new PtxCommand(
                    "Specified package(s)", 
                    "Get only some packages", 
                    "getSpecific", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-getPkgs",
                    "isCmdWithPreset")
            ],
            "images": [
                new PtxCommand(
                    "All", 
                    "Create all images", 
                    "imagesAll", 
                    vscode.TreeItemCollapsibleState.None, 
                    "run",
                    "vscode-ptxdist.ptxcmd-imagesAll")
            ],
        };
        
        if (parentCmdId) {
            return children[parentCmdId];
        }
        else {
            return rootCmds;
        }
    }
}

export class PtxCommand extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private desc: string,
        private readonly cmdId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private iconNameNoExt: string,
        public clickCmd?: string,
        private contextVal?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}: ${this.desc}`;
        this.description = this.desc;
        this.contextValue = this.contextVal;
        if (this.clickCmd) {
            this.command = {
                "title": "",
                "command": this.clickCmd,
                "arguments": [this]
            };
        }
    }

    iconPath = new vscode.ThemeIcon(this.iconNameNoExt);

    getCmdId(): string {
        return this.cmdId;
    }
}
