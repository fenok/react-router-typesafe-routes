import { UniversalType, parser, ParserHint, type } from "../common/index.js";
import { Schema, StringSchema, DateSchema } from "yup";

export function yup<T>(schema: Schema<T>): UniversalType<T> {
    let typeHint: ParserHint = "unknown";

    if (!schema.spec.nullable) {
        if (schema instanceof StringSchema) {
            typeHint = "string";
        } else if (schema instanceof DateSchema) {
            typeHint = "date";
        }
    }

    return type((value: unknown) => schema.validateSync(value), parser(typeHint));
}
