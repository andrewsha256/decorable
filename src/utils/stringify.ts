export const stringify = (target: any): string => {
    if (target instanceof Error) {
        return JSON.stringify({
            name: target.name,
            message: target.message,
        });
    }

    // TODO add NaN undefined, cyclic object support

    try {
        return JSON.stringify(target);
    } catch {
        return `${target}`;
    }
}
