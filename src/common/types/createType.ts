import {
    ThrowableFallback,
    UniversalType,
    Validator,
    UniversalTypeWithOptions,
    UniversalTypeInit,
    Fallback,
    IncompleteUniversalTypeInit,
    SmartType,
} from "./type.js";
import { assertIsString, assertIsArray } from "./helpers.js";

const throwable = {} as ThrowableFallback;

function type<T>(init: IncompleteUniversalTypeInit<T> | Validator<T>): SmartType<T>;
function type<T, TFallback extends Fallback<T>>(
    init: IncompleteUniversalTypeInit<T> | Validator<T>,
    fallback?: TFallback
): UniversalTypeWithOptions<TFallback extends undefined ? T | undefined : T, T> {
    const completeInit = { parser: JSON, ...(typeof init === "function" ? { validate: init } : init) };

    const { parser, validate } = completeInit;

    const validFallback = getValidFallback(fallback, validate);

    return Object.assign(
        universalType(
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
            validFallback
        ),
        {
            array: getUniversalArrayType({
                parser: {
                    stringify: parser.stringify,
                    parse: applyFallback(parser.parse, validFallback),
                },
                validate: applyFallback(validate, validFallback),
            }),
        }
    ) as UniversalTypeWithOptions<TFallback extends undefined ? T | undefined : T, T>;
}

function universalType<TOut, TIn, TFallback extends Fallback<TOut>>(
    {
        getPlainParam,
        getPlainSearchParam,
        getPlainStateParam,
        getTypedParam,
        getTypedSearchParam,
        getTypedStateParam,
    }: UniversalType<TOut, TIn>,
    fallback: NoInfer<TFallback>
): UniversalType<TFallback extends undefined ? TOut | undefined : TOut, TIn> {
    return {
        getPlainParam,
        getPlainSearchParam,
        getPlainStateParam,
        getTypedParam: applyFallback(getTypedParam, fallback),
        getTypedSearchParam: applyFallback(getTypedSearchParam, fallback),
        getTypedStateParam: applyFallback(getTypedStateParam, fallback),
    };
}

const getUniversalArrayType =
    <TOut, TIn>({ parser, validate }: UniversalTypeInit<TOut, TIn>) =>
    <TFallback extends Fallback<TOut[]>>(
        fallback: NoInfer<TFallback>
    ): UniversalType<TFallback extends undefined ? TOut[] | undefined : TOut[], TIn[]> => {
        return universalType(
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
                        return validate(parser.parse(item));
                    });
                },
                getTypedSearchParam(values: string[]) {
                    return values.map((item) => {
                        return validate(parser.parse(item));
                    });
                },
                getTypedStateParam(values: unknown) {
                    assertIsArray(values);

                    return values.map((item) => {
                        return validate(item);
                    });
                },
            },
            fallback
        );
    };

function applyFallback<TFn extends (...args: never[]) => any, TFallback extends Fallback<ReturnType<TFn>>>(
    fn: TFn,
    fallback: TFallback
): (...args: Parameters<TFn>) => TFallback extends undefined ? ReturnType<TFn> | undefined : ReturnType<TFn> {
    return (...args: Parameters<TFn>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

export type NoInfer<T> = [T][T extends any ? 0 : never];

function getValidFallback<T, TFallback extends Fallback<T>>(
    fallback: NoInfer<TFallback> | undefined,
    validate: Validator<T>
): TFallback {
    if (fallback !== undefined && !isThrowable(fallback)) {
        return validate(fallback) as TFallback;
    }

    return fallback as TFallback;
}

export { type, throwable };
