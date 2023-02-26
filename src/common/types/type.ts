interface ParamType<TOut, TIn = TOut> {
    getPlainParam: (originalValue: TIn) => string;
    getTypedParam: (plainValue: string | undefined) => TOut;
}

interface SearchParamType<TOut, TIn = TOut> {
    getPlainSearchParam: (originalValue: TIn) => string[];
    getTypedSearchParam: (plainValue: string[]) => TOut;
}

interface StateParamType<TOut, TIn = TOut> {
    getPlainStateParam: (originalValue: TIn) => unknown;
    getTypedStateParam: (plainValue: unknown) => TOut;
}

type UniversalType<TOut, TIn = TOut> = ParamType<TOut, TIn> & SearchParamType<TOut, TIn> & StateParamType<TOut, TIn>;

type UniversalTypeWithArray<TOut, TIn = TOut> = UniversalType<TOut, TIn> & {
    array: <TFallback extends Fallback<TIn[]>>(
        fallback?: TFallback
    ) => UniversalType<TFallback extends undefined ? TOut[] | undefined : TOut[], TIn[]>;
};

interface Parser<T> {
    stringify: (value: T) => string;
    parse: (value: string) => unknown;
}

interface Validator<T> {
    (value: unknown): T;
}

interface IncompleteUniversalTypeInit<T> {
    validate: Validator<T>;
    parser?: Parser<T>;
}

type UniversalTypeInit<T> = Required<IncompleteUniversalTypeInit<T>>;

type ThrowableFallback = { __brand: "throwable" };

type Fallback<T> = T | ThrowableFallback | undefined;

export {
    ParamType,
    SearchParamType,
    StateParamType,
    UniversalType,
    UniversalTypeWithArray,
    UniversalTypeInit,
    IncompleteUniversalTypeInit,
    Parser,
    Validator,
    ThrowableFallback,
    Fallback,
};
