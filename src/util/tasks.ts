import * as vscode from 'vscode';
import { BuildCmd } from './buildCmd';
import { BUFFER_SIZE, ExecError, execShell } from './execShell';

export interface PtxTask extends vscode.TaskDefinition {
    name: string;

    id: string;

    commandType: string;

    flags?: string[];

    packages?: string[];
}

export class PtxTaskFilter implements vscode.TaskFilter {
    type?: string = 'PTXdist';
}

export class PtxDefaultTaskFilter implements vscode.TaskFilter {
    type?: string = 'PTXdist All';
}

export function getProviderIdentifier(commandType: string, packageNames: string[], flagsName?: string): string {
    const prefix: string = 'ptxtask_';
    let result = prefix + commandType;
    if (packageNames.length > 0) {
        result += '_' + packageNames.join('_');
    }
    if (flagsName) {
        result += '_' + flagsName;
    }
    return result;
}

export const ptxFlags: Map<string, string[]> = new Map<string, string[]>([
    ["(quiet)", ['-q']],
    ["(quiet parallel)", ['-j', '-q']],
    ["(parallel)", ['-j']],
    ["(debug)", ['-d']],
    ["(verbose)", ['-v']],
    ["(none)", []]
]);

export class PtxTaskProvider implements vscode.TaskProvider {
    public static ptxTaskType = 'PTXdist';
    protected tasks: vscode.Task[] | undefined;
    protected sharedState: string | undefined;

    protected commandTypes: string[] = ['go', 'get', 'urlcheck', 'extract', 'prepare', 'compile', 'install', 'targetinstall', 'drop', /*'image',*/ 'clean'];
    protected strippedCommandTypes: string[] = ['clean', 'distclean'];
    
    constructor(protected workspaceRoot: string, protected packages?: string[], protected commandFilter?: string[], protected flagFilter?: string[]) {
        
    }

    public static getTaskName(commandType: string, flags?: string[], packages?: string[]) {
        return `${commandType} ${flags?.join(' ')} ${packages?.join(', ')}`.trim().replace('  ', ' ');
    }

    public async provideTasks(): Promise<vscode.Task[]> {
        return this.getTasks();
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
        const commandType: string = _task.definition.commandType;
        if (commandType) {
            const definition: PtxTask = <any>_task.definition;
            return this.getTask(PtxTaskProvider.getTaskName(definition.commandType, definition.flags), definition.id, definition.commandType, definition.flags ? definition.flags : [], definition.packages ? definition.packages : [], definition);
        }
        return undefined;
    }

    protected getTasks(): vscode.Task[] {
        if (this.tasks !== undefined) {
            return this.tasks;
        }

        this.tasks = [];
        this.commandTypes.forEach(command => {
            if (this.commandFilter && !this.commandFilter.includes(command)) {
                return;
            }
            if (this.strippedCommandTypes.includes(command)) {
                if (this.packages) {
                    this.tasks!.push(this.getTask(PtxTaskProvider.getTaskName(command, undefined, this.packages), getProviderIdentifier(command, this.packages), command, [], this.packages));
                }
                else {
                    this.tasks!.push(this.getTask(PtxTaskProvider.getTaskName(command), getProviderIdentifier(command, []), command, [], []));
                }
                return;
            }
            ptxFlags.forEach((flag, flagName) => {
                if (this.flagFilter && !this.flagFilter.includes(flagName)) {
                    return;
                }
                if (this.packages) {
                    this.tasks!.push(this.getTask(PtxTaskProvider.getTaskName(command, [flagName], this.packages), getProviderIdentifier(command, this.packages, flagName), command, flag, this.packages));
                }
                else {
                    this.tasks!.push(this.getTask(PtxTaskProvider.getTaskName(command, [flagName]), getProviderIdentifier(command, [], flagName), command, flag, []));
                }
            });
        });
        return this.tasks;
    }

