interface Parser<T, THint extends string = never> {
  stringify: (value: T, context: ParserContext<THint>) => string;
  parse: (value: string, context: ParserContext<THint>) => unknown;
}

interface ParserContext<THint extends string = never> {
  hint?: THint;
  kind: "pathname" | "search" | "hash";
}

type ParserHint = "string" | "number" | "boolean" | "date" | "unknown";

type ParserType<T extends ParserHint> = T extends "unknown"
  ? unknown
  : T extends "string"
  ? string
  : T extends "date"
  ? Date
  : T extends "number"
  ? number
  : T extends "boolean"
  ? boolean
  : never;

function parser<T extends ParserHint = "unknown">(defaultHint?: T): Parser<ParserType<T>, ParserHint> {
  return {
    stringify(value, { hint }) {
      const resolvedHint = hint ?? defaultHint;

      if (resolvedHint === "string" && typeof value === "string") {
        return value;
      }

      if (resolvedHint === "date" && value instanceof Date) {
        return value.toISOString();
      }

      return JSON.stringify(value);
    },
    parse(value, { hint }) {
      const resolvedHint = hint ?? defaultHint;

      if (resolvedHint === "string") {
        return value;
      }

      if (resolvedHint === "date") {
        return new Date(value);
      }

      return JSON.parse(value) as unknown;
    },
  };
}

export { parser, Parser, ParserHint, ParserType };
