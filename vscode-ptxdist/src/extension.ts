import * as vscode from 'vscode';
import { PtxCommandsProvider } from './ptxCommands';
import { PtxGeneralConfigProvider, PtxGenConfig } from './ptxGeneralConfig';
import { exec } from './util/execShell';
import { findFiles } from './util/fsInteraction';

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

	// register tree views

	const ptxGeneralConfigProvider = new PtxGeneralConfigProvider(workspaceRootPath);
	const ptxCommandsProvider = new PtxCommandsProvider();
	vscode.window.registerTreeDataProvider('ptxdist-general-config', ptxGeneralConfigProvider);
	vscode.window.registerTreeDataProvider('ptxdist-commands', ptxCommandsProvider);

	// register commands

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World there from vscode-ptxdist!');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.printWorkspaceRoot', async () => {
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
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectPtxConfig', async (element: PtxGenConfig) => {
		const findResult = await findFiles(workspaceRootPath, '*ptxconfig*');
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
	}));


	
}

export function deactivate() {}
