import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from './execShell';
import { buildPtxprojPath, currentOsPlatform, findDirs, findFiles, findLinks, OsPlatform } from './fsInteraction';
import { runInTerminal } from './terminalInteraction';
import { getRestrictConfigSearch } from './config';

export async function ptxdistGetNewestBin(): Promise<string> {
    if (currentOsPlatform !== OsPlatform.linux) {
        return 'ptxdist';
    }

    const versionsResult = await exec('which ptxdist | xargs dirname | xargs ls | grep ptxdist');
    if (versionsResult.stdErr !== '') {
        return 'ptxdist';
    }
    const versions = versionsResult.stdOut.split('\n').sort();
    if (!versions.length) {
        return 'ptxdist';
    }
    return versions.pop()!;
}

export async function ptxdistGetSelected(workspaceRootPath: string, selectedLinkName: string): Promise<string[]> {
    if (currentOsPlatform !== OsPlatform.linux || !workspaceRootPath.includes('ptxproj')) {
        return [];
    }
    return findLinks(workspaceRootPath, '*' + selectedLinkName + '*', 1);
}

export async function ptxdistGetSelectedConfig(workspaceRootPath: string) {
    return ptxdistGetSelected(workspaceRootPath, 'selected_ptxconfig');
}

export async function ptxdistGetSelectedPlatform(workspaceRootPath: string) {
    return ptxdistGetSelected(workspaceRootPath, 'selected_platformconfig');
}

export async function ptxdistGetSelectedToolchain(workspaceRootPath: string) {
    return ptxdistGetSelected(workspaceRootPath, 'selected_toolchain');
}

export async function ptxdistGetAvailableConfigs(workspaceRootPath: string, configName: string): Promise<string[]> {
	let searchPath = workspaceRootPath;
    if (getRestrictConfigSearch()) {
        searchPath = buildPtxprojPath(searchPath, 'configs');
    }

    const findResult = await findFiles(searchPath, `*${configName}*`);
    if (getRestrictConfigSearch()) {
        return findResult;
    }

    return findResult.filter(name => name.includes('configs'));
}

export async function ptxdistGetAvailableMenuconfigs(workspaceRootPath: string): Promise<string[]> {
    return ptxdistGetAvailableConfigs(workspaceRootPath, 'ptxconfig');
}

export async function ptxdistGetAvailablePlatformconfigs(workspaceRootPath: string): Promise<string[]> {
    return ptxdistGetAvailableConfigs(workspaceRootPath, 'platformconfig');
}

export async function ptxdistGetAvailableToolchains(): Promise<string[]> {
    return findDirs('/opt/', '*arm-linux-gnueabihf/bin');
}

export async function ptxdistSelect(workspaceRootPath: string, pathToMenuConfig: string): Promise<boolean> {
    if (currentOsPlatform !== OsPlatform.linux) {
        return false;
    }
    let cmd: string = '';
    
    if (workspaceRootPath.includes('ptxproj')) {
        cmd += 'cd ' + workspaceRootPath + ' && ';
    }
    else {
        cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
    }
    cmd += 'ptxdist select ' + pathToMenuConfig;
    
    try {
        await exec(cmd);
        return true;
    } catch (err) {
        return false;
    }
}

export async function ptxdistPlatform(workspaceRootPath: string, pathToPlatformConfig: string): Promise<boolean> {
    if (currentOsPlatform !== OsPlatform.linux) {
        return false;
    }
    let cmd: string = '';
    
    if (workspaceRootPath.includes('ptxproj')) {
        cmd += 'cd ' + workspaceRootPath + ' && ';
    }
    else {
        cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
    }
    cmd += await ptxdistGetNewestBin() + ' platform ' + pathToPlatformConfig;

    try {
        await exec(cmd);
        return true;
    } catch (err) {
        return false;
    }
}

export async function ptxdistToolchain(workspaceRootPath: string, pathToToolchainBin: string): Promise<boolean> {
    if (currentOsPlatform !== OsPlatform.linux) {
        return false;
    }
    let cmd: string = '';
    
    if (workspaceRootPath.includes('ptxproj')) {
        cmd += 'cd ' + workspaceRootPath + ' && ';
    }
    else {
        cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
    }
    cmd += 'ptxdist toolchain ' + pathToToolchainBin;

    try {
        await exec(cmd);
        return true;
    } catch (err) {
        return false;
    }
}

export async function ptxdistOpenMenuconfig(workspaceRootPath: string) {
    if (currentOsPlatform !== OsPlatform.linux) {
        return;
    }

    let cmd: string = '';
    if (workspaceRootPath.includes('ptxproj')) {
        cmd += 'cd ' + workspaceRootPath + ' && ';
    }
    else {
        cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
    }
    cmd += 'ptxdist menuconfig';
    return runInTerminal('PTXdist', cmd, true, true);
}
