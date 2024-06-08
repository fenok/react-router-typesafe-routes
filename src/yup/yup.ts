import { Type, parser, ParserHint, type, Parser } from "../common/index.js";
import { StringSchema, DateSchema, NumberSchema, BooleanSchema } from "yup";

interface ConfigureOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parserFactory: (hint?: ParserHint) => Parser<any, ParserHint>;
}

/** @see https://github.com/jquense/yup/issues/1974 */
interface SchemaLike<T> {
  spec: {
    nullable: boolean;
  };
  validateSync(value: unknown): T;
}

function configure({ parserFactory }: ConfigureOptions) {
  function yup<T>(schema: SchemaLike<T | undefined>): Type<T> {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return type((value: unknown) => schema.validateSync(value), parserFactory(typeHint));
  }

  return { yup };
}

const { yup } = configure({ parserFactory: parser });

export { configure, yup };
