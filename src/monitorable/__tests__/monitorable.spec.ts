import { Monitorable } from '../monitorable';
import { MonitorableData } from '../monitorable.interfaces';
import { deferrable } from '../../utils';

jest.mock('../../utils');

const deferrableMock = deferrable as jest.Mock;

describe('Monitorable', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterAll(() => {
        jest.resetAllMocks();
    });

    it('should throw an error if used not as a method decorator', () => {
        const monitorable = Monitorable({ consume: jest.fn() });
        expect(() => monitorable('test', 'test', {})).toThrow();
    });

    it.each<any>([
        false,
        null,
        undefined,
    ])('should ignore consumeBefore if it is nullable', (consumeBefore: any) => {
        const consume = jest.fn();

        class Test {
            @Monitorable({
                consume,
                consumeBefore,
            })
            test() {
                return 'test';
            }
        };

        const actual = new Test().test();

        expect(actual).toBe('test');
        expect(consume).toHaveBeenCalledTimes(1);
        expect(deferrableMock).not.toHaveBeenCalled();
    });

    it('should call consumeBefore with default monitoredName if options.monitorName is not defined', () => {
        const consume = jest.fn();
        const consumeBefore = jest.fn();
        const startedAt = new Date('2024-12-01T12:24:00Z');

        jest.spyOn(global, 'Date')
            .mockImplementation(() => startedAt);

        class Test {
            @Monitorable({
                consume,
                consumeBefore,
            })
            test() {
                return 'test';
            }
        };

        const actual = new Test().test();

        const expectedConsumeBeforeArgument: MonitorableData = {
            className: 'Test',
            methodName: 'test',
            monitorName: 'Test::test',
            startedAt,
        };

        expect(actual).toBe('test');
        expect(consume).toHaveBeenCalledTimes(1);
        expect(deferrableMock).toHaveBeenCalledTimes(1);
        expect(deferrableMock).toHaveBeenCalledWith(consumeBefore, expectedConsumeBeforeArgument);
    });
});
