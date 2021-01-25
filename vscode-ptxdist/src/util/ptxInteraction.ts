import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from './execShell';
import { currentOsPlatform, OsPlatform } from './fsInteraction';

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
    cmd += 'ptxdist platform ' + pathToPlatformConfig;
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


