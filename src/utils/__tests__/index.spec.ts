import {
    deferrable,
    generateRandomToken,
    stringify,
    timeoutable,
} from '../index';

describe('utils module', () => {
    it('should export submodules', () => {
        expect(deferrable).toBeInstanceOf(Function);
        expect(timeoutable).toBeInstanceOf(Function);
        expect(generateRandomToken).toBeInstanceOf(Function);
        expect(stringify).toBeInstanceOf(Function);
    });
});
