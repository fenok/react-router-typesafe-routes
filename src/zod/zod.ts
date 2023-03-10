import { type, UniversalType, ParserHint, parser } from "../common/index.js";
import { ZodType, ZodOptional, ZodString, ZodNumber, ZodBoolean, ZodDate, ZodTypeAny } from "zod";

export function zod<T>(zodType: ZodType<T>): UniversalType<T> {
    const unwrappedZodType = zodType instanceof ZodOptional ? (zodType.unwrap() as ZodTypeAny) : zodType;

    let typeHint: ParserHint = "unknown";

    if (unwrappedZodType instanceof ZodString) {
        typeHint = "string";
    } else if (unwrappedZodType instanceof ZodNumber) {
        typeHint = "number";
    } else if (unwrappedZodType instanceof ZodBoolean) {
        typeHint = "boolean";
    } else if (unwrappedZodType instanceof ZodDate) {
        typeHint = "date";
    }

    return type((value: unknown) => zodType.parse(value), parser(typeHint));
}
