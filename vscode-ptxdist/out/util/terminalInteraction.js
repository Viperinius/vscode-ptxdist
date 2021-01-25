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
exports.runInTerminal = exports.getOrCreateTerminal = void 0;
const vscode = require("vscode");
/**
 * Get a terminal by name and create it if necessary
 * @param name terminal name
 */
function getOrCreateTerminal(name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.window.terminals.length === 0 || vscode.window.terminals.filter(term => term.name === name).length === 0) {
            return vscode.window.createTerminal(name);
        }
        return vscode.window.terminals.filter(term => term.name === name)[0];
    });
}
exports.getOrCreateTerminal = getOrCreateTerminal;
/**
 * Run a command in a separate shell (in the integrated terminal)
 * @param name terminal name
 * @param command command to execute
 * @param reveal if true, moves this terminal to be visible
 * @param takeFocus if true, this terminal grabs the focus
 */
function runInTerminal(name, command, reveal, takeFocus) {
    return __awaiter(this, void 0, void 0, function* () {
        const term = yield getOrCreateTerminal(name);
        if (reveal) {
            term.show(takeFocus);
        }
        term.sendText(command);
    });
}
exports.runInTerminal = runInTerminal;
//# sourceMappingURL=terminalInteraction.js.map