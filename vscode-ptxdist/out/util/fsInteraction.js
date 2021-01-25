"use strict";
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
exports.findDirsFiles = exports.findDirs = exports.findFiles = exports.OsPlatform = exports.currentOsPlatform = void 0;
const os_1 = require("os");
const execShell_1 = require("./execShell");
exports.currentOsPlatform = os_1.platform().toLowerCase();
var OsPlatform;
(function (OsPlatform) {
    OsPlatform["aix"] = "aix";
    OsPlatform["android"] = "android";
    OsPlatform["macOs"] = "darwin";
    OsPlatform["freeBsd"] = "freebsd";
    OsPlatform["linux"] = "linux";
    OsPlatform["openBsd"] = "openbsd";
    OsPlatform["sunOs"] = "sunos";
    OsPlatform["windows"] = "win32";
    OsPlatform["cygwin"] = "cygwin";
    OsPlatform["netBsd"] = "netbsd";
})(OsPlatform = exports.OsPlatform || (exports.OsPlatform = {}));
/**
 * Execute a find/search on the filesystem
 * @param searchPath path in which the search starts
 * @param searchPattern what to look for, either file name, directory name or a pattern
 * @param type 'd' for directory or 'f' for file, defaults to 'b' for both if not supplied
 */
function find(searchPath, searchPattern, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let cmd = '';
        let results = [];
        if (searchPath !== '' && searchPattern !== '') {
            if (exports.currentOsPlatform === OsPlatform.windows) {
                cmd = 'where /R "' + searchPath + '" ' + searchPattern;
            }
            else if (exports.currentOsPlatform === OsPlatform.linux) {
                let findType = '';
                if (type && (type === 'f' || type === 'd')) {
                    findType = '-type ' + type;
                }
                cmd = 'find ' + searchPath + ' ' + findType + " -wholename '" + searchPattern + "' -exec realpath {} \\;";
            }
        }
        console.log(cmd);
        if (cmd !== '') {
            const shellResult = yield execShell_1.exec(cmd);
            //console.log(shellResult.stdOut.trim());
            if (shellResult.stdErr !== '') {
                console.error('find received errors from shell: \n' + shellResult.stdErr);
                return [];
            }
            results = shellResult.stdOut.trim().split('\n');
        }
        return results;
    });
}
/**
 * Search for files on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either file name or a pattern
 */
function findFiles(searchPath, namePattern) {
    return __awaiter(this, void 0, void 0, function* () {
        return find(searchPath, namePattern, 'f');
    });
}
exports.findFiles = findFiles;
/**
 * Search for directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either directory name or a pattern
 */
function findDirs(searchPath, namePattern) {
    return __awaiter(this, void 0, void 0, function* () {
        return find(searchPath, namePattern, 'd');
    });
}
exports.findDirs = findDirs;
/**
 * Search for files and directories on the filesystem
 * @param searchPath path in which the search starts
 * @param namePattern what to look for, either file name, directory name or a pattern
 */
function findDirsFiles(searchPath, namePattern) {
    return __awaiter(this, void 0, void 0, function* () {
        return find(searchPath, namePattern);
    });
}
exports.findDirsFiles = findDirsFiles;
//# sourceMappingURL=fsInteraction.js.map