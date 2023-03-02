import {
    type,
    SimpleType,
    stringParser,
    numberParser,
    booleanParser,
    dateParser,
    defaultParser,
} from "../common/index.js";
import { ZodType, ZodOptional, ZodString, ZodNumber, ZodBoolean, ZodDate, ZodTypeAny } from "zod";

export function zod<T>(zodType: ZodType<T>): SimpleType<T> {
    const unwrappedZodType = zodType instanceof ZodOptional ? (zodType.unwrap() as ZodTypeAny) : zodType;

    const isString = unwrappedZodType instanceof ZodString;
    const isNumber = unwrappedZodType instanceof ZodNumber;
    const isBoolean = unwrappedZodType instanceof ZodBoolean;
    const isDate = unwrappedZodType instanceof ZodDate;

    return type({
        parser: {
            stringify(value) {
                if (isString && typeof value === "string") {
                    return stringParser.stringify(value);
                }

                if (isNumber && typeof value === "number") {
                    return numberParser.stringify(value);
                }

                if (isBoolean && typeof value === "boolean") {
                    return booleanParser.stringify(value);
                }

                if (isDate && value instanceof Date) {
                    return dateParser.stringify(value);
                }

                return defaultParser.stringify(value);
            },
            parse(value: string) {
                if (isString) {
                    return stringParser.parse(value);
                }

                if (isNumber) {
                    return numberParser.parse(value);
                }

                if (isBoolean) {
                    return booleanParser.parse(value);
                }

                if (isDate) {
                    return dateParser.parse(value);
                }

                return defaultParser.parse(value);
            },
        },
        validate(value: unknown) {
            return zodType.parse(value);
        },
    });
}
