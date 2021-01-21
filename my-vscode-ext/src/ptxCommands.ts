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
            new PtxCommand("Go", "Run ptxdist go", "go", vscode.TreeItemCollapsibleState.Collapsed, "build")
        ];
        const children: Record<string, PtxCommand[]> = {
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

class PtxCommand extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private desc: string,
        private readonly cmdId: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        private iconNameNoExt: string,
        private contextVal?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}: ${this.desc}`;
        this.description = this.desc;
        this.contextValue = this.contextVal;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'light', this.iconNameNoExt + '.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'vscode-icons', 'icons', 'dark', this.iconNameNoExt + '.svg')
    };

    getCmdId(): string {
        return this.cmdId;
    }
}
