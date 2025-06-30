import { type, Type, ParserHint, parser, Parser } from "../lib/index.js";
import type { StandardSchemaV1 } from "./standard-schema-spec";

interface ConfigureOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parserFactory: (hint?: ParserHint) => Parser<any, ParserHint>;
}

function configure({ parserFactory }: ConfigureOptions) {
  function schema<T>(schema: StandardSchemaV1<unknown, T | undefined>, parser?: Parser<T>): Type<T> {
    return type(
      (value: unknown) => {
        const result = schema["~standard"].validate(value);

        if (result instanceof Promise) throw new Error("Async validation is not supported");

        if (result.issues) {
          throw new Error(JSON.stringify(result.issues, null, 2));
        }

        return result.value;
      },
      parser ?? parserFactory("unknown"),
    );
  }

  return { schema };
}

const { schema } = configure({ parserFactory: parser });

export { configure, schema };
