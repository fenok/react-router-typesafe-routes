import { UniversalType, parser, ParserHint, type } from "../common/index.js";
import { Schema, StringSchema, NumberSchema, BooleanSchema, DateSchema } from "yup";

export function yup<T>(schema: Schema<T>): UniversalType<T> {
    let typeHint: ParserHint = "unknown";

    if (!schema.spec.nullable) {
        if (schema instanceof StringSchema) {
            typeHint = "string";
        } else if (schema instanceof NumberSchema) {
            typeHint = "number";
        } else if (schema instanceof BooleanSchema) {
            typeHint = "boolean";
        } else if (schema instanceof DateSchema) {
            typeHint = "date";
        }
    }

    return type({
        parser: parser(typeHint),
        validator(value: unknown) {
            return schema.validateSync(value);
        },
    });
}
