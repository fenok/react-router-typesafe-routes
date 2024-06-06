import { parser as defaultParser, Parser } from "./parser.js";

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

function type<T>(validator: Validator<T>, parser: Parser<Exclude<T, undefined>> = defaultParser()): Type<T> {
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

export { type, Type, DefType, Validator, PathnameType, SearchType, StateType, HashType };
