import * as assert from 'assert';

import * as vscode from 'vscode';
import { createLogger, logToOutput } from '../../../util/logging';

suite('vscode-ptxdist.suite.util.logging', () => {
    test('createLogger', () => {
        const channel = createLogger();
        assert.strictEqual(channel.name, 'PTXdist');
    });
});
