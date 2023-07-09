import { parser as defaultParser, Parser } from "./parser.js";

interface ParamType<TOut, TIn = TOut> {
    getPlainParam: (originalValue: Exclude<TIn, undefined>) => string;
    getTypedParam: (plainValue: string | undefined) => TOut;
}

interface SearchParamType<TOut, TIn = TOut> {
    getPlainSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
    getTypedSearchParam: (plainValue: string[]) => TOut;
}

interface StateParamType<TOut, TIn = TOut> {
    getPlainStateParam: (originalValue: Exclude<TIn, undefined>) => unknown;
    getTypedStateParam: (plainValue: unknown) => TOut;
}

interface HashType<TOut, TIn = TOut> {
    getPlainHash: (originalValue: Exclude<TIn, undefined>) => string;
    getTypedHash: (plainValue: string) => TOut;
}

type AnyType<TOut, TIn = TOut> = ParamType<TOut, TIn> &
    SearchParamType<TOut, TIn> &
    StateParamType<TOut, TIn> &
    HashType<TOut, TIn>;

type ArrayType<TOut> = SearchParamType<TOut[]> & StateParamType<TOut[]>;

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
    const getPlainParam = (value: Exclude<T, undefined>) => parser.stringify(value);
    const getTypedParam = (value: string | undefined) =>
        validator(typeof value === "undefined" ? value : parser.parse(value));
    const getPlainSearchParam = (value: Exclude<T, undefined>) => parser.stringify(value);
    const getTypedSearchParam = (value: string[]) =>
        validator(typeof value[0] === "undefined" ? value[0] : parser.parse(value[0]));
    const getPlainStateParam = (value: T) => value;
    const getTypedStateParam = (value: unknown) => validator(value);
    const getPlainHash = (value: Exclude<T, undefined>) => parser.stringify(value);
    const getTypedHash = (value: string | undefined) =>
        validator(typeof value === "undefined" ? value : parser.parse(value));

    return Object.assign(
        {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
        {
            getPlainParam,
            getTypedParam: ensureNoError(getTypedParam),
            getPlainSearchParam,
            getTypedSearchParam: ensureNoError(getTypedSearchParam),
            getPlainStateParam,
            getTypedStateParam: ensureNoError(getTypedStateParam),
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
                        getPlainStateParam,
                        getTypedStateParam: ensureNoUndefined(ensureNoError(getTypedStateParam), validDef),
                        getPlainHash,
                        getTypedHash: ensureNoUndefined(ensureNoError(getTypedHash), validDef),
                    },
                    {
                        array: getArrayParamTypeBuilder(ensureNoUndefined(ensureNoError(validator), validDef), {
                            stringify: parser.stringify,
                            parse: ensureNoUndefined(ensureNoError(parser.parse), validDef),
                        }),
                    }
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
                        getPlainStateParam,
                        getTypedStateParam: ensureNoUndefined(getTypedStateParam),
                        getPlainHash,
                        getTypedHash: ensureNoUndefined(getTypedHash),
                    },
                    {
                        array: getArrayParamTypeBuilder(ensureNoUndefined(validator), {
                            stringify: parser.stringify,
                            parse: ensureNoUndefined(parser.parse),
                        }),
                    }
                );
            },
        }
    );
}

const getArrayParamTypeBuilder =
    <T>(validator: Validator<T>, parser: Parser<Exclude<T, undefined>>) =>
    (): ArrayType<Exclude<T, undefined>> => {
        const getPlainSearchParam = (values: T[]) => values.filter(isDefined).map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) =>
            values.map((item) => validator(parser.parse(item))).filter(isDefined);
        const getPlainStateParam = (values: T[]) => values;
        const getTypedStateParam = (values: unknown) =>
            (Array.isArray(values) ? values : []).map((item) => validator(item)).filter(isDefined);

        return {
            getPlainSearchParam,
            getTypedSearchParam,
            getPlainStateParam,
            getTypedStateParam,
        };
    };

function isDefined<T>(value: T): value is Exclude<T, undefined> {
    return typeof value !== "undefined";
}

function ensureNoError<TFn extends (...args: never[]) => unknown, TDefault>(
    fn: TFn
): (...args: Parameters<TFn>) => ReturnType<TFn> | undefined {
    return (...args: Parameters<TFn>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return fn(...args) as ReturnType<TFn>;
        } catch (error) {
            return undefined;
        }
    };
}

function ensureNoUndefined<TFn extends (...args: never[]) => unknown>(
    fn: TFn,
    def?: Exclude<ReturnType<TFn>, undefined>
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
    return (...args: Parameters<TFn>) => {
        const result = fn(...args);

        if (result === undefined) {
            if (def === undefined) {
                throw new Error("Unexpected undefined");
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return def;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

export { type, Type, DefType, Validator, ParamType, SearchParamType, StateParamType, HashType };
