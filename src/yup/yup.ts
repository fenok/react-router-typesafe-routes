import { type, Fallback } from "../common/index.js";
import { Schema, StringSchema } from "yup";

export function yup<T, TFallback extends Fallback<T>>(schema: Schema<T>, fallback?: TFallback) {
    const isString = schema instanceof StringSchema;

    return type(
        {
            validate: (val: unknown) => schema.validateSync(val),
            parser: {
                stringify(value) {
                    // We check the schema type and serialize only non-string values.
                    return isString && typeof value === "string" ? value : JSON.stringify(value);
                },
                parse(value) {
                    // And we parse only what we expect to be serialized.
                    return isString ? value : (JSON.parse(value) as unknown);
                },
            },
        },
        fallback
    );
}
