/* Heavily inspired by spawnAsync from vscode-docker
 * https://github.com/microsoft/vscode-docker/blob/main/src/utils/spawnAsync.ts
 */

import * as cp from 'child_process';
import { CancellationToken, Disposable } from 'vscode';

const BUFFER_SIZE = 10 * 1024;

export type Progress = (content: string, proc: cp.ChildProcess) => void;
export type ExecError = Error & { code: any, sig: any, stdErrHandled: boolean };

export async function execShell(
    cmd: string,
    opts?: cp.SpawnOptions & { stdin?: string },
    onStdOut?: Progress,
    stdOutBuff?: Buffer,
    onStdErr?: Progress,
    stdErrBuff?: Buffer,
    token?: CancellationToken): Promise<void> {

    return new Promise((resolve, reject) => {
        let cancellationListener: Disposable;
        let stdOutBytesWritten: number = 0;
        let stdErrBytesWritten: number = 0;

        opts = opts || {};
        opts.shell = true;

        const subproc = cp.spawn(cmd, opts);
        subproc.on('error', (err) => {
            if (cancellationListener) {
                cancellationListener.dispose();
                //cancellationListener = undefined;
            }
            return reject(err);
        });
        subproc.on('close', (code, sig) => {
            if (cancellationListener) {
                cancellationListener.dispose();
                //cancellationListener = undefined;
            }
            if (token && token.isCancellationRequested) {
                return reject(new Error("CancellationWasRequested"));
            }
            else if (code) {
                let errMsg = `Process '${cmd.substring(0, 50)}' exited with code ${code}`;
                if (stdErrBuff) {
                    errMsg += `\nError: ${buffToStr(stdErrBuff)}`;
                }
                const err = <ExecError>new Error(errMsg);
                err.code = code;
                err.sig = sig;
                err.stdErrHandled = onStdErr !== null;
                return reject(err);
            }
            return resolve();
        });

        if (opts?.stdin) {
            subproc.stdin?.write(opts.stdin);
            subproc.stdin?.end();
        }
        if (onStdOut || stdOutBuff) {
            subproc.stdout?.on('data', (chunk: Buffer) => {
                const data = chunk.toString();
                if (onStdOut) {
                    onStdOut(data, subproc);
                }
                if (stdOutBuff) {
                    stdOutBytesWritten += stdOutBuff.write(data, stdOutBytesWritten);
                }
            });
        }
        if (onStdErr || stdErrBuff) {
            subproc.stderr?.on('data', (chunk: Buffer) => {
                const data = chunk.toString();
                if (onStdErr) {
                    onStdErr(data, subproc);
                }
                if (stdErrBuff) {
                    stdErrBytesWritten += stdErrBuff.write(data, stdErrBytesWritten);
                }
            });
        }
        if (token) {
            cancellationListener = token.onCancellationRequested(() => {
                subproc.kill();
            });
        }
    });
}

export async function exec(
    cmd: string,
    opts?: cp.ExecOptions & { stdin?: string },
    progress?: Progress): Promise<{ stdOut: string, stdErr: string }> {

    const stdOutBuff = Buffer.alloc(opts && opts.maxBuffer || BUFFER_SIZE);
    const stdErrBuff = Buffer.alloc(opts && opts.maxBuffer || BUFFER_SIZE);

    await execShell(cmd, opts as cp.CommonOptions, progress, stdOutBuff, progress, stdErrBuff);
    return {
        stdOut: buffToStr(stdOutBuff),
        stdErr: buffToStr(stdErrBuff)
    };
}

export function buffToStr(buff: Buffer): string {
    return buff.toString().replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]|\r?\n$/g, '');
}
