import { warn } from "../warn.js";

const DEPRECATION_MESSAGE =
    "You're using a deprecated assertion helper, either directly or via a deprecated type. Please switch to universal types.";

/** @deprecated Pass a custom validator to string() instead */
export function assertIsString(value: unknown, message?: string): asserts value is string {
    warn(DEPRECATION_MESSAGE);

    if (typeof value !== "string") {
        throw new Error(message ?? `Expected ${String(value)} to be a string`);
    }
}

/** @deprecated Pass a custom validator to number() instead */
export function assertIsNumber(value: unknown, message?: string): asserts value is number {
    warn(DEPRECATION_MESSAGE);

    if (typeof value !== "number") {
        throw new Error(message ?? `Expected ${String(value)} to be a number`);
    }
}

/** @deprecated Pass a custom validator to boolean() instead */
export function assertIsBoolean(value: unknown, message?: string): asserts value is boolean {
    warn(DEPRECATION_MESSAGE);

    if (typeof value !== "boolean") {
        throw new Error(message ?? `Expected ${String(value)} to be a boolean`);
    }
}

/** @deprecated This shouldn't be used in universal types */
export function assertIsArray(value: unknown, message?: string): asserts value is unknown[] {
    warn(DEPRECATION_MESSAGE);

    if (!Array.isArray(value)) {
        throw new Error(message ?? `Expected ${String(value)} to be an array`);
    }
}

/** @deprecated Pass a custom validator to date() instead */
export function assertIsValidDate(value: unknown, message?: string): asserts value is Date {
    warn(DEPRECATION_MESSAGE);

    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new Error(message ?? `Expected ${String(value)} to be a valid date`);
    }
}
