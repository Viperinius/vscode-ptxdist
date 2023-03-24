import { LogLevel, LogOutputChannel, window } from "vscode";

let outputChannel: LogOutputChannel;

export function createLogger(): LogOutputChannel {
    outputChannel = window.createOutputChannel("PTXdist", { log: true });
    return outputChannel;
}

export function logToOutput(level: LogLevel, text: string, reveal: boolean = false): void {
    if (!outputChannel) {
        createLogger();
    }

    switch (level) {
        case LogLevel.Trace:
            outputChannel.trace(text);
            break;
        case LogLevel.Debug:
            outputChannel.debug(text);
            break;
        case LogLevel.Info:
            outputChannel.info(text);
            break;
        case LogLevel.Warning:
            outputChannel.warn(text);
            break;
        case LogLevel.Error:
            outputChannel.error(text);
            break;
        default:
            break;
    }

    if (reveal) {
        outputChannel.show(true);
    }
}