    protected getTask(name: string, id: string, commandType: string, flags: string[], packages: string[], definition?: PtxTask): vscode.Task {
        if (definition === undefined) {
            definition = {
                type: PtxTaskProvider.ptxTaskType,
                name,
                id,
                commandType,
                flags,
                packages
            };
        }
        return new vscode.Task(definition, vscode.TaskScope.Workspace, name, PtxTaskProvider.ptxTaskType, new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
            return new PtxTaskTerminal(this.workspaceRoot, commandType, flags, packages);
        }));
    }

}

export class PtxDefaultTaskProvider extends PtxTaskProvider {
    public static ptxTaskType = 'PTXdist All';

    constructor(_workspaceRoot: string, _commandFilter?: string[], _flagFilter?: string[]) {
        super(_workspaceRoot, undefined, _commandFilter, _flagFilter);
    }

    protected commandTypes: string[] = ['go', 'get', 'urlcheck', 'images', 'clean', 'distclean'];

    protected getTask(name: string, id: string, commandType: string, flags: string[], packages: string[], definition?: PtxTask): vscode.Task {
        if (definition === undefined) {
            definition = {
                type: PtxDefaultTaskProvider.ptxTaskType,
                name,
                id,
                commandType,
                flags,
                packages: undefined
            };
        }
        return new vscode.Task(definition, vscode.TaskScope.Workspace, name, PtxDefaultTaskProvider.ptxTaskType, new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
            return new PtxTaskTerminal(this.workspaceRoot, commandType, flags, undefined);
        }));
    }
}

class PtxTaskTerminal implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose: vscode.Event<number> = this.closeEmitter.event;

    private ptxprojDirectory: string;

    constructor(private workspaceRoot: string, private commandType: string, private flags: string[], private packages?: string[]) {
        if (workspaceRoot.endsWith('ptxproj/') || workspaceRoot.endsWith('ptxproj')) {
            this.ptxprojDirectory = workspaceRoot;
        }
        else {
            if (workspaceRoot.endsWith('/')) {
                this.ptxprojDirectory = workspaceRoot + 'ptxproj';
            }
            else {
                this.ptxprojDirectory = workspaceRoot + '/ptxproj';
            }
        }
    }

    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        this.writeEmitter.fire(`Calling PTXdist from directory ${this.ptxprojDirectory} ...\r\n`);
        this.exec().then(result => this.close(result));
    }

    close(error?: number): void {
        this.closeEmitter.fire(error || 0);
    }

    handleInput(data: string): void {
        // cancel terminal on ctrl+c
        if (data.includes('\u0003')) {
            this.close();
        }
    }

    private async exec(): Promise<number> {
        let commandBuilder = BuildCmd.build('ptxdist', this.commandType).withArg('-n19').withArgArray(this.flags).withArgArray(this.packages);
        const fullCommand: string = commandBuilder.generate();
        const fullCommandCleanAllHandling: string = (this.commandType === 'clean' ? 'yes | ' : '') + fullCommand;

        this.writeEmitter.fire(`Command: ${fullCommand}\r\n\r\n`);

        let hadStdErr = false;
        let returnCode = 0;
        await execShell(
            fullCommandCleanAllHandling, 
            { cwd: this.ptxprojDirectory }, 
            (stdOut: string) => {
                this.writeEmitter.fire(this.formatWrite(stdOut));
            }, 
            Buffer.alloc(BUFFER_SIZE), 
            (stdErr) => {
                hadStdErr = true;
                this.writeEmitter.fire(`\x1b[33m${this.formatWrite(stdErr)}\x1b[0m`);
            }, 
            Buffer.alloc(BUFFER_SIZE)).catch((error) => {
                hadStdErr = true;
                try {
                    returnCode = (error as ExecError).code;
                } catch (e) {}
                this.writeEmitter.fire(`\x1b[31m${this.formatWrite((error as Error).message)}\x1b[0m`);
            });

        if (hadStdErr && returnCode === 0) {
            return -1;
        }
        return returnCode;
    }

    private formatWrite(raw: string): string {
        return raw.replace(/\r?\n/g, '\r\n');
    }
}
