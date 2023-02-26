import {
    ThrowableFallback,
    UniversalType,
    Validator,
    Parser,
    UniversalTypeWithArray,
    UniversalTypeInit,
    Fallback,
    IncompleteUniversalTypeInit,
} from "./type.js";
import { assertIsString, assertIsArray } from "./helpers.js";

const throwable = {} as ThrowableFallback;

function type<T, TFallback extends Fallback<T>>(
    init: IncompleteUniversalTypeInit<T> | Validator<T>,
    fallback?: TFallback
): UniversalTypeWithArray<TFallback extends undefined ? T | undefined : T, T> {
    const completeInit = { parser: JSON, ...(typeof init === "function" ? { validate: init } : init) };

    const { parser, validate } = completeInit;

    return universalType<T, T>(
        {
            getPlainParam(value: T) {
                return parser.stringify(value);
            },
            getPlainSearchParam(value: T) {
                return parser.stringify(value);
            },
            getPlainStateParam(value: T) {
                return value;
            },
            getTypedParam(value: string | undefined) {
                assertIsString(value);

                return validate(parser.parse(value));
            },
            getTypedSearchParam(value: string[]) {
                const item = value[0];

                assertIsString(item);

                return validate(parser.parse(item));
            },
            getTypedStateParam(value: unknown) {
                return validate(value);
            },
        },
        fallback,
        { parser, validate }
    );
}

function universalType<TOut, TIn = TOut>(
    type: UniversalType<TOut, TIn>,
    fallback: Fallback<TIn>
): UniversalType<TOut, TIn>;
function universalType<TOut, TIn = TOut>(
    type: UniversalType<TOut, TIn>,
    fallback: Fallback<TOut>,
    options: UniversalTypeInit<TOut>
): UniversalTypeWithArray<TOut, TOut>;
function universalType(
    {
        getPlainParam,
        getPlainSearchParam,
        getPlainStateParam,
        getTypedParam,
        getTypedSearchParam,
        getTypedStateParam,
    }: UniversalType<unknown, unknown>,
    fallback: unknown | ThrowableFallback | undefined,
    options?: UniversalTypeInit<unknown>
) {
    const validParamFallback =
        fallback !== undefined
            ? !isThrowable(fallback)
                ? getTypedParam(getPlainParam(fallback))
                : fallback
            : undefined;
    const validSearchParamFallback =
        fallback !== undefined
            ? !isThrowable(fallback)
                ? getTypedSearchParam(normalizePlainSearchParam(getPlainSearchParam(fallback)))
                : fallback
            : undefined;
    const validStateFieldFallback =
        fallback !== undefined
            ? !isThrowable(fallback)
                ? getTypedStateParam(getPlainStateParam(fallback))
                : fallback
            : undefined;

    const validInitFallback = options
        ? fallback !== undefined
            ? !isThrowable(fallback)
                ? options.validate(options.parser.parse(options.parser.stringify(fallback)))
                : fallback
            : undefined
        : undefined;

    return Object.assign(
        {
            getPlainParam,
            getPlainSearchParam,
            getPlainStateParam,
            getTypedParam: applyFallback(getTypedParam, validParamFallback),
            getTypedSearchParam: applyFallback(getTypedSearchParam, validSearchParamFallback),
            getTypedStateParam: applyFallback(getTypedStateParam, validStateFieldFallback),
        },
        options
            ? {
                  array: getUniversalArrayType({
                      parser: {
                          stringify: options.parser.stringify,
                          parse: applyFallback(options.parser.parse, validInitFallback),
                      },
                      validator: applyFallback(options.validate, validInitFallback),
                  }),
              }
            : undefined
    );
}

const getUniversalArrayType = <TOut, TIn>({
    parser,
    validator,
}: {
    parser: Parser<TIn>;
    validator: Validator<TOut>;
}): ((fallback?: Fallback<TIn[]>) => UniversalType<TOut[], TIn[]>) => {
    return (fallback: Fallback<TIn[]>) =>
        universalType<TOut[], TIn[]>(
            {
                getPlainParam(values: TIn[]) {
                    return JSON.stringify(values.map((value) => parser.stringify(value)));
                },
                getPlainSearchParam(values: TIn[]) {
                    return values.map((value) => parser.stringify(value));
                },
                getPlainStateParam(values: TIn[]) {
                    return values;
                },
                getTypedParam(value: string | undefined) {
                    assertIsString(value);

                    const values: unknown = JSON.parse(value);
                    assertIsArray(values);

                    return values.map((item) => {
                        assertIsString(item);
                        return validator(parser.parse(item));
                    });
                },
                getTypedSearchParam(values: string[]) {
                    return values.map((item) => {
                        return validator(parser.parse(item));
                    });
                },
                getTypedStateParam(values: unknown) {
                    assertIsArray(values);

                    return values.map((item) => {
                        return validator(item);
                    });
                },
            },
            fallback
        );
};

function applyFallback<TFn extends (...args: never[]) => unknown>(fn: TFn, fallback: Fallback<ReturnType<TFn>>) {
    return (...args: Parameters<TFn>) => {
        try {
            return fn(...args);
        } catch (error) {
            if (!isThrowable(fallback)) {
                return fallback;
            }

            throw error;
        }
    };
}

function isThrowable(fallback: unknown): fallback is ThrowableFallback {
    return fallback === throwable;
}

function normalizePlainSearchParam(param: string | string[]): string[] {
    return typeof param === "string" ? [param] : param;
}

export { type, throwable };
