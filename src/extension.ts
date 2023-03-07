import assert = require('assert');
import * as vscode from 'vscode';
import { PtxCommandsProvider } from './ptxCommands';
import { PtxGeneralConfigProvider, PtxGenConfig } from './ptxGeneralConfig';
import { createQuickPickForConfig } from './quickSelects';
import { MenuCompletionItemProvider } from './ptxCompletionItemProviders';
import { getFavPkgs, getWorkspaceRoot, setCurrentMenuconfigSetting, setCurrentPlatformconfigSetting, setCurrentToolchainSetting } from './util/config';
import { exec } from './util/execShell';
import { findDirs, findFiles, findLinks } from './util/fsInteraction';
import * as ptxInteraction from './util/ptxInteraction';
import { getProviderIdentifier, PtxDefaultTaskFilter, PtxDefaultTaskProvider, ptxFlags, PtxTask, PtxTaskFilter, PtxTaskProvider } from './util/tasks';

let ptxTaskProviders: Map<string, vscode.Disposable> = new Map<string, vscode.Disposable>();
let ptxDefaultTaskProviders: Map<string, vscode.Disposable> = new Map<string, vscode.Disposable>();

async function prepareAndRunPtxTaskWithFlags(workspaceRootPath: string, commandType: string) {
	const favPkgs = getFavPkgs();
	const packages = await createQuickPickForConfig(favPkgs ? favPkgs : []);
	if (!packages?.length) {
		return;
	}
	const selectMultiple = false;
	const flags = await createQuickPickForConfig([...ptxFlags.keys()], selectMultiple);
	if (selectMultiple) {
		assert(flags?.length === 1, "Should have returned only one flag value");
	}
	if (!flags) {
		return;
	}

	const id = getProviderIdentifier(commandType, packages, flags[0]);
	if (ptxTaskProviders.size === 0 || !ptxTaskProviders.has(id)) {
		ptxTaskProviders.set(id, vscode.tasks.registerTaskProvider(PtxTaskProvider.ptxTaskType, new PtxTaskProvider(workspaceRootPath, packages, [commandType], flags)));
	}
	let ptxTasks = await vscode.tasks.fetchTasks(new PtxTaskFilter);
	let pkgsTask = ptxTasks.find((element) => (element.definition as PtxTask).id === id);
	if (pkgsTask) {
		vscode.tasks.executeTask(pkgsTask);
	}
	else {
		vscode.window.showErrorMessage(`Could not find the task with ID: ${id}!`);
	}
}

async function prepareAndRunPtxTask(workspaceRootPath: string, commandType: string) {
	const favPkgs = getFavPkgs();
	const packages = await createQuickPickForConfig(favPkgs ? favPkgs : []);
	if (!packages?.length) {
		return;
	}

	const id = getProviderIdentifier(commandType, packages);
	if (ptxTaskProviders.size === 0 || !ptxTaskProviders.has(id)) {
		ptxTaskProviders.set(id, vscode.tasks.registerTaskProvider(PtxTaskProvider.ptxTaskType, new PtxTaskProvider(workspaceRootPath, packages, [commandType])));
	}
	let ptxTasks = await vscode.tasks.fetchTasks(new PtxTaskFilter);
	let pkgsTask = ptxTasks.find((element) => (element.definition as PtxTask).id === id);
	if (pkgsTask) {
		vscode.tasks.executeTask(pkgsTask);
	}
	else {
		vscode.window.showErrorMessage(`Could not find the task with ID: ${id}!`);
	}
}

async function prepareAndRunPtxDefaultTaskWithFlags(workspaceRootPath: string, commandType: string) {
	const selectMultiple = false;
	const flags = await createQuickPickForConfig([...ptxFlags.keys()], selectMultiple);
	if (selectMultiple) {
		assert(flags?.length === 1, "Should have returned only one flag value");
	}
	if (!flags) {
		return;
	}
	
	const id = getProviderIdentifier(commandType, [], flags[0]);
	if (ptxDefaultTaskProviders.size === 0 || !ptxDefaultTaskProviders.has(id)) {
		ptxDefaultTaskProviders.set(id, vscode.tasks.registerTaskProvider(PtxDefaultTaskProvider.ptxTaskType, new PtxDefaultTaskProvider(workspaceRootPath, [commandType], flags)));
	}
	let ptxDefaultTasks = await vscode.tasks.fetchTasks(new PtxDefaultTaskFilter);
	let task = ptxDefaultTasks.find((element) => (element.definition as PtxTask).id === id);
	if (task) {
		vscode.tasks.executeTask(task);
	}
	else {
		vscode.window.showErrorMessage(`Could not find the task with ID: ${id}!`);
	}
}

