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

interface Parser<T> {
    stringify: (value: T) => string;
    parse: (value: string) => unknown;
}

interface Validator<T, TPrev = unknown> {
    (value: TPrev): T;
}

interface IncompleteUniversalTypeInit<TOut, TIn = TOut> {
    validator: Validator<TOut>;
    parser?: Parser<TIn>;
}

type UniversalTypeInit<TOut, TIn = TOut> = Required<IncompleteUniversalTypeInit<TOut, TIn>>;

export {
    ParamType,
    SearchParamType,
    StateParamType,
    AnyParamType,
    UniversalType,
    UniversalArrayType,
    UniversalTypeInit,
    IncompleteUniversalTypeInit,
    Parser,
    Validator,
};
