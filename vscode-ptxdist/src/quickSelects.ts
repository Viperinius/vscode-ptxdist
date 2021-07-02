import * as vscode from 'vscode';

class PackageItem implements vscode.QuickPickItem {

	label: string;
	description = '';
	
	constructor(public name: string) {
		this.label = name;
	}
}

export async function createQuickPickForConfig(itemNames: string[], exclusiveSelect?: boolean) {
	const disposeables: vscode.Disposable[] = [];
	//let tempSelectedItems: PackageItem[] = [];
	try {
		return await new Promise<string[] | undefined>((resolve, reject) => {
			const input = vscode.window.createQuickPick<PackageItem>();
			//input.placeholder = 'Start typing the names of wanted packages';
			input.ignoreFocusOut = true;
			if (exclusiveSelect !== undefined)
				input.canSelectMany = exclusiveSelect;
			else
				input.canSelectMany = true;

			// dont use "searching" (onDidChangeValue) for now
			input.busy = true;
			if (!itemNames) {
				input.items = [];
				return;
			}
			itemNames.forEach(p => {
				if (!input.items.filter(i => i.label === p).length) {
					input.items = input.items.concat([new PackageItem(p)]);
				}
			});
			input.busy = false;

			disposeables.push(
				/*input.onDidChangeValue(value => {
					if (!value) {
						input.items = [];
						return;
					}
					input.busy = true;
					const config = vscode.workspace.getConfiguration();
					const favPkgs = config.get("vscode-ptxdist.presets.favouritePackages");
					if (!favPkgs) {
						input.items = [];
						return;
					}
					(favPkgs as string[]).forEach(p => {
						if (!input.items.filter(i => i.label === p).length) {
							input.items = input.items.concat([new PackageItem(p)]);
						}
					});
					input.busy = false;
				}),
				input.onDidChangeSelection(items => {
					items.forEach(item => {
						if (!tempSelectedItems.includes(item)) {
							tempSelectedItems.push(item);
						}
					});
				}),*/
				input.onDidHide(() => {
					resolve(undefined);
					input.dispose();
				}),
				input.onDidAccept(() => {
					//resolve(tempSelectedItems.map(item => item.label));
					resolve(input.selectedItems.map(item => item.label));
					input.hide();
				})
			);
			input.show();
		});
	}
	finally {
		disposeables.forEach(d => d.dispose());
	}
}
