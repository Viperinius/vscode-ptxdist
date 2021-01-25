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
exports.ptxdistClean = exports.ptxdistToolchain = exports.ptxdistPlatform = exports.ptxdistSelect = void 0;
const execShell_1 = require("./execShell");
const fsInteraction_1 = require("./fsInteraction");
const terminalInteraction_1 = require("./terminalInteraction");
function ptxdistSelect(workspaceRootPath, pathToMenuConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fsInteraction_1.currentOsPlatform !== fsInteraction_1.OsPlatform.linux) {
            return false;
        }
        let cmd = '';
        if (workspaceRootPath.includes('ptxproj')) {
            cmd += 'cd ' + workspaceRootPath + ' && ';
        }
        else {
            cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
        }
        cmd += 'ptxdist select ' + pathToMenuConfig;
        const result = yield execShell_1.exec(cmd);
        if (result.stdErr !== '') {
            return false;
        }
        return true;
    });
}
exports.ptxdistSelect = ptxdistSelect;
function ptxdistPlatform(workspaceRootPath, pathToPlatformConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fsInteraction_1.currentOsPlatform !== fsInteraction_1.OsPlatform.linux) {
            return false;
        }
        let cmd = '';
        if (workspaceRootPath.includes('ptxproj')) {
            cmd += 'cd ' + workspaceRootPath + ' && ';
        }
        else {
            cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
        }
        cmd += 'ptxdist platform ' + pathToPlatformConfig;
        const result = yield execShell_1.exec(cmd);
        if (result.stdErr !== '') {
            return false;
        }
        return true;
    });
}
exports.ptxdistPlatform = ptxdistPlatform;
function ptxdistToolchain(workspaceRootPath, pathToToolchainBin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fsInteraction_1.currentOsPlatform !== fsInteraction_1.OsPlatform.linux) {
            return false;
        }
        let cmd = '';
        if (workspaceRootPath.includes('ptxproj')) {
            cmd += 'cd ' + workspaceRootPath + ' && ';
        }
        else {
            cmd += 'cd ' + workspaceRootPath + '/ptxproj/ && ';
        }
        cmd += 'ptxdist toolchain ' + pathToToolchainBin;
        const result = yield execShell_1.exec(cmd);
        if (result.stdErr !== '') {
            return false;
        }
        return true;
    });
}
exports.ptxdistToolchain = ptxdistToolchain;
function ptxdistClean(workspaceRootPath, all, packages) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fsInteraction_1.currentOsPlatform !== fsInteraction_1.OsPlatform.linux) {
            return;
        }
        let cmd = '';
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
        terminalInteraction_1.runInTerminal('PTXdist', cmd, true);
    });
}
exports.ptxdistClean = ptxdistClean;
//# sourceMappingURL=ptxInteraction.js.map