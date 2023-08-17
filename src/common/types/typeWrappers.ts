import { type, Type, Validator } from "./type.js";
import { parser } from "./parser.js";

function string(): Type<string>;
function string<T extends string>(validator: Validator<T, string>): Type<T>;
function string<T extends string = string>(validator = identity as Validator<T, string>): Type<T> {
  return type((value: unknown) => (value === undefined ? value : validator(stringValidator(value))), parser("string"));
}

function number(): Type<number>;
function number<T extends number>(validator: Validator<T, number>): Type<T>;
function number<T extends number = number>(validator = identity as Validator<T, number>): Type<T> {
  return type((value: unknown) => (value === undefined ? value : validator(numberValidator(value))));
}

function boolean(): Type<boolean>;
function boolean<T extends boolean>(validator: Validator<T, boolean>): Type<T>;
function boolean<T extends boolean = boolean>(validator = identity as Validator<T, boolean>): Type<T> {
  return type((value: unknown) => (value === undefined ? value : validator(booleanValidator(value))));
}

function date(): Type<Date>;
function date<T extends Date>(validator: Validator<T, Date>): Type<T>;
function date<T extends Date = Date>(validator = identity as Validator<T, Date>): Type<T> {
  return type((value: unknown) => (value === undefined ? value : validator(dateValidator(value))), parser("date"));
}

function union<T extends readonly (string | number | boolean)[]>(values: T): Type<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(...values: T): Type<T[number]>;
function union<T extends readonly (string | number | boolean)[]>(value: T | T[number], ...restValues: T) {
  const values = Array.isArray(value) ? value : [value, ...restValues];

  const stringParser = parser("string");
  const defaultParser = parser();

  return type(
    (value: unknown): T[number] | undefined => {
      if (
        value !== undefined &&
        (!(typeof value === "string" || typeof value === "number" || typeof value === "boolean") ||
          !values.includes(value))
      ) {
        throw new Error(
          `${String(value)} is not assignable to '${values.map((item) => JSON.stringify(item)).join(" | ")}'`,
        );
      }

      return value;
    },
    {
      stringify(value: T[number]): string {
        return typeof value === "string" ? stringParser.stringify(value) : defaultParser.stringify(value);
      },
      parse(value: string): unknown {
        for (const canonicalValue of values) {
          try {
            if (
              canonicalValue ===
              (typeof canonicalValue === "string" ? stringParser.parse(value) : defaultParser.parse(value))
            ) {
              return canonicalValue;
            }
          } catch {
            // Try next value
          }
        }

        throw new Error(
          `${String(value)} is not assignable to '${values.map((item) => JSON.stringify(item)).join(" | ")}'`,
        );
      },
    },
  );
}

function stringValidator(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`${String(value)} is not assignable to 'string'`);
  }

  return value;
}

function numberValidator(value: unknown): number {
  if (typeof value !== "number") {
    throw new Error(`${String(value)} is not assignable to 'number'`);
  }

  if (Number.isNaN(value)) {
    throw new Error(`Unexpected NaN`);
  }

  return value;
}

function booleanValidator(value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${String(value)} is not assignable to 'boolean'`);
  }

  return value;
}

function dateValidator(value: unknown): Date {
  if (!(value instanceof Date)) {
    throw new Error(`${String(value)} is not assignable to 'Date'`);
  }

  if (typeof value !== "undefined" && Number.isNaN(value.getTime())) {
    throw new Error("Unexpected Invalid Date");
  }

  return value;
}

function identity<T>(value: T): T {
  return value;
}

export { string, number, boolean, date, union };
