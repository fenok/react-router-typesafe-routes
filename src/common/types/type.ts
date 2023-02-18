interface Type<TOriginal, TPlain = string, TRetrieved = TOriginal> {
    getPlain: (originalValue: TOriginal) => TPlain;
    getTyped: (plainValue: unknown) => TRetrieved;
    isArray?: boolean;
}

interface CallableType<TOriginal, TPlain = string, TRetrieved = TOriginal>
    extends Type<TOriginal, TPlain, TRetrieved | undefined> {
    (fallback: TOriginal | ThrowableFallback): Type<TOriginal, TPlain, TRetrieved>;
}

type ThrowableFallback = { __brand: "throwable" };

type OriginalParams<TTypes> = Params<TTypes, true>;
type RetrievedParams<TTypes> = Params<TTypes>;

type Params<TTypes, TUseOriginal extends boolean = false> = {
    [TKey in keyof TTypes]: TypeValue<TTypes[TKey], TUseOriginal>;
};

type TypeValue<T, TUseOriginal extends boolean> = T extends Type<infer TOriginal, unknown, infer TRetrieved>
    ? TUseOriginal extends true
        ? TOriginal
        : TRetrieved
    : never;

export { Type, CallableType, OriginalParams, RetrievedParams, ThrowableFallback };
