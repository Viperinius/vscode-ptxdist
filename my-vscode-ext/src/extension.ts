// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PtxCommandsProvider } from './ptxCommands';
import { PtxGeneralConfigProvider } from './ptxGeneralConfig';
import { exec } from './util/execShell';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-ptxdist" is now active!');

	let workspaceRootPath: string = '';
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

	disposable = vscode.commands.registerCommand('vscode-ptxdist.printWorkspaceRoot', async () => {
		let cmd: string = '';
		if (workspaceRootPath !== '') {
			cmd = 'dir "' + workspaceRootPath + '"';
		}
		if (cmd !== '') {
			const results = await exec(cmd);
			console.log(results.stdOut);
			console.log('---');
			console.log(results.stdErr);
		}
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('vscode-ptxdist.selectPtxConfig', async () => {
		let cmd: string = '';
		if (workspaceRootPath !== '') {
			cmd = 'where /R ' + workspaceRootPath + ' *ptxconfig*';
		}
		if (cmd !== '') {
			const results = await exec(cmd);
			console.log(results.stdOut);
			console.log('---');
			console.log(results.stdErr);
			
			async function showQuickPick() {
				let i = 0;
				const result = await vscode.window.showQuickPick(['configs/platform-A/ptxconfig', 'configs/platf/ptxconfig', 'configs/platf/ptxconfig-b'], {
					placeHolder: 'Choose a ptxconfig',
					onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
				});
				vscode.window.showInformationMessage(`Got: ${result}`);
			}

			const quickPick = vscode.window.createQuickPick();
			// still with dummy items
			const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
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
	});
	context.subscriptions.push(disposable);


	vscode.window.registerTreeDataProvider('ptxdist-general-config', new PtxGeneralConfigProvider(workspaceRootPath));
	vscode.window.registerTreeDataProvider('ptxdist-commands', new PtxCommandsProvider());
}

// this method is called when your extension is deactivated
export function deactivate() {}
