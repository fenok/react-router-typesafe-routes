import { stringValidator, arrayValidator } from "./validators.js";
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

type UniversalType<TOut> = AnyParamType<TOut | undefined, Exclude<TOut, undefined>> & {
    array: () => UniversalArrayType<TOut | undefined, Exclude<TOut, undefined>>;
} & {
    defined: (fallback?: TOut) => AnyParamType<Exclude<TOut, undefined>, Exclude<TOut, undefined>> & {
        array: () => UniversalArrayType<Exclude<TOut, undefined>, Exclude<TOut, undefined>>;
    };
};

type UniversalArrayType<TOut, TIn = TOut> = ArrayParamType<TOut[] | undefined, TIn[]> & {
    defined: (fallback?: TOut[]) => ArrayParamType<TOut[], TIn[]>;
};

type UniversalTypeInit<TOut, TIn = TOut> = Required<IncompleteUniversalTypeInit<TOut, TIn>>;

interface IncompleteUniversalTypeInit<TOut, TIn = TOut> {
    validator: Validator<TOut>;
    parser?: Parser<TIn>;
}

interface Validator<T, TPrev = unknown> {
    (value: TPrev): T;
}

function type<T>(validator: Validator<T>, parser: Parser<T> = defaultParser()): UniversalType<T> {
    const getPlainParam = (value: T) => parser.stringify(value);
    const getTypedParam = (value: string | undefined) => validator(parser.parse(stringValidator(value)));
    const getPlainSearchParam = (value: T) => parser.stringify(value);
    const getTypedSearchParam = (value: string[]) => validator(parser.parse(stringValidator(value[0])));
    const getPlainStateParam = (value: T) => value;
    const getTypedStateParam = (value: unknown) => validator(value);

    return Object.assign(
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
            defined: (fallback?: T) => {
                const validFallback = !isDefined(fallback) ? undefined : validator(fallback);

                return Object.assign(
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
}

const getUniversalArrayType =
    <TOut, TIn>({ parser, validator }: UniversalTypeInit<TOut, TIn>) =>
    (): UniversalArrayType<TOut, TIn> => {
        const getPlainSearchParam = (values: TIn[]) => values.map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) => values.map((item) => validator(parser.parse(item)));
        const getPlainStateParam = (values: TIn[]) => values;
        const getTypedStateParam = (values: unknown) => arrayValidator(values).map((item) => validator(item));

        return Object.assign(
            {
                getPlainSearchParam,
                getTypedSearchParam: ensureNoError(getTypedSearchParam),
                getPlainStateParam,
                getTypedStateParam: ensureNoError(getTypedStateParam),
            },
            {
                defined: (fallback?: TOut[]) => {
                    const validFallback = !isDefined(fallback) ? undefined : fallback.map(validator);

                    return {
                        getPlainSearchParam,
                        getTypedSearchParam: ensureNoUndefined(getTypedSearchParam, validFallback),
                        getPlainStateParam,
                        getTypedStateParam: ensureNoUndefined(getTypedStateParam, validFallback),
                    };
                },
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
    fallback: ReturnType<TFn> | undefined
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
    return (...args: Parameters<TFn>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result = fn(...args);

            if (result === undefined) {
                throw new Error("Unexpected undefined in defined type");
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result as Exclude<ReturnType<TFn>, undefined>;
        } catch (error) {
            if (fallback !== undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return fallback as Exclude<ReturnType<TFn>, undefined>;
            }

            throw error;
        }
    };
}

function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

export { type, UniversalType, Validator, ParamType, SearchParamType, StateParamType };
