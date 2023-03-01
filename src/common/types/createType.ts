import { Validator, UniversalTypeInit, IncompleteUniversalTypeInit, SimpleType, SimpleArrayType } from "./type.js";
import { validateString, validateArray } from "./helpers.js";

function type<T>(init: IncompleteUniversalTypeInit<T> | Validator<T>): SimpleType<T> {
    const completeInit = { parser: JSON, ...(typeof init === "function" ? { validate: init } : init) };

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
            getTypedParam: applyFallback(getTypedParam, undefined),
            getPlainSearchParam,
            getTypedSearchParam: applyFallback(getTypedSearchParam, undefined),
            getPlainStateParam,
            getTypedStateParam: applyFallback(getTypedStateParam, undefined),
        },
        {
            array: getUniversalArrayType({
                parser: { stringify: parser.stringify, parse: applyFallback(parser.parse, undefined) },
                validate: applyFallback(validate, undefined),
            }),
        },
        {
            required: (fallback?: T) => {
                const validFallback = !isDefined(fallback) ? undefined : validate(fallback);

                return Object.assign(
                    {
                        getPlainParam,
                        getTypedParam: isDefined(validFallback)
                            ? applyFallback(getTypedParam, validFallback)
                            : getTypedParam,
                        getPlainSearchParam,
                        getTypedSearchParam: isDefined(validFallback)
                            ? applyFallback(getTypedSearchParam, validFallback)
                            : getTypedSearchParam,
                        getPlainStateParam,
                        getTypedStateParam: isDefined(validFallback)
                            ? applyFallback(getTypedStateParam, validFallback)
                            : getTypedStateParam,
                    },
                    {
                        array: getUniversalArrayType({
                            parser: {
                                stringify: parser.stringify,
                                parse: isDefined(validFallback)
                                    ? applyFallback(parser.parse, validFallback)
                                    : parser.parse,
                            },
                            validate: isDefined(validFallback) ? applyFallback(validate, validFallback) : validate,
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
        const getPlainParam = (values: TIn[]) => JSON.stringify(values.map((value) => parser.stringify(value)));
        const getTypedParam = (value: string | undefined) =>
            validateArray(JSON.parse(validateString(value))).map((item) =>
                validate(parser.parse(validateString(item)))
            );
        const getPlainSearchParam = (values: TIn[]) => values.map((value) => parser.stringify(value));
        const getTypedSearchParam = (values: string[]) => values.map((item) => validate(parser.parse(item)));
        const getPlainStateParam = (values: TIn[]) => values;
        const getTypedStateParam = (values: unknown) => validateArray(values).map((item) => validate(item));

        return Object.assign(
            {
                getPlainParam,
                getTypedParam: applyFallback(getTypedParam, undefined),
                getPlainSearchParam,
                getTypedSearchParam: applyFallback(getTypedSearchParam, undefined),
                getPlainStateParam,
                getTypedStateParam: applyFallback(getTypedStateParam, undefined),
            },
            {
                required: (fallback?: TOut[]) => {
                    const validFallback = !isDefined(fallback) ? undefined : fallback.map(validate);

                    return {
                        getPlainParam,
                        getTypedParam: isDefined(validFallback)
                            ? applyFallback(getTypedParam, validFallback)
                            : getTypedParam,
                        getPlainSearchParam,
                        getTypedSearchParam: isDefined(validFallback)
                            ? applyFallback(getTypedSearchParam, validFallback)
                            : getTypedSearchParam,
                        getPlainStateParam,
                        getTypedStateParam: isDefined(validFallback)
                            ? applyFallback(getTypedStateParam, validFallback)
                            : getTypedStateParam,
                    };
                },
            }
        );
    };

function applyFallback<TFn extends (...args: never[]) => any, TFallback>(
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

function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

export { type };
