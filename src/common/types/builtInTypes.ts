import { type } from "./createType.js";
import { stringValidator, numberValidator, booleanValidator, dateValidator } from "./helpers.js";
import { Validator, SimpleType } from "./type.js";
import { parser } from "./parsers.js";

export function string<T extends string = string>(validator?: Validator<T>): SimpleType<T> {
    return type({ validator: validator ?? (stringValidator as Validator<T>), parser: parser("string") });
}

export function number<T extends number = number>(validator?: Validator<T>): SimpleType<T> {
    return type({ validator: validator ?? (numberValidator as Validator<T>), parser: parser("number") });
}

export function boolean<T extends boolean = boolean>(validator?: Validator<T>): SimpleType<T> {
    return type({ validator: validator ?? (booleanValidator as Validator<T>), parser: parser("boolean") });
}

export function date<T extends Date = Date>(validator?: Validator<T>): SimpleType<T> {
    return type({ validator: validator ?? (dateValidator as Validator<T>), parser: parser("date") });
}

export const union = <T extends readonly (string | number | boolean)[]>(values: T) => {
    const stringParser = parser("string");
    const numberParser = parser("number");
    const booleanParser = parser("boolean");

    return type({
        validator: (value: unknown): T[number] => {
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
