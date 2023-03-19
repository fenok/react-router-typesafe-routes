import { parser as defaultParser, Parser } from "./parser.js";

interface ParamType<TOut, TIn = TOut> {
    getPlainParam: (originalValue: TIn) => string;
    getTypedParam: (plainValue: string | undefined) => TOut;
}

interface SearchParamType<TOut, TIn = TOut> {
    getPlainSearchParam: (originalValue: TIn) => string[] | string;
    getTypedSearchParam: (plainValue: string[]) => TOut;
}

interface StateParamType<TOut, TIn = TOut> {
    getPlainStateParam: (originalValue: TIn) => unknown;
    getTypedStateParam: (plainValue: unknown) => TOut;
}

type AnyParamType<TOut, TIn = TOut> = ParamType<TOut, TIn> & SearchParamType<TOut, TIn> & StateParamType<TOut, TIn>;

type ArrayParamType<TOut, TIn = TOut> = SearchParamType<TOut, TIn> & StateParamType<TOut, TIn>;

type UniversalType<TOut> = UniversalItemType<TOut | undefined> & {
    default: (fallback: Exclude<TOut, undefined>) => UniversalItemType<Exclude<TOut, undefined>>;
    throw: () => UniversalItemType<TOut> & {
        default: (fallback: Exclude<TOut, undefined>) => UniversalItemType<Exclude<TOut, undefined>>;
    };
};

type UniversalItemType<TOut> = AnyParamType<TOut, Exclude<TOut, undefined>> & {
    array: () => UniversalArrayType<TOut, Exclude<TOut, undefined>>;
};

type UniversalArrayType<TOut, TIn = TOut> = ArrayParamType<TOut[], TIn[]>;

type UniversalTypeInit<TOut, TIn = TOut> = Required<IncompleteUniversalTypeInit<TOut, TIn>>;

interface IncompleteUniversalTypeInit<TOut, TIn = TOut> {
    validator: Validator<TOut>;
    parser?: Parser<TIn>;
}

interface Validator<T, TPrev = unknown> {
    (value: TPrev): T;
}

function type<T>(validator: Validator<T>, parser: Parser<Exclude<T, undefined>> = defaultParser()): UniversalType<T> {
    const getPlainParam = (value: Exclude<T, undefined>) => parser.stringify(value);
    const getTypedParam = (value: string | undefined) =>
        validator(typeof value === "undefined" ? value : parser.parse(value));
    const getPlainSearchParam = (value: Exclude<T, undefined>) => parser.stringify(value);
    const getTypedSearchParam = (value: string[]) =>
        validator(typeof value[0] === "undefined" ? value[0] : parser.parse(value[0]));
    const getPlainStateParam = (value: T) => value;
    const getTypedStateParam = (value: unknown) => validator(value);

    return Object.assign(
        {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
        {
            getPlainParam,
            getTypedParam: ensureNoError(getTypedParam),
            getPlainSearchParam,
            getTypedSearchParam: ensureNoError(getTypedSearchParam),
            getPlainStateParam,
            getTypedStateParam: ensureNoError(getTypedStateParam),
        },
        {
            array: getUniversalArrayType({
                parser: { stringify: parser.stringify, parse: ensureNoError(parser.parse) },
                validator: ensureNoError(validator),
            }),
        },
        {
            default: (fallback: Exclude<T, undefined>) => {
                const validFallback = validateFallback(validator, fallback);

                return Object.assign(
                    {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
                    {
                        getPlainParam,
                        getTypedParam: ensureNoUndefined(ensureNoError(getTypedParam), validFallback),
                        getPlainSearchParam,
                        getTypedSearchParam: ensureNoUndefined(ensureNoError(getTypedSearchParam), validFallback),

                        getPlainStateParam,
                        getTypedStateParam: ensureNoUndefined(ensureNoError(getTypedStateParam), validFallback),
                    },
                    {
                        array: getUniversalArrayType({
                            parser: {
                                stringify: parser.stringify,
                                parse: ensureNoUndefined(ensureNoError(parser.parse), validFallback),
                            },
                            validator: ensureNoUndefined(ensureNoError(validator), validFallback),
                        }),
                    }
                );
            },
            throw: () => {
                return Object.assign(
                    {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
                    {
                        getPlainParam,
                        getTypedParam: getTypedParam,
                        getPlainSearchParam,
                        getTypedSearchParam: getTypedSearchParam,

                        getPlainStateParam,
                        getTypedStateParam: getTypedStateParam,
                    },
                    {
                        array: getUniversalArrayType({
                            parser: {
                                stringify: parser.stringify,
                                parse: parser.parse,
                            },
                            validator: validator,
                        }),
                    },
                    {
                        default: (fallback: Exclude<T, undefined>) => {
                            const validFallback = validateFallback(validator, fallback);

                            return Object.assign(
                                {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
                                {
                                    getPlainParam,
                                    getTypedParam: ensureNoUndefined(getTypedParam, validFallback),
                                    getPlainSearchParam,
                                    getTypedSearchParam: ensureNoUndefined(getTypedSearchParam, validFallback),

                                    getPlainStateParam,
                                    getTypedStateParam: ensureNoUndefined(getTypedStateParam, validFallback),
                                },
                                {
                                    array: getUniversalArrayType({
                                        parser: {
                                            stringify: parser.stringify,
                                            parse: ensureNoUndefined(parser.parse, validFallback),
                                        },
                                        validator: ensureNoUndefined(validator, validFallback),
                                    }),
                                }
                            );
                        },
                    }
                );
            },
        }
    );
}

const getUniversalArrayType =
    <TOut, TIn>({ parser, validator }: UniversalTypeInit<TOut, TIn>) =>
    (): UniversalArrayType<TOut, TIn> => {
        const getPlainSearchParam = (values: TIn[]) => values.map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) => values.map((item) => validator(parser.parse(item)));
        const getPlainStateParam = (values: TIn[]) => values;
        const getTypedStateParam = (values: unknown) =>
            (Array.isArray(values) ? values : []).map((item) => validator(item));

        return Object.assign(
            {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
            {
                getPlainSearchParam,
                getTypedSearchParam: getTypedSearchParam,
                getPlainStateParam,
                getTypedStateParam: getTypedStateParam,
            }
        );
    };

function ensureNoError<TFn extends (...args: never[]) => unknown, TFallback>(
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
    fallback: Exclude<ReturnType<TFn>, undefined>
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
    return (...args: Parameters<TFn>) => {
        const result = fn(...args);

        if (result === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return fallback;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result as Exclude<ReturnType<TFn>, undefined>;
    };
}

function validateFallback<T>(validator: Validator<T>, fallback: unknown): Exclude<T, undefined> {
    const validatedFallback = validator(fallback);

    if (validatedFallback === undefined) {
        throw new Error("Default value validation resulted in 'undefined', which is forbidden");
    }

    return validatedFallback as Exclude<T, undefined>;
}

export { type, UniversalType, Validator, ParamType, SearchParamType, StateParamType };
