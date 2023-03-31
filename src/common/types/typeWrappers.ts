import { type, UniversalType, Validator } from "./type.js";
import { parser } from "./parser.js";

function string(): UniversalType<string | undefined>;
function string<T extends string>(validator: Validator<T, string>): UniversalType<T | undefined>;
function string<T extends string = string>(validator = identity as Validator<T, string>): UniversalType<T | undefined> {
    return type(
        (value: unknown) => (value === undefined ? value : validator(stringValidator(value))),
        parser("string")
    );
}

function number(): UniversalType<number | undefined>;
function number<T extends number>(validator: Validator<T, number>): UniversalType<T | undefined>;
function number<T extends number = number>(validator = identity as Validator<T, number>): UniversalType<T | undefined> {
    return type(
        (value: unknown) => (value === undefined ? value : validator(numberValidator(value))),
        parser("number")
    );
}

function boolean(): UniversalType<boolean | undefined>;
function boolean<T extends boolean>(validator: Validator<T, boolean>): UniversalType<T | undefined>;
function boolean<T extends boolean = boolean>(
    validator = identity as Validator<T, boolean>
): UniversalType<T | undefined> {
    return type(
        (value: unknown) => (value === undefined ? value : validator(booleanValidator(value))),
        parser("boolean")
    );
}

function date(): UniversalType<Date | undefined>;
function date<T extends Date>(validator: Validator<T, Date>): UniversalType<T | undefined>;
function date<T extends Date = Date>(validator = identity as Validator<T, Date>): UniversalType<T | undefined> {
    return type((value: unknown) => (value === undefined ? value : validator(dateValidator(value))), parser("date"));
}

function union<T extends readonly (string | number | boolean)[]>(values: T): UniversalType<T[number] | undefined>;
function union<T extends readonly (string | number | boolean)[]>(...values: T): UniversalType<T[number] | undefined>;
function union<T extends readonly (string | number | boolean)[]>(value: T | T[number], ...restValues: T) {
    const values = Array.isArray(value) ? value : [value, ...restValues];

    const stringParser = parser("string");
    const numberParser = parser("number");
    const booleanParser = parser("boolean");

    return type(
        (value: unknown): T[number] | undefined => {
            if (
                value !== undefined &&
                (!(typeof value === "string" || typeof value === "number" || typeof value === "boolean") ||
                    !values.includes(value))
            ) {
                throw new Error(
                    `${String(value)} is not assignable to '${values.map((item) => JSON.stringify(item)).join(" | ")}'`
                );
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

                throw new Error(
                    `${String(value)} is not assignable to '${values.map((item) => JSON.stringify(item)).join(" | ")}'`
                );
            },
        }
    );
}

function stringValidator(value: unknown): string {
    if (typeof value !== "string") {
        throw new Error(`${String(value)} is not assignable to 'string'`);
    }

    return value;
}

function numberValidator(value: unknown): number {
    if (typeof value !== "number") {
        throw new Error(`${String(value)} is not assignable to 'number'`);
    }

    if (Number.isNaN(value)) {
        throw new Error(`Unexpected NaN`);
    }

    return value;
}

function booleanValidator(value: unknown): boolean {
    if (typeof value !== "boolean") {
        throw new Error(`${String(value)} is not assignable to 'boolean'`);
    }

    return value;
}

function dateValidator(value: unknown): Date {
    if (!(value instanceof Date)) {
        throw new Error(`${String(value)} is not assignable to 'Date'`);
    }

    if (typeof value !== "undefined" && Number.isNaN(value.getTime())) {
        throw new Error("Unexpected Invalid Date");
    }

    return value;
}

function identity<T>(value: T): T {
    return value;
}

export { string, number, boolean, date, union };
