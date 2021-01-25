import * as vscode from 'vscode';
import { PtxCommandsProvider } from './ptxCommands';
import { PtxGeneralConfigProvider, PtxGenConfig } from './ptxGeneralConfig';
import { exec } from './util/execShell';
import { findDirs, findFiles } from './util/fsInteraction';
import * as ptxInteraction from './util/ptxInteraction';
import { runInTerminal } from './util/terminalInteraction';

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
	console.log(workspaceRootPath);

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
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectPlatformConfig', async (element: PtxGenConfig) => {
		const findResult = await findFiles(workspaceRootPath, '*platformconfig*');
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
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.selectToolchain', async (element: PtxGenConfig) => {
		const findResult = await findDirs('/opt/', '*arm-linux-gnueabihf/bin');
		
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
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-addPreset', () => {
		console.log(vscode.window.terminals);
		runInTerminal('PTXdist', 'echo "Hello"', true);
	}));
	
}

export function deactivate() {}
