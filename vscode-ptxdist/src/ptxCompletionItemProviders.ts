import * as vscode from 'vscode';

export class MenuCompletionItemProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]> {
        return Promise.resolve([
            new vscode.CompletionItem('config'),
            new vscode.CompletionItem('menuconfig'),
            new vscode.CompletionItem('if'),
            new vscode.CompletionItem('endif'),
            new vscode.CompletionItem('comment'),
            new vscode.CompletionItem('menu'),
            new vscode.CompletionItem('endmenu'),
            new vscode.CompletionItem('source'),
            new vscode.CompletionItem('choice'),
            new vscode.CompletionItem('endchoice'),
            new vscode.CompletionItem('default'),
            new vscode.CompletionItem('depends on'),
            new vscode.CompletionItem('help'),
            new vscode.CompletionItem('prompt'),
            new vscode.CompletionItem('select'),
            new vscode.CompletionItem('string'),
            new vscode.CompletionItem('bool'),
            new vscode.CompletionItem('int'),
            new vscode.CompletionItem('tristate'),
            new vscode.CompletionItem('hex')
        ]);
    }
}
