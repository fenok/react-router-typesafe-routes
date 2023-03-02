import { type } from "./createType.js";
import { validateString, validateNumber, validateBoolean, validateDate } from "./helpers.js";
import { Validator, SimpleType } from "./type.js";
import { dateParser, stringParser, numberParser, booleanParser } from "./parsers.js";

export function string<T extends string = string>(validator?: Validator<T>): SimpleType<T> {
    return type({ validate: validator ?? (validateString as Validator<T>), parser: stringParser });
}

export function number<T extends number = number>(validator?: Validator<T>): SimpleType<T> {
    return type({ validate: validator ?? (validateNumber as Validator<T>), parser: numberParser });
}

export function boolean<T extends boolean = boolean>(validator?: Validator<T>): SimpleType<T> {
    return type({ validate: validator ?? (validateBoolean as Validator<T>), parser: booleanParser });
}

export function date<T extends Date = Date>(validator?: Validator<T>): SimpleType<T> {
    return type({ validate: validator ?? (validateDate as Validator<T>), parser: dateParser });
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
                return typeof value === "string"
                    ? stringParser.stringify(value)
                    : typeof value === "number"
                    ? numberParser.stringify(value)
                    : booleanParser.stringify(value);
            },
            parse(value: string): unknown {
                for (const canonicalValue of values) {
                    try {
                        if (
                            canonicalValue ===
                            (typeof canonicalValue === "string"
                                ? stringParser.parse(value)
                                : typeof canonicalValue === "number"
                                ? numberParser.parse(value)
                                : booleanParser.parse(value))
                        ) {
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
