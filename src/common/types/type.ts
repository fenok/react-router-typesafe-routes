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

type UniversalType<TOut> = ConfiguredType<TOut | undefined> & {
    default: (def: Exclude<TOut, undefined>) => ConfiguredType<Exclude<TOut, undefined>>;
    throw: () => ConfiguredType<TOut> & {
        default: (def: Exclude<TOut, undefined>) => ConfiguredType<Exclude<TOut, undefined>>;
    };
};

type ConfiguredType<TOut> = AnyParamType<TOut, Exclude<TOut, undefined>> & {
    array: () => ArrayParamType<TOut[], Exclude<TOut, undefined>[]>;
};

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
                    },
                    {
                        array: getArrayParamTypeBuilder(ensureNoUndefined(ensureNoError(validator), validDef), {
                            stringify: parser.stringify,
                            parse: ensureNoUndefined(ensureNoError(parser.parse), validDef),
                        }),
                    }
                );
            },
            throw: () => {
                return Object.assign(
                    {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
                    {
                        getPlainParam,
                        getTypedParam,
                        getPlainSearchParam,
                        getTypedSearchParam,
                        getPlainStateParam,
                        getTypedStateParam,
                    },
                    {
                        array: getArrayParamTypeBuilder(validator, parser),
                    },
                    {
                        default: (def: Exclude<T, undefined>) => {
                            const validDef = validateDef(validator, def);

                            return Object.assign(
                                {}, // TODO: Remove later. ATM typescript picks the wrong function overload without this.
                                {
                                    getPlainParam,
                                    getTypedParam: ensureNoUndefined(getTypedParam, validDef),
                                    getPlainSearchParam,
                                    getTypedSearchParam: ensureNoUndefined(getTypedSearchParam, validDef),

                                    getPlainStateParam,
                                    getTypedStateParam: ensureNoUndefined(getTypedStateParam, validDef),
                                },
                                {
                                    array: getArrayParamTypeBuilder(ensureNoUndefined(validator, validDef), {
                                        stringify: parser.stringify,
                                        parse: ensureNoUndefined(parser.parse, validDef),
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

const getArrayParamTypeBuilder =
    <TOut, TIn>(validator: Validator<TOut>, parser: Parser<TIn>) =>
    (): ArrayParamType<TOut[], TIn[]> => {
        const getPlainSearchParam = (values: TIn[]) => values.map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) => values.map((item) => validator(parser.parse(item)));
        const getPlainStateParam = (values: TIn[]) => values;
        const getTypedStateParam = (values: unknown) =>
            (Array.isArray(values) ? values : []).map((item) => validator(item));

        return {
            getPlainSearchParam,
            getTypedSearchParam,
            getPlainStateParam,
            getTypedStateParam,
        };
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
    def: Exclude<ReturnType<TFn>, undefined>
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
    return (...args: Parameters<TFn>) => {
        const result = fn(...args);

        if (result === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return def;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result as Exclude<ReturnType<TFn>, undefined>;
    };
}

function validateDef<T>(validator: Validator<T>, def: unknown): Exclude<T, undefined> {
    const validatedFallback = validator(def);

    if (validatedFallback === undefined) {
        throw new Error("Default value validation resulted in 'undefined', which is forbidden");
    }

    return validatedFallback as Exclude<T, undefined>;
}

export { type, UniversalType, Validator, ParamType, SearchParamType, StateParamType };
