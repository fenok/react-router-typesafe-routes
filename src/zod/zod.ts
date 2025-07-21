import { type, Type, ParserHint, parser, Parser } from "../lib/index.js";
import { ZodType, ZodOptional } from "zod/v4";
import {
  ZodType as ZodTypeV3,
  ZodOptional as ZodOptionalV3,
  ZodString as ZodStringV3,
  ZodDate as ZodDateV3,
  ZodTypeAny as ZodTypeAnyV3,
  ZodNumber as ZodNumberV3,
  ZodBoolean as ZodBooleanV3,
} from "zod/v3";

interface ConfigureOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parserFactory: (hint?: ParserHint) => Parser<any, ParserHint>;
}

function configure({ parserFactory }: ConfigureOptions) {
  function zod<T>(zodType: ZodType<T | undefined> | ZodTypeV3<T | undefined>, parser?: Parser<T>): Type<T> {
    const unwrappedZodType =
      zodType instanceof ZodOptional
        ? zodType.unwrap()
        : zodType instanceof ZodOptionalV3
        ? (zodType.unwrap() as ZodTypeAnyV3)
        : zodType;

    let typeHint: ParserHint = "unknown";

    if (
      (unwrappedZodType instanceof ZodType && unwrappedZodType.def.type === "string") ||
      unwrappedZodType instanceof ZodStringV3
    ) {
      typeHint = "string";
    } else if (
      (unwrappedZodType instanceof ZodType && unwrappedZodType.def.type === "number") ||
      unwrappedZodType instanceof ZodNumberV3
    ) {
      typeHint = "number";
    } else if (
      (unwrappedZodType instanceof ZodType && unwrappedZodType.def.type === "boolean") ||
      unwrappedZodType instanceof ZodBooleanV3
    ) {
      typeHint = "boolean";
    } else if (
      (unwrappedZodType instanceof ZodType && unwrappedZodType.def.type === "date") ||
      unwrappedZodType instanceof ZodDateV3
    ) {
      typeHint = "date";
    }

    return type((value: unknown) => zodType.parse(value), parser ?? parserFactory(typeHint));
  }

  return { zod };
}

const { zod } = configure({ parserFactory: parser });

export { configure, zod };
