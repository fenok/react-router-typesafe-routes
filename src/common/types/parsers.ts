import { Parser } from "./type.js";

type ParserHint = "string" | "number" | "boolean" | "date" | "string[]" | undefined;

type ParserType<T extends ParserHint | undefined> = undefined extends T
    ? unknown
    : T extends "string"
    ? string
    : T extends "number"
    ? number
    : T extends "boolean"
    ? boolean
    : T extends "date"
    ? Date
    : T extends "string[]"
    ? string[]
    : never;

function parser(): Parser<unknown>;
function parser<T extends ParserHint>(hint: T): Parser<ParserType<T>>;
function parser<T extends ParserHint>(hint?: T): Parser<ParserType<T>> {
    return {
        stringify(value) {
            if (hint === "string" && typeof value === "string") {
                return stringParser.stringify(value);
            }

            if (hint === "number" && typeof value === "number") {
                return numberParser.stringify(value);
            }

            if (hint === "boolean" && typeof value === "boolean") {
                return booleanParser.stringify(value);
            }

            if (hint === "date" && value instanceof Date) {
                return dateParser.stringify(value);
            }

            if (hint === "string[]" && Array.isArray(value) && value.every((item) => typeof item === "string")) {
                return stringArrayParser.stringify(value);
            }

            return defaultParser.stringify(value);
        },
        parse(value: string) {
            if (hint === "string") {
                return stringParser.parse(value);
            }

            if (hint === "number") {
                return numberParser.parse(value);
            }

            if (hint === "boolean") {
                return booleanParser.parse(value);
            }

            if (hint === "date") {
                return dateParser.parse(value);
            }

            if (hint === "string[]") {
                return stringArrayParser.parse(value);
            }

            return defaultParser.parse(value);
        },
    };
}

const defaultParser: Parser<unknown> = JSON;
const numberParser: Parser<number> = JSON;
const booleanParser: Parser<boolean> = JSON;
const stringParser: Parser<string> = { stringify: (value: string) => value, parse: (value: string) => value };
const dateParser: Parser<Date> = {
    stringify(value: Date): string {
        return value.toISOString();
    },
    parse(value: string) {
        return new Date(value);
    },
};

const stringArrayParser: Parser<string[]> = JSON;

export { parser, ParserHint, ParserType };
