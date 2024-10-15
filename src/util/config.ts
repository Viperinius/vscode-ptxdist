import * as vscode from 'vscode';

function getConfigValues<T>(configEntry: string): T | undefined {
    const config = vscode.workspace.getConfiguration();
    return config.get<T>(configEntry);
}

function setConfigValue<T>(configKey: string, newValue: T) {
    const config = vscode.workspace.getConfiguration();
    config.update(configKey, newValue, vscode.ConfigurationTarget.Workspace);
}

export function getRestrictConfigSearch() {
    return getConfigValues<boolean>('vscode-ptxdist.search.configs.restrict');
}

export function getWorkspaceRoot(): string | undefined {
    return getConfigValues<string>('vscode-ptxdist.workspaceRoot');
}

export function getFavPkgs(): string[] | undefined {
    return getConfigValues<string[]>('vscode-ptxdist.presets.favouritePackages');
}

export function getFavCmds(): FavCmdConfig[] | undefined {
    return getConfigValues<FavCmdConfig[]>('vscode-ptxdist.presets.favouriteCommands');
}

export function setCurrentMenuconfigSetting(newValue: string) {
    setConfigValue<string>('vscode-ptxdist.current.menuconfig', newValue);
}

export function setCurrentPlatformconfigSetting(newValue: string) {
    setConfigValue<string>('vscode-ptxdist.current.platformconfig', newValue);
}

export function setCurrentToolchainSetting(newValue: string) {
    setConfigValue<string>('vscode-ptxdist.current.toolchain', newValue);
}

export function setAddFavCmd(newValue: FavCmdConfig) {
    const values = getFavCmds();
    if (values) {
        values.push(newValue);
        setConfigValue<FavCmdConfig[]>('vscode-ptxdist.presets.favouriteCommands', values);
        return;
    }

    setConfigValue<FavCmdConfig[]>('vscode-ptxdist.presets.favouriteCommands', [newValue]);
}

export interface FavCmdConfigParts {
    cmd: string;
    pkgs: string;
    flags: string;
}

export interface FavCmdConfig {
    name: string;
    parts: FavCmdConfigParts[];
}
