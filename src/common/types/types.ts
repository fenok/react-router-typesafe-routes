import { parser, Parser } from "./parser.js";

interface PathnameType<TOut, TIn = TOut> {
  getPlainParam: (originalValue: Exclude<TIn, undefined>) => string;
  getTypedParam: (plainValue: string | undefined) => TOut;
}

interface SearchType<TOut, TIn = TOut> {
  getPlainSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
  getTypedSearchParam: (plainValue: string[]) => TOut;
}

interface StateType<TOut, TIn = TOut> {
  getPlainState: (originalValue: Exclude<TIn, undefined>) => unknown;
  getTypedState: (plainValue: unknown) => TOut;
}

interface HashType<TOut, TIn = TOut> {
  getPlainHash: (originalValue: Exclude<TIn, undefined>) => string;
  getTypedHash: (plainValue: string) => TOut;
}

type AnyType<TOut, TIn = TOut> = PathnameType<TOut, TIn> &
  SearchType<TOut, TIn> &
  StateType<TOut, TIn> &
  HashType<TOut, TIn>;

type ArrayType<TOut> = SearchType<TOut[]> & StateType<TOut[]>;

type Type<TOut> = DefType<TOut | undefined> & {
  default: (def: Exclude<TOut, undefined>) => DefType<Exclude<TOut, undefined>>;
  defined: () => DefType<Exclude<TOut, undefined>>;
};

type DefType<TOut> = AnyType<TOut, Exclude<TOut, undefined>> & {
  array: () => ArrayType<Exclude<TOut, undefined>>;
};

interface Validator<T, TPrev = unknown> {
  (value: TPrev): T | undefined;
}

interface ConfigureOptions {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  parserFactory: (hint?: "string" | "number" | "boolean" | "date") => Parser<any, "string" | "number" | "boolean">;
}

interface CreateTypeOptions {
  parserFactory: () => Parser<unknown>;
}

interface EnumLike {
  [s: string]: string | number;
  [n: number]: string;
}

