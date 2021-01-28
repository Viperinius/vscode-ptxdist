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
exports.createQuickPickForConfig = void 0;
const vscode = require("vscode");
class PackageItem {
    constructor(name) {
        this.name = name;
        this.description = '';
        this.label = name;
    }
}
function createQuickPickForConfig(configEntry) {
    return __awaiter(this, void 0, void 0, function* () {
        const disposeables = [];
        //let tempSelectedItems: PackageItem[] = [];
        try {
            return yield new Promise((resolve, reject) => {
                const input = vscode.window.createQuickPick();
                //input.placeholder = 'Start typing the names of wanted packages';
                input.ignoreFocusOut = true;
                input.canSelectMany = true;
                // dont use "searching" (onDidChangeValue) for now
                input.busy = true;
                const config = vscode.workspace.getConfiguration();
                const favPkgs = config.get(configEntry);
                if (!favPkgs) {
                    input.items = [];
                    return;
                }
                favPkgs.forEach(p => {
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
                }), input.onDidAccept(() => {
                    //resolve(tempSelectedItems.map(item => item.label));
                    resolve(input.selectedItems.map(item => item.label));
                    input.hide();
                }));
                input.show();
            });
        }
        finally {
            disposeables.forEach(d => d.dispose());
        }
    });
}
exports.createQuickPickForConfig = createQuickPickForConfig;
//# sourceMappingURL=quickSelects.js.map