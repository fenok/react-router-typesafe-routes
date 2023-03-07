import { type } from "./createType.js";
import { stringValidator, numberValidator, booleanValidator, dateValidator } from "./validators.js";
import { Validator, SimpleType } from "./type.js";
import { parser } from "./parsers.js";

function string(): SimpleType<string>;
function string<T extends string>(validator: Validator<T, string>): SimpleType<T>;
function string<T extends string = string>(validator?: Validator<T, string>): SimpleType<T> {
    return type({
        validator: validator
            ? (value: unknown) => validator(stringValidator(value))
            : (stringValidator as Validator<T>),
        parser: parser("string"),
    });
}

function number(): SimpleType<number>;
function number<T extends number>(validator: Validator<T, number>): SimpleType<T>;
function number<T extends number = number>(validator?: Validator<T, number>): SimpleType<T> {
    return type({
        validator: validator
            ? (value: unknown) => validator(numberValidator(value))
            : (numberValidator as Validator<T>),
        parser: parser("number"),
    });
}

function boolean(): SimpleType<boolean>;
function boolean<T extends boolean>(validator: Validator<T, boolean>): SimpleType<T>;
function boolean<T extends boolean = boolean>(validator?: Validator<T, boolean>): SimpleType<T> {
    return type({
        validator: validator
            ? (value: unknown) => validator(booleanValidator(value))
            : (booleanValidator as Validator<T>),
        parser: parser("boolean"),
    });
}

function date(): SimpleType<Date>;
function date<T extends Date>(validator: Validator<T, Date>): SimpleType<T>;
function date<T extends Date = Date>(validator?: Validator<T, Date>): SimpleType<T> {
    return type({
        validator: validator ? (value: unknown) => validator(dateValidator(value)) : (dateValidator as Validator<T>),
        parser: parser("date"),
    });
}

function union<T extends readonly (string | number | boolean)[]>(values: T): SimpleType<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(...values: T): SimpleType<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(value: T | T[number], ...restValues: T) {
    const values = Array.isArray(value) ? value : [value, ...restValues];

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
}

export { string, number, boolean, date, union };
