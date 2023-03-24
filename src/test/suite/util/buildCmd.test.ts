import * as assert from 'assert';

import * as vscode from 'vscode';
import { BuildCmd } from '../../../util/buildCmd';

suite('vscode-ptxdist.suite.util.buildCmd', () => {
    test('instanceOfClass', () => {
        let b: BuildCmd = BuildCmd.build();
        assert.deepStrictEqual(b, new BuildCmd());
    });
    test('buildBasic', () => {
        let b: BuildCmd = BuildCmd.build('test', 'test2', 'test3');
        assert.strictEqual(b.generate(), 'test test2 test3');
    });
    test('buildWithArg', () => {
        let b: BuildCmd = BuildCmd.build('test').withArg('--flag');
        assert.strictEqual(b.generate(), 'test --flag');

        let b2: BuildCmd = BuildCmd.build('test').withArg(undefined);
        assert.strictEqual(b2.generate(), 'test');
    });
    test('buildWithFlagArg', () => {
        let b: BuildCmd = BuildCmd.build('test').withFlagArg('--flag', true);
        assert.strictEqual(b.generate(), 'test --flag');

        let b2: BuildCmd = BuildCmd.build('test').withFlagArg('--flag');
        assert.strictEqual(b2.generate(), 'test');
    });
    test('buildWithArgArray', () => {
        let b: BuildCmd = BuildCmd.build('test').withArgArray(['--flag', '-f', 'x']);
        assert.strictEqual(b.generate(), 'test --flag -f x');

        let b2: BuildCmd = BuildCmd.build('test').withArgArray();
        assert.strictEqual(b2.generate(), 'test');
    });
});
