export function assertIsString(value: unknown, message?: string): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(message ?? `Expected ${String(value)} to be a string`);
    }
}

export function assertIsNumber(value: unknown, message?: string): asserts value is number {
    if (typeof value !== "number") {
        throw new Error(message ?? `Expected ${String(value)} to be a number`);
    }
}

export function assertIsBoolean(value: unknown, message?: string): asserts value is boolean {
    if (typeof value !== "boolean") {
        throw new Error(message ?? `Expected ${String(value)} to be a boolean`);
    }
}

export function assertIsArray(value: unknown, message?: string): asserts value is unknown[] {
    if (!Array.isArray(value)) {
        throw new Error(message ?? `Expected ${String(value)} to be an array`);
    }
}

export function assertIsValidDate(value: unknown, message?: string): asserts value is Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new Error(message ?? `Expected ${String(value)} to be a valid date`);
    }
}

export function validateString(value: unknown): string {
    assertIsString(value);

    return value;
}

export function validateNumber(value: unknown): number {
    assertIsNumber(value);

    return value;
}

export function validateBoolean(value: unknown): boolean {
    assertIsBoolean(value);

    return value;
}

export function validateDate(value: unknown): Date {
    assertIsValidDate(value);

    return value;
}

export function validateArray(value: unknown): unknown[] {
    assertIsArray(value);

    return value;
}
