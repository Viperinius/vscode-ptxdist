import * as vscode from 'vscode';
import * as path from 'path';
import { platform } from 'os';
import { exec } from './execShell';
import { logToOutput } from './logging';

export const currentOsPlatform: string = platform().toLowerCase();
export enum OsPlatform {
    aix = 'aix',
    android = 'android',
    macOs = 'darwin',
    freeBsd = 'freebsd',
    linux = 'linux',
    openBsd = 'openbsd',
    sunOs = 'sunos',
    windows = 'win32',
    cygwin = 'cygwin',
    netBsd = 'netbsd'
}

/**
 * Execute a find/search on the filesystem
 * @param searchPath path in which the search starts
 * @param searchPattern what to look for, either file name, directory name or a pattern
 * @param type 'd' for directory or 'f' for file, defaults to 'b' for both if not supplied
 * @param depth maximum depth to use, defaults to 'none'
 */
async function find(searchPath: string, searchPattern: string, type?: string, depth?: number): Promise<string[]> {
    let cmd: string = '';
    let results: string[] = [];
    if (searchPath !== '' && searchPattern !== '') {
        if (currentOsPlatform === OsPlatform.windows) {
            cmd = 'where /R "' + searchPath + '" ' + searchPattern;
        }
        else if (currentOsPlatform === OsPlatform.linux) {
            let findType: string = '';
            let maxDepth: string = '';
            if (type && (type === 'f' || type === 'd' || type === 'l')) {
                findType = '-type ' + type;
            }            
            if (depth && depth > 0) {
                maxDepth = '-maxdepth ' + depth;
            }
            cmd = 'find ' + searchPath + ' ' + maxDepth + ' ' + findType + " -wholename '" + searchPattern + "' -exec realpath {} \\;";
        }
    }

    logToOutput(vscode.LogLevel.Debug, cmd);
    if (cmd !== '') {
        const shellResult = await exec(cmd);

        if (shellResult.stdErr !== '') {
            logToOutput(vscode.LogLevel.Error, 'find received errors from shell: \n' + shellResult.stdErr);
            return [];
        }

        results = shellResult.stdOut.trim().split('\n');
    }

    return results;
}

/**
 * Search for files on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either file name or a pattern
 * @param depth maximum search depth
 */
export async function findFiles(searchPath: string, namePattern: string, depth?: number): Promise<string[]> {
    return find(searchPath, namePattern, 'f', depth);
}

/**
 * Search for links on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either link name or a pattern
 * @param depth maximum search depth
 */
export async function findLinks(searchPath: string, namePattern: string, depth?: number): Promise<string[]> {
    return find(searchPath, namePattern, 'l', depth);
}

/**
 * Search for directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either directory name or a pattern
 * @param depth maximum search depth
 */
export async function findDirs(searchPath: string, namePattern: string, depth?: number): Promise<string[]> {
    return find(searchPath, namePattern, 'd', depth);
}

/**
 * Search for files and directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either file name, directory name or a pattern
 */
export async function findDirsFiles(searchPath: string, namePattern: string): Promise<string[]> {
    return find(searchPath, namePattern);
}

export function getPtxprojFromWorkspace(workspaceRoot: string): string {
    return path.join(workspaceRoot, 'ptxproj/');
}

export function buildPtxprojPath(workspaceRoot: string, ...paths: string[]): string {
    return path.join(getPtxprojFromWorkspace(workspaceRoot), ...paths);
}
