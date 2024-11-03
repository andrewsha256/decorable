export type TimeoutId = number | NodeJS.Timeout;

export const timeoutable = <T extends (...args: any[]) => void>(
    func: T,
    delayMs: number,
    ...args: Parameters<T>
): TimeoutId => setTimeout(func, delayMs, ...args) as TimeoutId;

export const deferrable = <T extends (...args: any[]) => void>(
    func: T,
    ...args: Parameters<T>
): TimeoutId => timeoutable(func, 0, ...args);
