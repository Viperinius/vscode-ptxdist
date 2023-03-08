import * as assert from 'assert';
import { closeSync, mkdirSync, mkdtempSync, openSync, symlinkSync } from 'fs';
import { before } from 'mocha';
import * as os from 'os';
import * as path from 'path';

import * as vscode from 'vscode';
import { buildPtxprojPath, findDirs, findDirsFiles, findFiles, findLinks, getPtxprojFromWorkspace } from '../../../util/fsInteraction';

suite('vscode-ptxdist.suite.util.fsInteraction', () => {
    let tmpDir: string = '.';

    const dir1 = 'mydir';
    const dir2 = 'thisisadirectory123';
    const dir1SubDir = 'onemoredir';

    const dir2Symlink = 'mylink';
    const rootFile = 'topfile';
    const dir1File = 'somefile';
    const dir2File = 'another file';

    before(() => {
        tmpDir = mkdtempSync(path.join(os.tmpdir(), 'fstests'));

        mkdirSync(path.join(tmpDir, dir1));
        mkdirSync(path.join(tmpDir, dir1, dir1SubDir));
        mkdirSync(path.join(tmpDir, dir2));
        symlinkSync(path.join(tmpDir, dir1), path.join(tmpDir, dir2, dir2Symlink), 'dir');

        closeSync(openSync(path.join(tmpDir, rootFile), 'a'));
        closeSync(openSync(path.join(tmpDir, dir1, dir1File), 'a'));
        closeSync(openSync(path.join(tmpDir, dir2, dir2File), 'a'));
    });

    test('findDirs', async () => {
        const findResult = await findDirs(tmpDir, '*');
        // expected: three dirs in tree below and tmpDir itself
        assert.strictEqual(findResult.length, 4);
        assert.deepStrictEqual(findResult, [
            tmpDir,
            path.join(tmpDir, dir1),
            path.join(tmpDir, dir1, dir1SubDir),
            path.join(tmpDir, dir2)
        ]);
    });

    test('findDirsPattern', async () => {
        const findResult = await findDirs(tmpDir, `*${dir2}*`, 1);
        // expected: one dir
        assert.strictEqual(findResult.length, 1);
        assert.deepStrictEqual(findResult, [
            path.join(tmpDir, dir2)
        ]);
    });

    test('findDirsDepth', async () => {
        const findResult = await findDirs(tmpDir, '*', 1);
        // expected: two dirs below and tmpDir itself
        assert.strictEqual(findResult.length, 3);
        assert.deepStrictEqual(findResult, [
            tmpDir,
            path.join(tmpDir, dir1),
            path.join(tmpDir, dir2)
        ]);
    });

    test('findLinks', async () => {
        const findResult = await findLinks(tmpDir, '*');
        // expected: one resolved / followed link
        assert.strictEqual(findResult.length, 1);
        assert.deepStrictEqual(findResult, [
            path.join(tmpDir, dir1)
        ]);
    });

    test('findFiles', async () => {
        const findResult = await findFiles(tmpDir, '*');
        // expected: three files
        assert.strictEqual(findResult.length, 3);
        assert.deepStrictEqual(findResult, [
            path.join(tmpDir, dir1, dir1File),
            path.join(tmpDir, dir2, dir2File),
            path.join(tmpDir, rootFile)
        ]);
    });

    test('findDirsFiles', async () => {
        const findResult = await findDirsFiles(tmpDir, '*');
        // expected: tmpDir itself, three dirs + one from symlink, three files
        assert.strictEqual(findResult.length, 8);
        assert.deepStrictEqual(findResult, [
            tmpDir,
            path.join(tmpDir, dir1),
            path.join(tmpDir, dir1, dir1File),
            path.join(tmpDir, dir1, dir1SubDir),
            path.join(tmpDir, dir2),
            path.join(tmpDir, dir2, dir2File),
            path.join(tmpDir, dir1),
            path.join(tmpDir, rootFile)
        ]);
    });

    test('getPtxprojFromWorkspace', () => {
        const ws = '/my/awesome/path';
        assert.strictEqual(
            getPtxprojFromWorkspace(ws),
            ws + '/ptxproj');

        assert.strictEqual(
            getPtxprojFromWorkspace(ws + '/'),
            ws + '/ptxproj');
    });

    test('buildPtxprojPath', () => {
        const ws = '/just/another/one';
        assert.strictEqual(
            buildPtxprojPath(ws + '/'),
            ws + '/ptxproj');

        assert.strictEqual(
            buildPtxprojPath(ws, 'hello', 'world'),
            ws + '/ptxproj/hello/world');
    });
});