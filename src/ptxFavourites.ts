import * as vscode from 'vscode';
import { FavCmdConfig, FavCmdConfigParts, getFavCmds, getFavPkgs } from './util/config';
import { logToOutput } from './util/logging';
import { createQuickPick, createQuickPickForConfig } from './quickSelects';
import { PTX_PKG_COMMANDS, PTX_PKG_STAGES } from './ptxCommands';
import { ptxFlags } from './util/tasks';

const addAnotherCmdLabel = 'Add another command to the chain';

export const createNewFavCmd = async (): Promise<FavCmdConfig | undefined> => {
    const favPkgs = getFavPkgs();

    const name = await vscode.window.showInputBox({
        placeHolder: 'Preset name',
    });
    if (!name) {
        logToOutput(vscode.LogLevel.Error, `no name given for creating favourited command`);
        return undefined;
    }

    const selectMultiple = false;
    let addAnotherCmd = true;
    const commandParts: FavCmdConfigParts[] = [];
    while (addAnotherCmd) {
        let stepCurrent = 1;
        let stepTotal = 4;

        const commands = await createQuickPick(PTX_PKG_COMMANDS, selectMultiple, stepCurrent, stepTotal);
        if (!commands) {
            logToOutput(vscode.LogLevel.Error, `no command selected for creating favourited command`);
            break;
        }
        let command = commands[0];
        stepCurrent++;

        if (command === 'drop') {
            stepTotal += 1;
            const stages = await createQuickPick(PTX_PKG_STAGES, selectMultiple, stepCurrent, stepTotal);
            if (!stages) {
                logToOutput(vscode.LogLevel.Error, `no stage selected for creating favourited command with "drop" command`);
                break;
            }
            command += `.${stages[0]}`;
            stepCurrent++;
        }

        const packages = await createQuickPickForConfig(favPkgs ? favPkgs : [], undefined, stepCurrent, stepTotal);
        stepCurrent++;

        const flags = await createQuickPickForConfig([...ptxFlags.keys()], selectMultiple, stepCurrent, stepTotal);
        stepCurrent++;

        commandParts.push({
            cmd: command,
            pkgs: packages?.join(',') ?? '',
            flags: flags?.join(',') ?? '(none)',
        });

        const addAnotherResult = await createQuickPick([addAnotherCmdLabel, 'Finish'], selectMultiple, stepTotal, stepTotal);
        addAnotherCmd = addAnotherResult?.[0] === addAnotherCmdLabel;
    }

    if (!commandParts) {
        return undefined;
    }

    return {
        name: name,
        parts: commandParts
    };
};

export class PtxFavCmdProvider implements vscode.TreeDataProvider<PtxFavCmdItem> {
    constructor(private workspaceRoot?: string) {
        if (this.workspaceRoot === '') {
            this.workspaceRoot = undefined;
        }
        this._rootElems = this.getRootElems();
    }

    private _rootElems: PtxFavCmdItem[];

    private _onDidChangeTreeData: vscode.EventEmitter<PtxFavCmdItem | undefined | null | void> = new vscode.EventEmitter<PtxFavCmdItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<PtxFavCmdItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(elementsToModify: PtxFavCmdItem[]): void {
        this._rootElems = this.getRootElems();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PtxFavCmdItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: PtxFavCmdItem): Thenable<PtxFavCmdItem[]> {
        return Promise.resolve(this._rootElems);
    }

    private getRootElems(): PtxFavCmdItem[] {
        const result: PtxFavCmdItem[] = [];
        const rawFavCmds = getFavCmds();
        if (!rawFavCmds) {
            return result;
        }

        rawFavCmds.forEach(rawFavCmd => {
            result.push(new PtxFavCmdItem(
                rawFavCmd.name,
                '',
                '',
                `fav-${rawFavCmd}`,
                rawFavCmd.parts,
                'vscode-ptxdist.execFavCommand',
                'star-full',
                undefined,
                undefined)
            );
        });

        return result;
    }
}

export class PtxFavCmdItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private desc: string,
        public tooltip: string,
        private readonly cmdId: string,
        public rawCmd: FavCmdConfigParts[],
        public clickCmd?: string,
        private iconName?: string,
        private iconColor?: vscode.ThemeColor,
        private contextVal?: string,
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
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
