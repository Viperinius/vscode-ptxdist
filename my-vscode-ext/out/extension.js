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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const ptxCommands_1 = require("./ptxCommands");
const ptxGeneralConfig_1 = require("./ptxGeneralConfig");
const execShell_1 = require("./util/execShell");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
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
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('vscode-ptxdist.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World there from vscode-ptxdist!');
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('vscode-ptxdist.printWorkspaceRoot', () => __awaiter(this, void 0, void 0, function* () {
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
    }));
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('vscode-ptxdist.selectPtxConfig', () => __awaiter(this, void 0, void 0, function* () {
        let cmd = '';
        if (workspaceRootPath !== '') {
            cmd = 'where /R ' + workspaceRootPath + ' *ptxconfig*';
        }
        if (cmd !== '') {
            const results = yield execShell_1.exec(cmd);
            console.log(results.stdOut);
            console.log('---');
            console.log(results.stdErr);
            function showQuickPick() {
                return __awaiter(this, void 0, void 0, function* () {
                    let i = 0;
                    const result = yield vscode.window.showQuickPick(['configs/platform-A/ptxconfig', 'configs/platf/ptxconfig', 'configs/platf/ptxconfig-b'], {
                        placeHolder: 'Choose a ptxconfig',
                        onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
                    });
                    vscode.window.showInformationMessage(`Got: ${result}`);
                });
            }
            const quickPick = vscode.window.createQuickPick();
            // still with dummy items
            const options = {
                showQuickPick
            };
            quickPick.items = Object.keys(options).map(label => ({ label }));
            quickPick.onDidChangeSelection(selection => {
                if (selection[0]) {
                    options[selection[0].label](context).catch(console.error);
                }
            });
            quickPick.onDidHide(() => quickPick.dispose());
            quickPick.show();
        }
    }));
    context.subscriptions.push(disposable);
    vscode.window.registerTreeDataProvider('ptxdist-general-config', new ptxGeneralConfig_1.PtxGeneralConfigProvider(workspaceRootPath));
    vscode.window.registerTreeDataProvider('ptxdist-commands', new ptxCommands_1.PtxCommandsProvider());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map