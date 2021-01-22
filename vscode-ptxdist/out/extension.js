"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ptxCommands_1 = require("./ptxCommands");
const ptxGeneralConfig_1 = require("./ptxGeneralConfig");
const execShell_1 = require("./util/execShell");
const fsInteraction_1 = require("./util/fsInteraction");
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-ptxdist" is now active!');
    let workspaceRootPath = '';
    if (vscode.workspace.workspaceFolders) {
        workspaceRootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    else {
        if (vscode.workspace.rootPath) {
            workspaceRootPath = vscode.workspace.rootPath;
        }
    }
    // register tree views
    const ptxGeneralConfigProvider = new ptxGeneralConfig_1.PtxGeneralConfigProvider(workspaceRootPath);
    const ptxCommandsProvider = new ptxCommands_1.PtxCommandsProvider();
    vscode.window.registerTreeDataProvider('ptxdist-general-config', ptxGeneralConfigProvider);
    vscode.window.registerTreeDataProvider('ptxdist-commands', ptxCommandsProvider);
    // register commands
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World there from vscode-ptxdist!');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.printWorkspaceRoot', () => __awaiter(this, void 0, void 0, function* () {
        let cmd = '';
        if (workspaceRootPath !== '') {
            cmd = 'dir "' + workspaceRootPath + '"';
        }
        if (cmd !== '') {
            const results = yield execShell_1.exec(cmd);
            console.log(results.stdOut);
            console.log('---');
            console.log(results.stdErr);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectPtxConfig', (element) => __awaiter(this, void 0, void 0, function* () {
        const findResult = yield fsInteraction_1.findFiles(workspaceRootPath, '*ptxconfig*');
        console.log(findResult);
        const items = findResult.map(label => ({ label }));
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.onDidChangeSelection(([{ label }]) => {
            vscode.window.showInformationMessage(`Selected: ${label}`);
            element.description = label.replace(workspaceRootPath, '.');
            element.tooltip = label;
            ptxGeneralConfigProvider.refresh([element]);
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map