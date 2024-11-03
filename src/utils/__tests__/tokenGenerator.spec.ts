import { generateRandomToken } from 'utils/tokenGenerator';

describe('tokenGenerator', () => {
    it('should generate different strings', () => {
        const size = 32;
        const values: Set<string> = new Set();
        for (let i = 0; i < size; i++) {
            values.add(generateRandomToken());
        }

        expect(values.size).toBe(size);
    });

    it.each<number>([
        1, 2, 100,
    ])('should generate string with defined length', (length: number) => {
        const token = generateRandomToken(length);
        expect(token).toHaveLength(length);
    });

    it('should have default length equals 8', () => {
        const token = generateRandomToken();
        expect(token).toHaveLength(8);
    });
});
