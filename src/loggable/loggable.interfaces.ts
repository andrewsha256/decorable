export interface LoggableContent {
    readonly token: string;
    readonly className: string;
    readonly methodName: string;
}

interface Timestamped {
    readonly timestamp: Date,
}

export interface LoggableCall extends LoggableContent, Timestamped {
    readonly args: any[];
}

export interface LoggableResult extends LoggableContent, Timestamped {
    readonly returnedValue: any;
}

export interface LoggableError extends LoggableContent, Timestamped {
    readonly error: any;
}

export type CallLogger = (callData: LoggableCall) => void;

export type ResultLogger = (resultData: LoggableResult) => void;

export type ErrorLogger = (error: LoggableError) => void;

export interface Logger {
    callLogger?: CallLogger,
    resultLogger?: ResultLogger,
    errorLogger?: ErrorLogger,
}
