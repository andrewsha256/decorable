export interface MonitorableConsumer {
    consume: (monitoredResult: MonitorableResult) => void;
    consumeBefore?: (monitoredData: MonitorableData) => void;
}

export interface MonitorableOptions {
    readonly monitorName?: string;
    readonly timeoutMs?: number;
}

export enum MonitorableStatus {
    FAILED,
    FINISHED,
    TIMEOUT,
}

export interface MonitorableData {
    readonly className: string;
    readonly methodName: string;
    readonly monitorName: string;
    readonly startedAt: Date;
}

export interface MonitorableResult extends MonitorableData {
    readonly finishedAt: Date;
    readonly state: MonitorableStatus;
}
