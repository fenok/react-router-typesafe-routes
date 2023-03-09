import {
    assertIsString,
    assertIsNumber,
    assertIsBoolean,
    assertIsValidDate,
    assertIsArray,
} from "./helpers.deprecated";

export function stringValidator(value: unknown): string {
    assertIsString(value);

    return value;
}

export function numberValidator(value: unknown): number {
    assertIsNumber(value);

    return value;
}

export function booleanValidator(value: unknown): boolean {
    assertIsBoolean(value);

    return value;
}

export function dateValidator(value: unknown): Date {
    assertIsValidDate(value);

    return value;
}

export function arrayValidator(value: unknown): unknown[] {
    assertIsArray(value);

    return value;
}
