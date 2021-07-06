import * as assert from 'assert';

import * as vscode from 'vscode';
import { PtxCommand, PtxCommandsProvider } from '../../ptxCommands';

suite('vscode-ptxdist.suite.ptxCommands', () => {
	test('instanceOfClass', () => {
        let p: PtxCommandsProvider = new PtxCommandsProvider();
        assert.notStrictEqual(p, new PtxCommandsProvider());
    });
    test('getChildren', async () => {
        let p: PtxCommandsProvider = new PtxCommandsProvider();
        let c: PtxCommand[] = await p.getChildren();
        
        assert.strictEqual(c.length, 10);
        assert.strictEqual(c[0].label, 'Clean');
        assert.strictEqual(c[1].label, 'Go');
        assert.strictEqual(c[2].label, 'Targetinstall');
        assert.strictEqual(c[3].label, 'Install');
        assert.strictEqual(c[4].label, 'Compile');
        assert.strictEqual(c[5].label, 'Prepare');
        assert.strictEqual(c[6].label, 'Extract');
        assert.strictEqual(c[7].label, 'URLcheck');
        assert.strictEqual(c[8].label, 'Get');
        assert.strictEqual(c[9].label, 'Images');

        let clean: PtxCommand | undefined = c.find(elem => elem.getCmdId() == 'clean');
        assert.strictEqual(clean !== undefined, true);

        let cc: PtxCommand[] = await p.getChildren(clean);

        assert.strictEqual(cc.length, 3);
        assert.strictEqual(cc[0].label, 'All');
        assert.strictEqual(cc[1].label, 'Specified package(s)');
        assert.strictEqual(cc[2].label, 'Distclean');        
    });
    test('getTreeItem', () => {
        let p: PtxCommandsProvider = new PtxCommandsProvider();
        let c: PtxCommand = new PtxCommand('testlabel', '', 'testId', vscode.TreeItemCollapsibleState.None, '');
        assert.strictEqual(p.getTreeItem(c), c);
    });
});