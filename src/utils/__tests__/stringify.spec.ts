import { stringify } from '../stringify';

class Test {}

describe('stringify', () => {
    it.each<[Error, object]>([
        [ new Error('test'), { name: 'Error', message: 'test' } ],
        [ new SyntaxError('test'), { name: 'SyntaxError', message: 'test' } ],
    ])('should stringify errors', (error: Error, expected: object) => {
        const actual = JSON.parse(stringify(error));
        expect(actual).toStrictEqual(expected);
    });

    it.each<any>([
        undefined,
        null,
        NaN,
        0,
        '',
        false,
        [],
        {},
        new Date(),
        new Test(),
        [1, 'a', null],
        { a: 'a', b: 'b', test: new Test() },
    ])('should convert value to JSON', (value: any) => {
        expect(stringify(value)).toBe(JSON.stringify(value));
    });

    it('should handle JSON parse error and convert value to string as a fallback', () => {
        const cyclic: Record<string, any> = {};
        cyclic.a = cyclic;

        const actual = stringify(cyclic);

        expect(actual).toBe('' + cyclic);
    });
});
