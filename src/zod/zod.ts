import { type, Fallback } from "../common/index.js";
import { ZodType, ZodNullable, ZodOptional, ZodString } from "zod";

export function zod<T, TFallback extends Fallback<T>>(zodType: ZodType<T>, fallback?: TFallback) {
    const isString =
        zodType instanceof ZodString ||
        ((zodType instanceof ZodOptional || zodType instanceof ZodNullable) && zodType.unwrap() instanceof ZodString);

    return type(
        {
            parser: {
                stringify(value) {
                    return isString && typeof value === "string" ? value : JSON.stringify(value);
                },
                parse(value: string) {
                    return isString ? value : (JSON.parse(value) as unknown);
                },
            },
            validate(value: unknown) {
                return zodType.parse(value);
            },
        },
        fallback
    );
}
