import * as vscode from 'vscode';

/**
 * Get a terminal by name and create it if necessary
 * @param name terminal name
 */
export async function getOrCreateTerminal(name: string): Promise<vscode.Terminal> {
    if (vscode.window.terminals.length === 0 || vscode.window.terminals.filter(term => term.name === name).length === 0) {
        return vscode.window.createTerminal(name);
    }
    return vscode.window.terminals.filter(term => term.name === name)[0];
}

/**
 * Run a command in a separate shell (in the integrated terminal)
 * @param name terminal name
 * @param command command to execute
 * @param reveal if true, moves this terminal to be visible
 * @param takeFocus if true, this terminal grabs the focus
 */
export async function runInTerminal(name: string, command: string, reveal?: boolean, takeFocus?: boolean): Promise<void> {
    const term = await getOrCreateTerminal(name);
    if (reveal)
    {
        term.show(takeFocus);
    }
    term.sendText(command);
}
