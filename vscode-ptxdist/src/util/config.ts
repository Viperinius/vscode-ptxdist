import * as vscode from 'vscode';

function getConfigValues<T>(configEntry: string): T | undefined {
    const config = vscode.workspace.getConfiguration();
    return config.get<T>(configEntry);
}

export function getWorkspaceRoot(): string | undefined {
    return getConfigValues<string>('vscode-ptxdist.workspaceRoot');
}

export function getFavPkgs(): string[] | undefined {
    return getConfigValues<string[]>('vscode-ptxdist.presets.favouritePackages');
}
