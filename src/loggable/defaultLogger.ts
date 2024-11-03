import {
    CallLogger,
    ErrorLogger,
    Logger,
    LoggableCall,
    LoggableError,
    LoggableResult,
    ResultLogger,
} from './loggable.interfaces';
import { stringify } from '../utils';

const formatDate = (date: Date): string => date.toISOString();

export const defaultCallLogger: CallLogger = (callData: LoggableCall): void => {
    const timestamp = formatDate(callData.timestamp);
    const argsAsString = stringify(callData.args);
    console.info(`${timestamp} [${callData.token}::call] ${callData.className}::${callData.methodName} with args ${argsAsString}`);
}

export const defaultResultLogger: ResultLogger = (resultData: LoggableResult): void => {
    const timestamp = formatDate(resultData.timestamp);
    const resultAsString = stringify(resultData.returnedValue);
    console.info(`${timestamp} [${resultData.token}::success] ${resultData.className}::${resultData.methodName} returned ${resultAsString}`);
}

export const defaultErrorLogger: ErrorLogger = (error: LoggableError): void => {
    const timestamp = formatDate(error.timestamp);
    const errorAsString = stringify(error.error);
    console.error(`${timestamp} [${error.token}::error] ${error.className}::${error.methodName} thrown ${errorAsString}`);
}

export const defaultLogger: Logger = {
    callLogger: defaultCallLogger,
    resultLogger: defaultResultLogger,
    errorLogger: defaultErrorLogger,
};
