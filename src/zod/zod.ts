import { type, Type, ParserHint, parser } from "../common/index.js";
import { ZodType, ZodOptional, ZodString, ZodDate, ZodTypeAny } from "zod";

export function zod<T>(zodType: ZodType<T>): Type<T> {
    const unwrappedZodType = zodType instanceof ZodOptional ? (zodType.unwrap() as ZodTypeAny) : zodType;

    let typeHint: ParserHint = "unknown";

    if (unwrappedZodType instanceof ZodString) {
        typeHint = "string";
    } else if (unwrappedZodType instanceof ZodDate) {
        typeHint = "date";
    }

    return type((value: unknown) => zodType.parse(value), parser(typeHint));
}
