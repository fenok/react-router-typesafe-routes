import { Parser } from "./type.js";

export const defaultParser: Parser<unknown> = JSON;
export const numberParser: Parser<number> = JSON;
export const booleanParser: Parser<boolean> = JSON;
export const stringParser: Parser<string> = { stringify: (value: string) => value, parse: (value: string) => value };
export const dateParser: Parser<Date> = {
    stringify(value: Date): string {
        return value.toISOString();
    },
    parse(value: string) {
        return new Date(value);
    },
};
export const stringArrayParser: Parser<string[]> = JSON;