async function prepareAndRunPtxDefaultTask(workspaceRootPath: string, commandType: string) {
	const id = getProviderIdentifier(commandType, []);
	if (ptxDefaultTaskProviders.size === 0 || !ptxDefaultTaskProviders.has(id)) {
		ptxDefaultTaskProviders.set(id, vscode.tasks.registerTaskProvider(PtxDefaultTaskProvider.ptxTaskType, new PtxDefaultTaskProvider(workspaceRootPath, [commandType])));
	}
	let ptxDefaultTasks = await vscode.tasks.fetchTasks(new PtxDefaultTaskFilter);
	let task = ptxDefaultTasks.find((element) => (element.definition as PtxTask).id === id);
	if (task) {
		vscode.tasks.executeTask(task);
	}
	else {
		vscode.window.showErrorMessage(`Could not find the task with ID: ${id}!`);
	}
}

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-ptxdist" is now active!');

	let workspaceRootPath: string = '';
	if (vscode.workspace.workspaceFolders) {
		// try to load workspaceRoot from config
		const configuredRoot = getWorkspaceRoot();
		if (!configuredRoot || configuredRoot === '') {
			vscode.window.showErrorMessage('No workspace root path has been specified. Please provide this setting in the workspace settings.', 'Go to settings').then((res) => {
				if (res !== undefined) {
					vscode.commands.executeCommand('workbench.action.openSettings', '@ext:Viperinius.vscode-ptxdist vscode-ptxdist.workspaceRoot');
				}
			});
		}
		else {
			workspaceRootPath = configuredRoot;
			findDirs(workspaceRootPath, '*ptxproj', 1).then(values => {
				if (values.length === 0 || values[0] === '') {
					findLinks(workspaceRootPath, '*ptxproj', 1).then(values => {
						if (values.length === 0 || values[0] === '') {
							vscode.window.showErrorMessage('Unable to find a "ptxproj" directory in the configured workspace root path!', 'Check settings').then((res) => {
								if (res !== undefined) {
									vscode.commands.executeCommand('workbench.action.openSettings', '@ext:Viperinius.vscode-ptxdist vscode-ptxdist.workspaceRoot');
								}
							});
						}
					});
				}
			});
		}

		// const wsWithPtxproj = vscode.workspace.workspaceFolders.find(w => w.uri.fsPath.includes('ptxproj'));
		// workspaceRootPath = wsWithPtxproj ? wsWithPtxproj.uri.fsPath : '';
		// if (workspaceRootPath === '')
		// 	workspaceRootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	}
	else {
		if (vscode.workspace.rootPath) {
			workspaceRootPath = vscode.workspace.rootPath;
		}
	}
	console.log(workspaceRootPath);
	if (workspaceRootPath === '') {
		return;
	}

	// register tree views

	const ptxGeneralConfigProvider = new PtxGeneralConfigProvider(workspaceRootPath);
	const ptxCommandsProvider = new PtxCommandsProvider();
	vscode.window.registerTreeDataProvider('ptxdist-general-config', ptxGeneralConfigProvider);
	vscode.window.registerTreeDataProvider('ptxdist-commands', ptxCommandsProvider);

	// register commands

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.printWorkspaceRoot', async () => {
		let cmd: string = '';
		if (workspaceRootPath !== '') {
			cmd = 'ls "' + workspaceRootPath + '"';
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
		
		const items = filteredResults.map(label => ({ label: label.replace(workspaceRootPath, '.'), detail: label }));
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = items;
		quickPick.onDidChangeSelection(([{ label, detail }]) => {
			const shellResult = ptxInteraction.ptxdistSelect(workspaceRootPath, detail!);
			if (!shellResult) {
				vscode.window.showErrorMessage(`Could not set ${label} as menuconfig`);
			}
			else {
				vscode.window.showInformationMessage(`Selected: ${label}`);
				element.description = label.replace(workspaceRootPath, '.');
				element.tooltip = detail!;
				ptxGeneralConfigProvider.refresh([element]);
				setCurrentMenuconfigSetting(detail!);
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
		
		const items = filteredResults.map(label => ({ label: label.replace(workspaceRootPath, '.'), detail: label }));
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = items;
		quickPick.onDidChangeSelection(([{ label, detail }]) => {
			const shellResult = ptxInteraction.ptxdistPlatform(workspaceRootPath, detail!);
			if (!shellResult) {
				vscode.window.showErrorMessage(`Could not set ${label} as platformconfig`);
			}
			else {
				vscode.window.showInformationMessage(`Selected: ${label}`);
				element.description = label.replace(workspaceRootPath, '.');
				element.tooltip = detail!;
				ptxGeneralConfigProvider.refresh([element]);
				setCurrentPlatformconfigSetting(detail!);
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
				setCurrentToolchainSetting(label);
				// TODO check if current platform still correct
			}
			quickPick.hide();
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-addPreset', async () => {
		
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-cleanAll', async () => {
		const response = await vscode.window.showWarningMessage("Do you really want to clean all packages?", 'Yes', 'No');
    	if (response === 'Yes') {
			prepareAndRunPtxDefaultTask(workspaceRootPath, 'clean');
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-cleanPkgs', async () => {
		prepareAndRunPtxTask(workspaceRootPath, 'clean');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-distclean', async () => {
		const response = await vscode.window.showWarningMessage("Do you really want to clean everything?", 'Yes', 'No');
    	if (response === 'Yes') {
			prepareAndRunPtxDefaultTask(workspaceRootPath, 'distclean');
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-goAll', async () => {
		prepareAndRunPtxDefaultTaskWithFlags(workspaceRootPath, 'go');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-goPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'go');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-targetinstallPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'targetinstall');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-installPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'install');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-compilePkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'compile');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-preparePkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'prepare');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-extractPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'extract');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-urlcheckAll', async () => {
		prepareAndRunPtxDefaultTaskWithFlags(workspaceRootPath, 'urlcheck');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-urlcheckPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'urlcheck');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-getAll', async () => {
		prepareAndRunPtxDefaultTaskWithFlags(workspaceRootPath, 'get');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-getPkgs', async () => {
		prepareAndRunPtxTaskWithFlags(workspaceRootPath, 'get');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-ptxdist.ptxcmd-imagesAll', async () => {
		prepareAndRunPtxDefaultTaskWithFlags(workspaceRootPath, 'images');
	}));

	// register auto complete providers

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('ptxmenuentry', new MenuCompletionItemProvider()));
	
}

export function deactivate() {}
