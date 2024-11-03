import { deferrable, timeoutable, TimeoutId } from '../utils';
import {
    MonitorableConsumer,
    MonitorableData,
    MonitorableOptions,
    MonitorableStatus,
} from './monitorable.interfaces';

type OptionalTimeoutId = TimeoutId | null;

export function Monitorable(
    consumer: MonitorableConsumer,
    options: MonitorableOptions = {},
) {
    return function (
        target: any,
        methodName: string,
        descriptor: PropertyDescriptor,
    ) {
        if (!descriptor.value || !target.constructor) {
            throw Error('Monitorable supports only methods');
        }

        const className = target.constructor.name;
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]): unknown {
            const monitoredData: MonitorableData = {
                className,
                methodName,
                monitorName: options.monitorName ?? `${className}::${methodName}`,
                startedAt: new Date(),
            }

            if (consumer.consumeBefore) {
                deferrable(consumer.consumeBefore, monitoredData);
            }

            const timeoutId: OptionalTimeoutId = !options.timeoutMs
                ? null
                : timeoutable(
                    sendTimeout,
                    options.timeoutMs,
                    consumer,
                    monitoredData,
                );

            let returnedValue: unknown;
            try {
                returnedValue = originalMethod.apply(this, args);
            } catch(error) {
                sendResult(
                    consumer,
                    monitoredData,
                    MonitorableStatus.FAILED,
                    new Date(),
                    timeoutId,
                );

                throw error;
            }

            if (returnedValue instanceof Promise) {
                return returnedValue.then(returnedValueAsync => {
                    sendResult(
                        consumer,
                        monitoredData,
                        MonitorableStatus.FINISHED,
                        new Date(),
                        timeoutId,
                    );

                    return returnedValueAsync;
                }).catch(errorAsync => {
                    sendResult(
                        consumer,
                        monitoredData,
                        MonitorableStatus.FAILED,
                        new Date(),
                        timeoutId,
                    );

                    throw errorAsync;
                });
            } else {
                sendResult(
                    consumer,
                    monitoredData,
                    MonitorableStatus.FINISHED,
                    new Date(),
                    timeoutId,
                );

                return returnedValue;
            }
        }

        return descriptor;
    };
}

const sendResult = (
    consumer: MonitorableConsumer,
    monitorableData: MonitorableData,
    state: MonitorableStatus,
    finishedAt: Date,
    timeoutId: OptionalTimeoutId,
): void => {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    consumer.consume({
        ...monitorableData,
        state,
        finishedAt: finishedAt,
    });
}

const sendTimeout = (
    consumer: MonitorableConsumer,
    monitorableData: MonitorableData,
): void => {
    sendResult(
        consumer,
        monitorableData,
        MonitorableStatus.TIMEOUT,
        new Date(),
        null,
    );
}
