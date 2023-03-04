import {
    type,
    stringParser,
    numberParser,
    booleanParser,
    dateParser,
    defaultParser,
    SimpleType,
} from "../common/index.js";
import { Schema, StringSchema, NumberSchema, BooleanSchema, DateSchema } from "yup";

export function yup<T>(schema: Schema<T>): SimpleType<T> {
    const isString = !schema.spec.nullable && schema instanceof StringSchema;
    const isNumber = !schema.spec.nullable && schema instanceof NumberSchema;
    const isBoolean = !schema.spec.nullable && schema instanceof BooleanSchema;
    const isDate = !schema.spec.nullable && schema instanceof DateSchema;

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
        validator(value: unknown) {
            return schema.validateSync(value);
        },
    });
}
