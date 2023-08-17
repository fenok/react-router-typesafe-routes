import { Type, parser, ParserHint, type } from "../common/index.js";
import { StringSchema, DateSchema } from "yup";

/** @see https://github.com/jquense/yup/issues/1974 */
interface SchemaLike<T> {
  spec: {
    nullable: boolean;
  };
  validateSync(value: unknown): T;
}

export function yup<T>(schema: SchemaLike<T | undefined>): Type<T> {
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
