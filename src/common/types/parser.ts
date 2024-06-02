interface Parser<T> {
  stringify: (value: T) => string;
  parse: (value: string) => unknown;
}

type ParserHint = "string" | "date" | "unknown";

type ParserType<T extends ParserHint> = T extends "unknown"
  ? unknown
  : T extends "string"
  ? string
  : T extends "date"
  ? Date
  : never;

function parser<T extends ParserHint = "unknown">(hint?: T): Parser<ParserType<T>> {
  return {
    stringify(value) {
      if (hint === "string" && typeof value === "string") {
        return stringParser.stringify(value);
      }

      if (hint === "date" && value instanceof Date) {
        return dateParser.stringify(value);
      }

      return defaultParser.stringify(value);
    },
    parse(value: string) {
      if (hint === "string") {
        return stringParser.parse(value);
      }

      if (hint === "date") {
        return dateParser.parse(value);
      }

      return defaultParser.parse(value);
    },
  };
}

const defaultParser: Parser<unknown> = JSON;
const stringParser: Parser<string> = { stringify: (value: string) => value, parse: (value: string) => value };
const dateParser: Parser<Date> = {
  stringify(value: Date): string {
    return value.toISOString();
  },
  parse(value: string) {
    return new Date(value);
  },
};

export { parser, Parser, ParserHint, ParserType };
