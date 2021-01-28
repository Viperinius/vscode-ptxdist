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
const quickSelects_1 = require("./quickSelects");
const execShell_1 = require("./util/execShell");
const fsInteraction_1 = require("./util/fsInteraction");
const ptxInteraction = require("./util/ptxInteraction");
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
    console.log(workspaceRootPath);
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
        const filteredResults = findResult.filter(name => name.includes('configs'));
        console.log(filteredResults);
        const items = filteredResults.map(label => ({ label: label.replace(workspaceRootPath, '.') }));
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.onDidChangeSelection(([{ label }]) => {
            const shellResult = ptxInteraction.ptxdistSelect(workspaceRootPath, label);
            if (!shellResult) {
                vscode.window.showErrorMessage(`Could not set ${label} as menuconfig`);
            }
            else {
                vscode.window.showInformationMessage(`Selected: ${label}`);
                element.description = label.replace(workspaceRootPath, '.');
                element.tooltip = label;
                ptxGeneralConfigProvider.refresh([element]);
                // TODO check if current platform still correct
            }
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectPlatformConfig', (element) => __awaiter(this, void 0, void 0, function* () {
        const findResult = yield fsInteraction_1.findFiles(workspaceRootPath, '*platformconfig*');
        const filteredResults = findResult.filter(name => name.includes('configs'));
        console.log(filteredResults);
        const items = filteredResults.map(label => ({ label }));
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.onDidChangeSelection(([{ label }]) => {
            const shellResult = ptxInteraction.ptxdistPlatform(workspaceRootPath, label);
            if (!shellResult) {
                vscode.window.showErrorMessage(`Could not set ${label} as platformconfig`);
            }
            else {
                vscode.window.showInformationMessage(`Selected: ${label}`);
                element.description = label.replace(workspaceRootPath, '.');
                element.tooltip = label;
                ptxGeneralConfigProvider.refresh([element]);
                // TODO check if current platform still correct
            }
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectToolchain', (element) => __awaiter(this, void 0, void 0, function* () {
        const findResult = yield fsInteraction_1.findDirs('/opt/', '*arm-linux-gnueabihf/bin');
        const items = findResult.map(label => ({ label }));
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.onDidChangeSelection(([{ label }]) => {
            const shellResult = ptxInteraction.ptxdistToolchain(workspaceRootPath, label);
            if (!shellResult) {
                vscode.window.showErrorMessage(`Could not set ${label} as toolchain`);
            }
            else {
                vscode.window.showInformationMessage(`Selected: ${label}`);
                element.description = label.replace(workspaceRootPath, '.');
                element.tooltip = label;
                ptxGeneralConfigProvider.refresh([element]);
                // TODO check if current platform still correct
            }
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-addPreset', () => __awaiter(this, void 0, void 0, function* () {
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-cleanAll', () => __awaiter(this, void 0, void 0, function* () {
        const response = yield vscode.window.showWarningMessage("Do you really want to clean all packages?", 'Yes', 'No');
        if (response === 'Yes') {
            ptxInteraction.ptxdistClean(workspaceRootPath, true);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-cleanPkgs', () => __awaiter(this, void 0, void 0, function* () {
        const packages = yield quickSelects_1.createQuickPickForConfig("vscode-ptxdist.presets.favouritePackages");
        if (!(packages === null || packages === void 0 ? void 0 : packages.length)) {
            return;
        }
        ptxInteraction.ptxdistClean(workspaceRootPath, false, packages);
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map