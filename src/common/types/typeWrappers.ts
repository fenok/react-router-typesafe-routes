import { type, UniversalType, Validator } from "./type.js";
import { stringValidator, numberValidator, booleanValidator, dateValidator } from "./validators.js";
import { parser } from "./parser.js";

function string(): UniversalType<string | undefined>;
function string<T extends string | undefined>(validator: Validator<T, string | undefined>): UniversalType<T>;
function string<T extends string | undefined = string | undefined>(
    validator?: Validator<T, string | undefined>
): UniversalType<T> {
    return type(
        validator ? (value: unknown) => validator(stringValidator(value)) : (stringValidator as Validator<T>),
        parser("string")
    );
}

function number(): UniversalType<number | undefined>;
function number<T extends number | undefined>(validator: Validator<T, number | undefined>): UniversalType<T>;
function number<T extends number | undefined = number | undefined>(
    validator?: Validator<T, number | undefined>
): UniversalType<T> {
    return type(
        validator ? (value: unknown) => validator(numberValidator(value)) : (numberValidator as Validator<T>),
        parser("number")
    );
}

function boolean(): UniversalType<boolean | undefined>;
function boolean<T extends boolean | undefined>(validator: Validator<T, boolean | undefined>): UniversalType<T>;
function boolean<T extends boolean | undefined = boolean | undefined>(
    validator?: Validator<T, boolean | undefined>
): UniversalType<T> {
    return type(
        validator ? (value: unknown) => validator(booleanValidator(value)) : (booleanValidator as Validator<T>),
        parser("boolean")
    );
}

function date(): UniversalType<Date | undefined>;
function date<T extends Date | undefined>(validator: Validator<T, Date | undefined>): UniversalType<T>;
function date<T extends Date | undefined = Date | undefined>(
    validator?: Validator<T, Date | undefined>
): UniversalType<T> {
    return type(
        validator ? (value: unknown) => validator(dateValidator(value)) : (dateValidator as Validator<T>),
        parser("date")
    );
}

function union<T extends readonly (string | number | boolean)[]>(values: T): UniversalType<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(...values: T): UniversalType<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(value: T | T[number], ...restValues: T) {
    const values = Array.isArray(value) ? value : [value, ...restValues];

    const stringParser = parser("string");
    const numberParser = parser("number");
    const booleanParser = parser("boolean");

    return type(
        (value: unknown): T[number] => {
            if (
                !(typeof value === "string" || typeof value === "number" || typeof value === "boolean") ||
                !values.includes(value)
            ) {
                throw new Error(`No matching value for ${String(value)}`);
            }

            return value;
        },
        {
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
        }
    );
}

export { string, number, boolean, date, union };
