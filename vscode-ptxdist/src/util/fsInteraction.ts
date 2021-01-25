import * as vscode from 'vscode';
import * as path from 'path';
import { platform } from 'os';
import { exec } from './execShell';

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
 */
async function find(searchPath: string, searchPattern: string, type?: string): Promise<string[]> {
    let cmd: string = '';
    let results: string[] = [];
    if (searchPath !== '' && searchPattern !== '') {
        if (currentOsPlatform === OsPlatform.windows) {
            cmd = 'where /R "' + searchPath + '" ' + searchPattern;
        }
        else if (currentOsPlatform === OsPlatform.linux) {
            let findType: string = '';
            if (type && (type === 'f' || type === 'd')) {
                findType = '-type ' + type;
            }
            cmd = 'find ' + searchPath + ' ' + findType + " -wholename '" + searchPattern + "' -exec realpath {} \\;";
        }
    }
    console.log(cmd);
    if (cmd !== '') {
        const shellResult = await exec(cmd);
        //console.log(shellResult.stdOut.trim());

        if (shellResult.stdErr !== '') {
            console.error('find received errors from shell: \n' + shellResult.stdErr);
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
 */
export async function findFiles(searchPath: string, namePattern: string): Promise<string[]> {
    return find(searchPath, namePattern, 'f');
}

/**
 * Search for directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either directory name or a pattern
 */
export async function findDirs(searchPath: string, namePattern: string): Promise<string[]> {
    return find(searchPath, namePattern, 'd');
}

/**
 * Search for files and directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either file name, directory name or a pattern
 */
export async function findDirsFiles(searchPath: string, namePattern: string): Promise<string[]> {
    return find(searchPath, namePattern);
}