function configure({ parserFactory }: ConfigureOptions) {
  const type = createType({ parserFactory: parserFactory });

  function string(parser?: Parser<string>): Type<string>;
  function string<T extends string>(validator: Validator<T, string>, parser?: Parser<Exclude<T, undefined>>): Type<T>;
  function string<T extends string = string>(
    arg1?: Validator<T, string> | Parser<Exclude<T, undefined>>,
    arg2?: Parser<Exclude<T, undefined>>,
  ): Type<T> {
    const resolvedValidator = typeof arg1 === "function" ? arg1 : (identity as Validator<T, string>);
    const resolvedParser = typeof arg1 === "function" ? arg2 : arg1;

    return type(
      (value: unknown) => (value === undefined ? value : resolvedValidator(stringValidator(value))),
      resolvedParser ?? parserFactory("string"),
    );
  }

  function number(parser?: Parser<number>): Type<number>;
  function number<T extends number>(validator: Validator<T, number>, parser?: Parser<Exclude<T, undefined>>): Type<T>;
  function number<T extends number = number>(
    arg1?: Validator<T, number> | Parser<Exclude<T, undefined>>,
    arg2?: Parser<Exclude<T, undefined>>,
  ): Type<T> {
    const resolvedValidator = typeof arg1 === "function" ? arg1 : (identity as Validator<T, number>);
    const resolvedParser = typeof arg1 === "function" ? arg2 : arg1;

    return type(
      (value: unknown) => (value === undefined ? value : resolvedValidator(numberValidator(value))),
      resolvedParser ?? parserFactory("number"),
    );
  }

  function boolean(parser?: Parser<boolean>): Type<boolean>;
  function boolean<T extends boolean>(
    validator: Validator<T, boolean>,
    parser?: Parser<Exclude<T, undefined>>,
  ): Type<T>;
  function boolean<T extends boolean = boolean>(
    arg1?: Validator<T, boolean> | Parser<Exclude<T, undefined>>,
    arg2?: Parser<Exclude<T, undefined>>,
  ): Type<T> {
    const resolvedValidator = typeof arg1 === "function" ? arg1 : (identity as Validator<T, boolean>);
    const resolvedParser = typeof arg1 === "function" ? arg2 : arg1;

    return type(
      (value: unknown) => (value === undefined ? value : resolvedValidator(booleanValidator(value))),
      resolvedParser ?? parserFactory("boolean"),
    );
  }

  function date(parser?: Parser<Date>): Type<Date>;
  function date<T extends Date>(validator: Validator<T, Date>, parser?: Parser<Exclude<T, undefined>>): Type<T>;
  function date<T extends Date = Date>(
    arg1?: Validator<T, Date> | Parser<Exclude<T, undefined>>,
    arg2?: Parser<Exclude<T, undefined>>,
  ): Type<T> {
    const resolvedValidator = typeof arg1 === "function" ? arg1 : (identity as Validator<T, Date>);
    const resolvedParser = typeof arg1 === "function" ? arg2 : arg1;

    return type(
      (value: unknown) => (value === undefined ? value : resolvedValidator(dateValidator(value))),
      resolvedParser ?? parserFactory("date"),
    );
  }

  function union<U extends string | number | boolean, T extends readonly U[]>(
    values: T,
    parser?: Parser<T[number], "string" | "number" | "boolean">,
  ): Type<T[number]>;
  function union<T extends EnumLike>(
    values: T,
    parser?: Parser<T[keyof T], "string" | "number" | "boolean">,
  ): Type<T[keyof T]>;
  function union<T extends readonly (string | number | boolean)[] | EnumLike>(
    value: T,
    parser?: Parser<T[keyof T], "string" | "number" | "boolean">,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const values: T[number][] = Array.isArray(value) ? value : getEnumValues(value as EnumLike);

    const defaultParser = parser ?? parserFactory();

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
        stringify(value: T[number], context): string {
          return defaultParser.stringify(value, { ...context, hint: typeof value as "string" | "number" | "boolean" });
        },
        parse(value: string, context): unknown {
          for (const canonicalValue of values) {
            try {
              if (
                canonicalValue ===
                defaultParser.parse(value, {
                  ...context,
                  hint: typeof canonicalValue as "string" | "number" | "boolean",
                })
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

  return {
    type,
    string,
    number,
    boolean,
    date,
    union,
  };
}

function createType({ parserFactory }: CreateTypeOptions) {
  return function type<T>(validator: Validator<T>, parser: Parser<Exclude<T, undefined>> = parserFactory()): Type<T> {
    const getPlainParam = (value: Exclude<T, undefined>) => parser.stringify(value, { kind: "pathname" });
    const getTypedParam = (value: string | undefined) =>
      validator(typeof value === "undefined" ? value : parser.parse(value, { kind: "pathname" }));
    const getPlainSearchParam = (value: Exclude<T, undefined>) => parser.stringify(value, { kind: "search" });
    const getTypedSearchParam = (value: string[]) =>
      validator(typeof value[0] === "undefined" ? value[0] : parser.parse(value[0], { kind: "search" }));
    const getPlainState = (value: T) => value;
    const getTypedState = (value: unknown) => validator(value);
    const getPlainHash = (value: Exclude<T, undefined>) => parser.stringify(value, { kind: "hash" });
    const getTypedHash = (value: string | undefined) =>
      validator(typeof value === "undefined" ? value : parser.parse(value, { kind: "hash" }));

    return Object.assign(
      {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
      {
        getPlainParam,
        getTypedParam: ensureNoError(getTypedParam),
        getPlainSearchParam,
        getTypedSearchParam: ensureNoError(getTypedSearchParam),
        getPlainState: getPlainState,
        getTypedState: ensureNoError(getTypedState),
        getPlainHash,
        getTypedHash: ensureNoError(getTypedHash),
      },
      {
        array: getArrayParamTypeBuilder(ensureNoError(validator), {
          stringify: parser.stringify,
          parse: ensureNoError(parser.parse),
        }),
      },
      {
        default: (def: Exclude<T, undefined>) => {
          const validDef = validateDef(validator, def);

          return Object.assign(
            {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
            {
              getPlainParam,
              getTypedParam: ensureNoUndefined(ensureNoError(getTypedParam), validDef),
              getPlainSearchParam,
              getTypedSearchParam: ensureNoUndefined(ensureNoError(getTypedSearchParam), validDef),
              getPlainState: getPlainState,
              getTypedState: ensureNoUndefined(ensureNoError(getTypedState), validDef),
              getPlainHash,
              getTypedHash: ensureNoUndefined(ensureNoError(getTypedHash), validDef),
            },
            {
              array: getArrayParamTypeBuilder(ensureNoUndefined(ensureNoError(validator), validDef), {
                stringify: parser.stringify,
                parse: ensureNoUndefined(ensureNoError(parser.parse), validDef),
              }),
            },
          );
        },
        defined: () => {
          return Object.assign(
            {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
            {
              getPlainParam,
              getTypedParam: ensureNoUndefined(getTypedParam),
              getPlainSearchParam,
              getTypedSearchParam: ensureNoUndefined(getTypedSearchParam),
              getPlainState: getPlainState,
              getTypedState: ensureNoUndefined(getTypedState),
              getPlainHash,
              getTypedHash: ensureNoUndefined(getTypedHash),
            },
            {
              array: getArrayParamTypeBuilder(ensureNoUndefined(validator), {
                stringify: parser.stringify,
                parse: ensureNoUndefined(parser.parse),
              }),
            },
          );
        },
      },
    );
  };
}

// TODO: Find a way to preserve <T,> without prettier-ignore
// prettier-ignore
const getArrayParamTypeBuilder =
    <T,>(validator: Validator<T>, parser: Parser<Exclude<T, undefined>, never>) =>
        (): ArrayType<Exclude<T, undefined>> => {
          const getPlainSearchParam = (values: T[]) => values.filter(isDefined).map((value) => parser.stringify(value, {kind: 'search'}));
          const getTypedSearchParam = (values: string[]) =>
              values.map((item) => validator(parser.parse(item, {kind: 'search'}))).filter(isDefined);
          const getPlainState = (values: T[]) => values;
          const getTypedState = (values: unknown) =>
              (Array.isArray(values) ? values : []).map((item) => validator(item)).filter(isDefined);

          return {
            getPlainSearchParam,
            getTypedSearchParam,
            getPlainState: getPlainState,
            getTypedState: getTypedState,
          };
        };

function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return typeof value !== "undefined";
}

function ensureNoError<TFn extends (...args: never[]) => unknown, TDefault>(
  fn: TFn,
): (...args: Parameters<TFn>) => ReturnType<TFn> | undefined {
  return (...args: Parameters<TFn>) => {
    try {
      return fn(...args) as ReturnType<TFn>;
    } catch (error) {
      return undefined;
    }
  };
}

function ensureNoUndefined<TFn extends (...args: never[]) => unknown>(
  fn: TFn,
  def?: Exclude<ReturnType<TFn>, undefined>,
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
  return (...args: Parameters<TFn>) => {
    const result = fn(...args);

    if (result === undefined) {
      if (def === undefined) {
        throw new Error(
          "Can't return 'undefined' for a .defined() param. Use .default() instead. Remember, required pathname params use .defined() by default.",
        );
      }

      return def;
    }

    return result as Exclude<ReturnType<TFn>, undefined>;
  };
}

function validateDef<T>(validator: Validator<T>, def: unknown): Exclude<T, undefined> {
  const validDef = validator(def);

  if (validDef === undefined) {
    throw new Error("Default value validation resulted in 'undefined', which is forbidden");
  }

  return validDef as Exclude<T, undefined>;
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

function getEnumValues(enumObj: EnumLike) {
  return Object.keys(enumObj)
    .filter((key) => typeof enumObj[enumObj[key]] !== "number")
    .map((key) => enumObj[key]);
}

function identity<T>(value: T): T {
  return value;
}

const { type, string, number, boolean, date, union } = configure({ parserFactory: parser });

export {
  configure,
  type,
  string,
  number,
  boolean,
  date,
  union,
  Type,
  DefType,
  Validator,
  PathnameType,
  SearchType,
  StateType,
  HashType,
};
