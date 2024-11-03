import { defaultLogger } from './defaultLogger';
import { LoggableContent, Logger } from './loggable.interfaces';
import { generateRandomToken } from '../utils/tokenGenerator';

export function Loggable(logger: Logger = defaultLogger) {
    return function (
        target: any,
        methodName: string,
        descriptor: PropertyDescriptor,
    ) {
        if (!descriptor.value || !target.constructor) {
            throw Error('Loggable supports only methods');
        }

        const className = target.constructor.name;
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: unknown[]): unknown {
            const loggableContent: LoggableContent = {
                token: generateRandomToken(),
                className,
                methodName,
            };

            logCall(logger, args, loggableContent);

            let returnedValue: unknown;
            try {
                returnedValue = originalMethod.apply(this, args);
            } catch(error) {
                logError(logger, error, loggableContent);
                throw error;
            }

            if (returnedValue instanceof Promise) {
                return returnedValue.then(returnedValueAsync => {
                    logResult(logger, returnedValueAsync, loggableContent);
                    return returnedValueAsync;
                }).catch(errorAsync => {
                    logError(logger, errorAsync, loggableContent);
                    throw errorAsync;
                });
            } else {
                logResult(logger, returnedValue, loggableContent);
                return returnedValue;
            }
        }

        return descriptor;
    };
}

const logCall = (logger: Logger, args: unknown[], content: LoggableContent): void => {
    if (!logger.callLogger) {
        return;
    }

    logger.callLogger({
        ...content,
        timestamp: new Date(),
        args,
    });
}

const logResult = (logger: Logger, returnedValue: unknown, content: LoggableContent): void => {
    if(!logger.resultLogger) {
        return;
    }

    logger.resultLogger({
        ...content,
        timestamp: new Date(),
        returnedValue,
    });
}

const logError = (logger: Logger, error: unknown, content: LoggableContent): void => {
    if (!logger.errorLogger) {
        return;
    }

    logger.errorLogger({
        ...content,
        timestamp: new Date(),
        error,
    });
}
