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
    required: (fallback?: TOut) => AnyParamType<Exclude<TOut, undefined>, Exclude<TOut, undefined>> & {
        array: () => UniversalArrayType<Exclude<TOut, undefined>, Exclude<TOut, undefined>>;
    };
};

type UniversalArrayType<TOut, TIn = TOut> = ArrayParamType<TOut[] | undefined, TIn[]> & {
    required: (fallback?: TOut[]) => ArrayParamType<TOut[], TIn[]>;
};

type UniversalTypeInit<TOut, TIn = TOut> = Required<IncompleteUniversalTypeInit<TOut, TIn>>;

interface IncompleteUniversalTypeInit<TOut, TIn = TOut> {
    validator: Validator<TOut>;
    parser?: Parser<TIn>;
}

interface Validator<T, TPrev = unknown> {
    (value: TPrev): T;
}

function type<T>(init: IncompleteUniversalTypeInit<T> | Validator<T>): UniversalType<T> {
    const completeInit = {
        parser: defaultParser("unknown"),
        ...(typeof init === "function" ? { validator: init } : init),
    };

    const { parser, validator } = completeInit;

    const getPlainParam = (value: T) => parser.stringify(value);
    const getTypedParam = (value: string | undefined) => validator(parser.parse(stringValidator(value)));
    const getPlainSearchParam = (value: T) => parser.stringify(value);
    const getTypedSearchParam = (value: string[]) => validator(parser.parse(stringValidator(value[0])));
    const getPlainStateParam = (value: T) => value;
    const getTypedStateParam = (value: unknown) => validator(value);

    return Object.assign(
        {
            getPlainParam,
            getTypedParam: ensureNoError(getTypedParam, undefined),
            getPlainSearchParam,
            getTypedSearchParam: ensureNoError(getTypedSearchParam, undefined),
            getPlainStateParam,
            getTypedStateParam: ensureNoError(getTypedStateParam, undefined),
        },
        {
            array: getUniversalArrayType({
                parser: { stringify: parser.stringify, parse: ensureNoError(parser.parse, undefined) },
                validator: ensureNoError(validator, undefined),
            }),
        },
        {
            required: (fallback?: T) => {
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
                getTypedSearchParam: ensureNoError(getTypedSearchParam, undefined),
                getPlainStateParam,
                getTypedStateParam: ensureNoError(getTypedStateParam, undefined),
            },
            {
                required: (fallback?: TOut[]) => {
                    const validFallback = !isDefined(fallback) ? undefined : fallback.map(validator);

                    return {
                        getPlainSearchParam,
                        getTypedSearchParam: isDefined(validFallback)
                            ? ensureNoError(getTypedSearchParam, validFallback)
                            : getTypedSearchParam,
                        getPlainStateParam,
                        getTypedStateParam: isDefined(validFallback)
                            ? ensureNoError(getTypedStateParam, validFallback)
                            : getTypedStateParam,
                    };
                },
            }
        );
    };

function ensureNoError<TFn extends (...args: never[]) => any, TFallback>(
    fn: TFn,
    fallback: TFallback
): (...args: Parameters<TFn>) => ReturnType<TFn> | TFallback {
    return (...args: Parameters<TFn>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return fn(...args);
        } catch (error) {
            return fallback;
        }
    };
}

function ensureNoUndefined<TFn extends (...args: never[]) => any>(
    fn: TFn,
    fallback?: ReturnType<TFn>
): (...args: Parameters<TFn>) => Exclude<ReturnType<TFn>, undefined> {
    return (...args: Parameters<TFn>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result = fn(...args);

            if (result === undefined) {
                throw new Error("Unexpected undefined in required type");
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        } catch (error) {
            if (fallback !== undefined) {
                return fallback;
            }

            throw error;
        }
    };
}

function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

export { type, UniversalType, Validator, ParamType, SearchParamType, StateParamType };
