import { Validator, UniversalTypeInit, IncompleteUniversalTypeInit, SimpleType, SimpleArrayType } from "./type.js";
import { validateString, validateArray } from "./helpers.js";
import { defaultParser, stringArrayParser } from "./parsers.js";

function type<T>(init: IncompleteUniversalTypeInit<T> | Validator<T>): SimpleType<T> {
    const completeInit = { parser: defaultParser, ...(typeof init === "function" ? { validate: init } : init) };

    const { parser, validate } = completeInit;

    const getPlainParam = (value: T) => parser.stringify(value);
    const getTypedParam = (value: string | undefined) => validate(parser.parse(validateString(value)));
    const getPlainSearchParam = (value: T) => parser.stringify(value);
    const getTypedSearchParam = (value: string[]) => validate(parser.parse(validateString(value[0])));
    const getPlainStateParam = (value: T) => value;
    const getTypedStateParam = (value: unknown) => validate(value);

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
                validate: ensureNoError(validate, undefined),
            }),
        },
        {
            required: (fallback?: T) => {
                const validFallback = !isDefined(fallback) ? undefined : validate(fallback);

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
                            validate: ensureNoUndefined(validate, validFallback),
                        }),
                    }
                );
            },
        }
    );
}

const getUniversalArrayType =
    <TOut, TIn>({ parser, validate }: UniversalTypeInit<TOut, TIn>) =>
    (): SimpleArrayType<TOut, TIn> => {
        const getPlainParam = (values: TIn[]) =>
            stringArrayParser.stringify(values.map((value) => parser.stringify(value)));
        const getTypedParam = (value: string | undefined) =>
            validateArray(stringArrayParser.parse(validateString(value))).map((item) =>
                validate(parser.parse(validateString(item)))
            );
        const getPlainSearchParam = (values: TIn[]) => values.map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) => values.map((item) => validate(parser.parse(item)));
        const getPlainStateParam = (values: TIn[]) => values;
        const getTypedStateParam = (values: unknown) => validateArray(values).map((item) => validate(item));

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
                required: (fallback?: TOut[]) => {
                    const validFallback = !isDefined(fallback) ? undefined : fallback.map(validate);

                    return {
                        getPlainParam,
                        getTypedParam: isDefined(validFallback)
                            ? ensureNoError(getTypedParam, validFallback)
                            : getTypedParam,
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

export { type };
