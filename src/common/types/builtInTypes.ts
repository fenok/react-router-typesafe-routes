import { type } from "./createType.js";
import { validateString, validateNumber, validateBoolean, validateDate } from "./helpers.js";

export const string = () =>
    type({
        validate: validateString,
        parser: {
            stringify: (value: string) => value,
            parse: (value: string) => value,
        },
    });

export const number = () => type(validateNumber);

export const boolean = () => type(validateBoolean);

export const date = () =>
    type({
        validate: validateDate,
        parser: {
            stringify(value: Date): string {
                return value.toISOString();
            },
            parse(value: string) {
                return new Date(value);
            },
        },
    });

export const union = <T extends readonly (string | number | boolean)[]>(values: T) => {
    return type({
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
                return typeof value === "string" ? value : JSON.stringify(value);
            },
            parse(value: string): unknown {
                for (const canonicalValue of values) {
                    try {
                        if (canonicalValue === (typeof canonicalValue === "string" ? value : JSON.parse(value))) {
                            return canonicalValue;
                        }
                    } catch {
                        // Try next value
                    }
                }

                throw new Error(`No matching value for ${String(value)}`);
            },
        },
    });
};
