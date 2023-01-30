import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from './execShell';
import { currentOsPlatform, findLinks, OsPlatform } from './fsInteraction';
import { runInTerminal } from './terminalInteraction';

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
    const result = await exec(cmd);

    if (result.stdErr !== '') {
        return false;
    }
    return true;
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
    const result = await exec(cmd);

    if (result.stdErr !== '') {
        return false;
    }
    return true;
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
    const result = await exec(cmd);

    if (result.stdErr !== '') {
        return false;
    }
    return true;
}

export async function ptxdistClean(workspaceRootPath: string, all: boolean, packages?: string[]): Promise<void> {
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
    cmd += 'yes | ptxdist clean ';
    if (!all) {
        if (packages === undefined || packages.length === 0) {
            return;
        }
        cmd += packages.join(' ');
    }
    runInTerminal('PTXdist', cmd, true);
}
