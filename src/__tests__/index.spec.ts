import {
    Loggable,
} from '../index';
import {
    generateRandomToken,
    stringify,
} from '../utils';

describe('Decorable module exports', () => {
    it('should export submodules', () => {
        expect(Loggable).toBeInstanceOf(Function);
    });

    it('should export utils', () => {
        expect(generateRandomToken).toBeInstanceOf(Function);
        expect(stringify).toBeInstanceOf(Function);
    })
});
