"use strict";
/* Heavily inspired by spawnAsync from vscode-docker
 * https://github.com/microsoft/vscode-docker/blob/main/src/utils/spawnAsync.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buffToStr = exports.exec = exports.execShell = void 0;
const cp = require("child_process");
const BUFFER_SIZE = 10 * 1024;
function execShell(cmd, opts, onStdOut, stdOutBuff, onStdErr, stdErrBuff, token) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            var _a, _b, _c, _d;
            let cancellationListener;
            let stdOutBytesWritten = 0;
            let stdErrBytesWritten = 0;
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
                    const err = new Error(errMsg);
                    err.code = code;
                    err.sig = sig;
                    err.stdErrHandled = onStdErr !== null;
                    return reject(err);
                }
                return resolve();
            });
            if (opts === null || opts === void 0 ? void 0 : opts.stdin) {
                (_a = subproc.stdin) === null || _a === void 0 ? void 0 : _a.write(opts.stdin);
                (_b = subproc.stdin) === null || _b === void 0 ? void 0 : _b.end();
            }
            if (onStdOut || stdOutBuff) {
                (_c = subproc.stdout) === null || _c === void 0 ? void 0 : _c.on('data', (chunk) => {
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
                (_d = subproc.stderr) === null || _d === void 0 ? void 0 : _d.on('data', (chunk) => {
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
    });
}
exports.execShell = execShell;
function exec(cmd, opts, progress) {
    return __awaiter(this, void 0, void 0, function* () {
        const stdOutBuff = Buffer.alloc(opts && opts.maxBuffer || BUFFER_SIZE);
        const stdErrBuff = Buffer.alloc(opts && opts.maxBuffer || BUFFER_SIZE);
        yield execShell(cmd, opts, progress, stdOutBuff, progress, stdErrBuff);
        return {
            stdOut: buffToStr(stdOutBuff),
            stdErr: buffToStr(stdErrBuff)
        };
    });
}
exports.exec = exec;
function buffToStr(buff) {
    return buff.toString().replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]|\r?\n$/g, '');
}
exports.buffToStr = buffToStr;
//# sourceMappingURL=execShell.js.map