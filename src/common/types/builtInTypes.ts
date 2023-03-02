import { type } from "./createType.js";
import { validateString, validateNumber, validateBoolean, validateDate } from "./helpers.js";
import { Validator, SimpleType } from "./type.js";

export function string<T extends string = string>(validator?: Validator<T>): SimpleType<T> {
    return type({
        validate: validator ?? (validateString as Validator<T>),
        parser: {
            stringify: (value: T) => value,
            parse: (value: string) => value,
        },
    });
}

export function number<T extends number = number>(validator?: Validator<T>): SimpleType<T> {
    return type(validator ?? (validateNumber as Validator<T>));
}

export function boolean<T extends boolean = boolean>(validator?: Validator<T>): SimpleType<T> {
    return type(validator ?? (validateBoolean as Validator<T>));
}

export function date<T extends Date = Date>(validator?: Validator<T>): SimpleType<T> {
    return type({
        validate: validator ?? (validateDate as Validator<T>),
        parser: {
            stringify(value: T): string {
                return value.toISOString();
            },
            parse(value: string) {
                return new Date(value);
            },
        },
    });
}

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
