import { ThrowableFallback } from "./type.js";
import { type } from "./createType.js";
import { validateString, validateNumber, validateBoolean, validateDate } from "./helpers.js";

export const string = <TFallback extends string | ThrowableFallback | undefined>(fallback?: TFallback) =>
    type(
        {
            validate: validateString,
            parser: {
                stringify: (value: string) => value,
                parse: (value: string) => value,
            },
        },
        fallback
    );

export const number = <TFallback extends number | ThrowableFallback | undefined>(fallback?: TFallback) =>
    type(validateNumber, fallback);

export const boolean = <TFallback extends boolean | ThrowableFallback | undefined>(fallback?: TFallback) =>
    type(validateBoolean, fallback);

export const date = <TFallback extends Date | ThrowableFallback | undefined>(fallback?: TFallback) =>
    type(
        {
            validate: validateDate,
            parser: {
                stringify(value: Date): string {
                    return value.toISOString();
                },
                parse(value: string) {
                    return new Date(value);
                },
            },
        },
        fallback
    );

export const union = <
    T extends readonly (string | number | boolean)[],
    TFallback extends T[number] | ThrowableFallback | undefined
>(
    values: T,
    fallback?: TFallback
) => {
    return type(
        {
            validate: (value: unknown): T[number] => {
                if (
                    !(typeof value === "string" || typeof value === "number" || typeof value === "boolean") ||
                    !values.includes(value)
                ) {
                    throw new Error(`No matching value for ${String(value)}`);
                }

                return value;
            },
            parser: {
                stringify(value: T[number]): string {
                    switch (typeof value) {
                        case "string":
                            return value;
                        case "number":
                        case "boolean":
                            return JSON.stringify(value);
                        default:
                            throw new Error(`Expected ${String(value)} to be string, number or boolean`);
                    }
                },
                parse(value: string): unknown {
                    for (const canonicalValue of values) {
                        try {
                            switch (typeof canonicalValue) {
                                case "string":
                                    if (value === canonicalValue) return canonicalValue;
                                    break;
                                case "number":
                                case "boolean":
                                    if (JSON.parse(value) === canonicalValue) return canonicalValue;
                            }
                        } catch {
                            // Try next value
                        }
                    }

                    throw new Error(`No matching value for ${String(value)}`);
                },
            },
        },
        fallback
    );
};
