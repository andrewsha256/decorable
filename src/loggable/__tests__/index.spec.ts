import { Loggable } from '../index';

describe('loggable module', () => {
    it('should export Loggable', () => {
        expect(Loggable).toBeInstanceOf(Function);
    });
});
