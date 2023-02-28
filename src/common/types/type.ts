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

type UniversalType<TOut, TIn = TOut> = ParamType<TOut, TIn> & SearchParamType<TOut, TIn> & StateParamType<TOut, TIn>;

type SmartType<TOut> = UniversalType<TOut | undefined, TOut> & {
    required: (fallback?: TOut) => UniversalType<TOut, TOut> & {
        array: () => UniversalType<TOut[] | undefined, TOut[]> & {
            required: (fallback?: TOut[]) => UniversalType<TOut[], TOut[]>;
        };
    };
    array: () => UniversalType<(TOut | undefined)[] | undefined, TOut[]> & {
        required: (fallback?: (TOut | undefined)[]) => UniversalType<(TOut | undefined)[], TOut[]>;
    };
};

interface Parser<T> {
    stringify: (value: T) => string;
    parse: (value: string) => unknown;
}

interface Validator<T> {
    (value: unknown): T;
}

interface IncompleteUniversalTypeInit<TOut, TIn = TOut> {
    validate: Validator<TOut>;
    parser?: Parser<TIn>;
}

type UniversalTypeInit<TOut, TIn = TOut> = Required<IncompleteUniversalTypeInit<TOut, TIn>>;

type ThrowableFallback = { __brand: "throwable" };

type Fallback<T> = T | ThrowableFallback | undefined;

export {
    ParamType,
    SearchParamType,
    StateParamType,
    UniversalType,
    SmartType,
    UniversalTypeInit,
    IncompleteUniversalTypeInit,
    Parser,
    Validator,
    ThrowableFallback,
    Fallback,
};
