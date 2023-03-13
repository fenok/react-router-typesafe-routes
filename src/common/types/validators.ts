export function stringValidator(value: unknown): string {
    if (typeof value !== "string") {
        throw new Error(`Expected ${String(value)} to be a string`);
    }

    return value;
}

export function numberValidator(value: unknown): number {
    if (typeof value !== "number") {
        throw new Error(`Expected ${String(value)} to be a number`);
    }

    return value;
}

export function booleanValidator(value: unknown): boolean {
    if (typeof value !== "boolean") {
        throw new Error(`Expected ${String(value)} to be a boolean`);
    }

    return value;
}

export function dateValidator(value: unknown): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new Error(`Expected ${String(value)} to be a valid date`);
    }

    return value;
}

export function arrayValidator(value: unknown): unknown[] {
    if (!Array.isArray(value)) {
        throw new Error(`Expected ${String(value)} to be an array`);
    }

    return value;
}
