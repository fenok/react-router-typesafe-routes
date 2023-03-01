/** @deprecated */
interface Type<TOriginal, TPlain = string, TRetrieved = TOriginal> {
    getPlain: (originalValue: TOriginal) => TPlain;
    getTyped: (plainValue: unknown) => TRetrieved;
    isArray?: boolean;
}

/** @deprecated */
type ThrowableFallback = { __brand: "throwable" };

/** @deprecated */
interface CallableType<TOriginal, TPlain = string, TRetrieved = TOriginal> extends Type<TOriginal, TPlain, TRetrieved> {
    (fallback: TOriginal | ThrowableFallback): Type<TOriginal, TPlain, TRetrieved> & { __brand: "withFallback" };
}

/** @deprecated */
type OriginalParams<TTypes> = Params<TTypes, true>;
/** @deprecated */
type RetrievedParams<TTypes> = Params<TTypes>;

/** @deprecated */
type KeysWithFallback<T> = {
    [TKey in keyof T]: KeyWithFallback<T[TKey], TKey>;
}[keyof T];

/** @deprecated */
type KeyWithFallback<T, K> = T extends { __brand: "withFallback" } ? K : never;

/** @deprecated */
type Params<TTypes, TUseOriginal extends boolean = false> = {
    [TKey in keyof TTypes]: TypeValue<TTypes[TKey], TUseOriginal>;
};

/** @deprecated */
type TypeValue<T, TUseOriginal extends boolean> = T extends Type<infer TOriginal, unknown, infer TRetrieved>
    ? TUseOriginal extends true
        ? TOriginal
        : TRetrieved
    : never;

export { Type, CallableType, OriginalParams, RetrievedParams, KeysWithFallback, ThrowableFallback };
