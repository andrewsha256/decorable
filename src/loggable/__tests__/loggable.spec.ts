import { defaultLogger } from '../defaultLogger';
import { generateRandomToken } from '../../utils';
import { Logger } from '../loggable.interfaces';
import { Loggable } from '../loggable';

jest.mock('../defaultLogger');
jest.mock('utils/tokenGenerator');

describe('Loggable', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it('should throw an error if used not as a method decorator', () => {
        const loggable = Loggable();
        expect(() => loggable('test', 'test', {})).toThrow();
    });

    it('should use default logger if custom not present', () => {
        class TestClass {
            @Loggable()
            test() {
                return 'test';
            }
        };

        const actual = new TestClass().test();

        expect(actual).toBe('test');
        expect(defaultLogger.callLogger).toHaveBeenCalledTimes(1);
        expect(defaultLogger.resultLogger).toHaveBeenCalledTimes(1);
    });

    describe('sync method', () => {
        it('should not log call event if it is not present in custom logger', () => {
            const logger: Logger = { resultLogger: jest.fn() };

            class TestClass {
                @Loggable(logger)
                test() {
                    return 'test';
                }
            };

            const actual = new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
        });

        it('should not log return result event if it is not present in custom logger', () => {
            const logger: Logger = { callLogger: jest.fn() };

            class TestClass {
                @Loggable(logger)
                test() {
                    return 'test';
                }
            };

            const actual = new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.callLogger).toHaveBeenCalledTimes(1);
        });

        it('should not log error event if it is not present in custom logger', () => {
            const logger: Logger = { callLogger: jest.fn() };
            const error = new Error('test error');

            class TestClass {
                @Loggable(logger)
                test() {
                    throw error;
                }
            };

            const testClass = new TestClass();

            expect(() => testClass.test()).toThrow(error);

            expect(defaultLogger.errorLogger).not.toHaveBeenCalled();
            expect(logger.callLogger).toHaveBeenCalledTimes(1);
        });

        it('should log call event and returned result', () => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            class TestClass {
                @Loggable(logger)
                test() {
                    return 'test';
                }
            };

            const actual = new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
            expect(logger.errorLogger).not.toHaveBeenCalled();
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
        });

        it.each<any>([
            'error',
            new Error('test'),
        ])('should log and rethrow error correctly', (toThrow: any) => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            const token = 'test token';
            const generateRandomTokenMock = generateRandomToken as jest.Mock;
            generateRandomTokenMock.mockReturnValueOnce(token);

            class TestClass {
                @Loggable(logger)
                test() {
                    throw toThrow;
                }
            };

            const testClass = new TestClass();

            expect(() => testClass.test()).toThrow(toThrow);

            expect(logger.callLogger).toHaveBeenCalledTimes(1);
            expect(logger.callLogger).toHaveBeenCalledWith(expect.objectContaining({
                timestamp: expect.any(Date),
                token: token,
                className: 'TestClass',
                methodName: 'test',
                args: [],
            }));

            expect(logger.resultLogger).not.toHaveBeenCalled();

            expect(logger.errorLogger).toHaveBeenCalledTimes(1);
            expect(logger.errorLogger).toHaveBeenCalledWith(expect.objectContaining({
                timestamp: expect.any(Date),
                token: token,
                className: 'TestClass',
                methodName: 'test',
                error: toThrow,
            }));
        });

        it.each<any>([
            null,
            undefined,
            [],
            {},
            '',
            0,
            -0,
            Number.MAX_SAFE_INTEGER,
            Number.EPSILON,
            'string',
            [1, 2, 'test'],
            { property1: 'property1', date: new Date() },
            new RegExp(/test/),
            new Error('error'),
        ])('should return result from original method', (returnedResult: any) => {
            class TestClass {
                @Loggable()
                test() {
                    return returnedResult;
                }
            }

            const result = new TestClass().test();

            expect(result).toStrictEqual(returnedResult);
        });

        it.each<any[]>([
            [],
            [ null ],
            [ 1, 'string', { property1: 'property1', property2: 'property2' } ],
            [ new Date(), new RegExp(/test/) ],
            [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
        ])('should pass arguments to original correctly', (...args: any[]) => {
            class TestClass {
                @Loggable()
                test(...testArguments: any[]) {
                    expect(testArguments).toStrictEqual(args);
                }
            };

            const testClass = new TestClass();

            testClass.test(...args);
        });

        it('should generate pseudo unique token per call', () => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            const tokens = [ 'token1', 'token2', 'token3', 'token 4' ];
            const generateRandomTokenMock = generateRandomToken as jest.Mock;
            tokens.forEach(generateRandomTokenMock.mockReturnValueOnce);

            class TestClass {
                @Loggable(logger)
                testValue() {
                    return 'test';
                }

                @Loggable(logger)
                throwError() {
                    throw new Error('error');
                }
            }

            const test = new TestClass();

            test.testValue();
            expect(() => test.throwError()).toThrow();
            test.testValue();
            expect(() => test.throwError()).toThrow();

            expect(logger.callLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[0],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[1],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(3, expect.objectContaining({
                token: tokens[2],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(4, expect.objectContaining({
                token: tokens[3],
            }));


            expect(logger.resultLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[0],
            }));
            expect(logger.resultLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[2],
            }));

            expect(logger.errorLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[1],
            }));
            expect(logger.errorLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[3],
            }));
        });
    });

    describe('async method', () => {
        it('should not log call event if it is not present in custom logger', async () => {
            const logger: Logger = { resultLogger: jest.fn() };

            class TestClass {
                @Loggable(logger)
                async test() {
                    return Promise.resolve('test');
                }
            };

            const actual = await new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
        });

        it('should not log return result event if it is not present in custom logger', async () => {
            const logger: Logger = { callLogger: jest.fn() };

            class TestClass {
                @Loggable(logger)
                async test() {
                    return Promise.resolve('test');
                }
            };

            const actual = await new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.callLogger).toHaveBeenCalledTimes(1);
        });

        it('should not log error event if it is not present in custom logger', async () => {
            const logger: Logger = { callLogger: jest.fn() };
            const error = new Error('test error');

            class TestClass {
                @Loggable(logger)
                async test() {
                    return Promise.reject(error);
                }
            };

            const testClass = new TestClass();

            await expect(testClass.test()).rejects.toBe(error);

            expect(defaultLogger.errorLogger).not.toHaveBeenCalled();
            expect(logger.callLogger).toHaveBeenCalledTimes(1);
        });

        it('should log call event and returned result', async () => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            class TestClass {
                @Loggable(logger)
                async test() {
                    return Promise.resolve('test');
                }
            };

            const actual = await new TestClass().test();

            expect(actual).toBe('test');
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
            expect(logger.errorLogger).not.toHaveBeenCalled();
            expect(logger.resultLogger).toHaveBeenCalledTimes(1);
        });

        it.each<any>([
            'error',
            new Error('test'),
        ])('should log and rethrow error correctly', async (toThrow: any) => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            const token = 'test token';
            const generateRandomTokenMock = generateRandomToken as jest.Mock;
            generateRandomTokenMock.mockReturnValueOnce(token);

            class TestClass {
                @Loggable(logger)
                async test() {
                    return Promise.reject(toThrow);
                }
            };

            const testClass = new TestClass();

            await expect(testClass.test()).rejects.toBe(toThrow);

            expect(logger.callLogger).toHaveBeenCalledTimes(1);
            expect(logger.callLogger).toHaveBeenCalledWith(expect.objectContaining({
                timestamp: expect.any(Date),
                token: token,
                className: 'TestClass',
                methodName: 'test',
                args: [],
            }));

            expect(logger.resultLogger).not.toHaveBeenCalled();

            expect(logger.errorLogger).toHaveBeenCalledTimes(1);
            expect(logger.errorLogger).toHaveBeenCalledWith(expect.objectContaining({
                timestamp: expect.any(Date),
                token: token,
                className: 'TestClass',
                methodName: 'test',
                error: toThrow,
            }));
        });

        it.each<any>([
            null,
            undefined,
            [],
            {},
            '',
            0,
            -0,
            Number.MAX_SAFE_INTEGER,
            Number.EPSILON,
            'string',
            [1, 2, 'test'],
            { property1: 'property1', date: new Date() },
            new RegExp(/test/),
            new Error('error'),
        ])('should return result from original method', async (returnedResult: any) => {
            class TestClass {
                @Loggable()
                async test() {
                    return Promise.resolve(returnedResult);
                }
            }

            const result = await new TestClass().test();

            expect(result).toStrictEqual(returnedResult);
        });

        it.each<any[]>([
            [],
            [ null ],
            [ 1, 'string', { property1: 'property1', property2: 'property2' } ],
            [ new Date(), new RegExp(/test/) ],
            [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ],
        ])('should pass arguments to original correctly', async (...args: any[]) => {
            class TestClass {
                @Loggable()
                async test(...testArguments: any[]) {
                    expect(testArguments).toStrictEqual(args);
                }
            };

            const testClass = new TestClass();

            testClass.test(...args);
        });

        it('should generate pseudo unique token per call', async () => {
            const logger: Logger = {
                callLogger: jest.fn(),
                errorLogger: jest.fn(),
                resultLogger: jest.fn(),
            };

            const tokens = [ 'token1', 'token2', 'token3', 'token 4' ];
            const generateRandomTokenMock = generateRandomToken as jest.Mock;
            tokens.forEach(generateRandomTokenMock.mockReturnValueOnce);

            class TestClass {
                @Loggable(logger)
                async testValue() {
                    return Promise.resolve('test');
                }

                @Loggable(logger)
                async throwError() {
                    return Promise.reject(new Error('error'));
                }
            }

            const test = new TestClass();

            await test.testValue();
            await expect(test.throwError()).rejects.toBeTruthy();
            await test.testValue();
            await expect(test.throwError()).rejects.toBeTruthy();

            expect(logger.callLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[0],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[1],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(3, expect.objectContaining({
                token: tokens[2],
            }));
            expect(logger.callLogger).toHaveBeenNthCalledWith(4, expect.objectContaining({
                token: tokens[3],
            }));


            expect(logger.resultLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[0],
            }));
            expect(logger.resultLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[2],
            }));

            expect(logger.errorLogger).toHaveBeenNthCalledWith(1, expect.objectContaining({
                token: tokens[1],
            }));
            expect(logger.errorLogger).toHaveBeenNthCalledWith(2, expect.objectContaining({
                token: tokens[3],
            }));
        });
    });
});
