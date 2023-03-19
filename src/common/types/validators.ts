export function stringValidator(value: unknown): string | undefined {
    if (typeof value !== "undefined" && typeof value !== "string") {
        throw new Error(`${String(value)} is not assignable to 'string | undefined'`);
    }

    return value;
}

export function numberValidator(value: unknown): number | undefined {
    if (typeof value !== "undefined" && typeof value !== "number") {
        throw new Error(`${String(value)} is not assignable to 'number | undefined'`);
    }

    if (Number.isNaN(value)) {
        throw new Error(`Unexpected NaN`);
    }

    return value;
}

export function booleanValidator(value: unknown): boolean | undefined {
    if (typeof value !== "undefined" && typeof value !== "boolean") {
        throw new Error(`${String(value)} is not assignable to 'boolean | undefined'`);
    }

    return value;
}

export function dateValidator(value: unknown): Date | undefined {
    if (typeof value !== "undefined" && !(value instanceof Date)) {
        throw new Error(`${String(value)} is not assignable to 'Date | undefined'`);
    }

    if (typeof value !== "undefined" && Number.isNaN(value.getTime())) {
        throw new Error("Unexpected Invalid Date");
    }

    return value;
}
