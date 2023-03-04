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

type SimpleType<TOut> = UniversalType<TOut | undefined, TOut> & {
    array: () => SimpleArrayType<TOut | undefined, TOut>;
} & {
    required: (fallback?: TOut) => UniversalType<Exclude<TOut, undefined>, TOut> & {
        array: () => SimpleArrayType<Exclude<TOut, undefined>, TOut>;
    };
};

type SimpleArrayType<TOut, TIn = TOut> = UniversalType<TOut[] | undefined, TIn[]> & {
    required: (fallback?: TOut[]) => UniversalType<TOut[], TIn[]>;
};

interface Parser<T> {
    stringify: (value: T) => string;
    parse: (value: string) => unknown;
}

interface Validator<T> {
    (value: unknown): T;
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
    UniversalType,
    SimpleType,
    SimpleArrayType,
    UniversalTypeInit,
    IncompleteUniversalTypeInit,
    Parser,
    Validator,
};
