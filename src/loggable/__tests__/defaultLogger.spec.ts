import {
    defaultLogger,
    defaultCallLogger,
    defaultErrorLogger,
    defaultResultLogger,
} from '../defaultLogger';
import { stringify } from '../../utils';

jest.mock('utils/stringify');

const originalConsoleInfo = console.info;
const originalConsoleError = console.error;

describe('defaultLogger', () => {
    beforeAll(() => {
        console.info = jest.fn();
        console.error = jest.fn();
    });

    afterAll(() => {
        console.info = originalConsoleInfo;
        console.error = originalConsoleError;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be initialized', () => {
        expect(defaultLogger).toStrictEqual({
            callLogger: defaultCallLogger,
            resultLogger: defaultResultLogger,
            errorLogger: defaultErrorLogger,
        });
    });

    describe('defaultCallLogger', () => {
        it('should generate string and send it to console.info', () => {
            const args: any[] = [ 1, 0, 'test', { property: 'property' }];
            const expectedArgs = JSON.stringify(args);

            const stringifyMock = jest.mocked(stringify);
            stringifyMock.mockReturnValueOnce(expectedArgs);

            defaultCallLogger({
                timestamp: new Date(Date.parse('2001-01-19T11:09:48.830Z')),
                token: '__token__',
                className: 'MyClass',
                methodName: 'someMethod',
                args,
            });

            expect(console.info).toHaveBeenCalledTimes(1);
            expect(console.info).toHaveBeenCalledWith(
                `2001-01-19T11:09:48.830Z [__token__::call] MyClass::someMethod with args ${expectedArgs}`,
            );
        });
    });

    describe('defaultResultLogger', () => {
        it('should generate string and send it to console.info', () => {
            const returnedValue: any[] = [ 1, 0, 'test', { property: 'property' }];
            const expectedReturnedValue = JSON.stringify(returnedValue);

            const stringifyMock = jest.mocked(stringify);
            stringifyMock.mockReturnValueOnce(expectedReturnedValue);

            defaultResultLogger({
                timestamp: new Date(Date.parse('2001-01-19T11:09:48.830Z')),
                token: '__token__',
                className: 'MyClass',
                methodName: 'someMethod',
                returnedValue: returnedValue,
            });

            expect(console.info).toHaveBeenCalledTimes(1);
            expect(console.info).toHaveBeenCalledWith(
                `2001-01-19T11:09:48.830Z [__token__::success] MyClass::someMethod returned ${expectedReturnedValue}`,
            );
        });
    });

    describe('defaultErrorLogger', () => {
        it('should generate string and send it to console.error', () => {
            const error = new Error('error message');
            const errorAsString = '' + error;

            const stringifyMock = jest.mocked(stringify);
            stringifyMock.mockReturnValueOnce(errorAsString);

            defaultErrorLogger({
                timestamp: new Date(Date.parse('2001-01-19T11:09:48.830Z')),
                token: '__token__',
                className: 'MyClass',
                methodName: 'someMethod',
                error: error,
            });

            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith(
                `2001-01-19T11:09:48.830Z [__token__::error] MyClass::someMethod thrown ${errorAsString}`,
            );
        });
    });
});
