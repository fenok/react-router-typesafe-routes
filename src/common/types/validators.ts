export function stringValidator(value: unknown): string | undefined {
    if (typeof value !== "undefined" && typeof value !== "string") {
        throw new Error(`Expected ${String(value)} to be a string`);
    }

    return value;
}

export function numberValidator(value: unknown): number | undefined {
    if (typeof value !== "undefined" && (typeof value !== "number" || Number.isNaN(value))) {
        throw new Error(`Expected ${String(value)} to be a number`);
    }

    return value;
}

export function booleanValidator(value: unknown): boolean | undefined {
    if (typeof value !== "undefined" && typeof value !== "boolean") {
        throw new Error(`Expected ${String(value)} to be a boolean`);
    }

    return value;
}

export function dateValidator(value: unknown): Date | undefined {
    if (typeof value !== "undefined" && (!(value instanceof Date) || Number.isNaN(value.getTime()))) {
        throw new Error(`Expected ${String(value)} to be a Date`);
    }

    return value;
}
