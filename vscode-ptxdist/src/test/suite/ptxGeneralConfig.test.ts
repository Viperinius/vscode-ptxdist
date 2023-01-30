import * as assert from 'assert';

import * as vscode from 'vscode';
import { PtxGenConfig, PtxGeneralConfigProvider } from '../../ptxGeneralConfig';

suite('vscode-ptxdist.suite.ptxGeneralConfig', () => {
	test('instanceOfClass', () => {
        let p: PtxGeneralConfigProvider = new PtxGeneralConfigProvider();
        assert.notStrictEqual(p, new PtxGeneralConfigProvider());
    });
    /*test('getChildren', async () => {
        let p: PtxGeneralConfigProvider = new PtxGeneralConfigProvider();
        let c: PtxGenConfig[] = await p.getChildren();
          
    });*/
});
