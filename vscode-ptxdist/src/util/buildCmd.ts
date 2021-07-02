/* Heavily inspired by commandLineBuilder from vscode-docker
 * https://github.com/microsoft/vscode-docker/blob/main/src/utils/commandLineBuilder.ts
 */

import * as vscode from 'vscode';

export class BuildCmd {
    private args: vscode.ShellQuotedString[] = [];

    public static build(...args: (string | vscode.ShellQuotedString | undefined)[]): BuildCmd {
        const builder = new BuildCmd();
        if (args !== undefined) {
            for (const arg of args) {
                builder.withArg(arg);
            }
        }
        return builder;
    }

    public withArg(arg: string | vscode.ShellQuotedString | undefined): BuildCmd {
        if (typeof(arg) === 'string') {
            if (arg)
                this.args.push({ value: arg, quoting: vscode.ShellQuoting.Escape });
        }
        else if (arg !== undefined) {
            this.args.push(arg);
        }
        return this;
    }

    public withFlagArg(name: string, active?: boolean): BuildCmd {
        if (active)
            this.withArg(name);
        return this;
    }

    public withArgArray(values?: string[]) {
        if (values !== undefined) {
            for (const value of values) {
                this.withArg(value);
            }
        }
        return this;
    }

    public generate(): string {
        return this.args.map(arg => arg.value).join(' ');
    }
}
