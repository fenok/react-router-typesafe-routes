import { type, Type, ParserHint, parser, Parser } from "../common/index.js";
import { ZodType, ZodOptional, ZodString, ZodDate, ZodTypeAny, ZodNumber, ZodBoolean } from "zod";

interface ConfigureOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parserFactory: (hint?: ParserHint) => Parser<any, ParserHint>;
}

function configure({ parserFactory }: ConfigureOptions) {
  function zod<T>(zodType: ZodType<T | undefined>): Type<T> {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return type((value: unknown) => zodType.parse(value), parserFactory(typeHint));
  }

  return { zod };
}

const { zod } = configure({ parserFactory: parser });

export { configure, zod };
