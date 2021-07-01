export interface Transformer<TOriginal, TStored = string, TRetrieved = TOriginal> {
    store(value: TOriginal): TStored;
    retrieve(value: unknown): TRetrieved;
}

export type Optional<T extends Transformer<unknown, unknown, unknown>> = T extends Transformer<
    infer TOriginal,
    infer TStored,
    infer TRetrieved
>
    ? T & { optional: Transformer<TOriginal | undefined, TStored | undefined, TRetrieved | undefined> }
    : never;

export type Params<TTransformers, TUseOriginal extends boolean = false> = {
    [TKey in keyof TTransformers]?: TTransformers[TKey] extends Transformer<infer TOriginal, unknown, infer TRetrieved>
        ? TUseOriginal extends true
            ? TOriginal
            : TRetrieved
        : never;
} &
    {
        [TKey in RequiredKeys<TTransformers>]: TTransformers[TKey] extends Transformer<
            infer TOriginal,
            unknown,
            infer TRetrieved
        >
            ? TUseOriginal extends true
                ? TOriginal
                : TRetrieved
            : never;
    };

type RequiredKeys<T> = {
    [TKey in keyof T]: T[TKey] extends Transformer<infer TType, unknown, unknown>
        ? undefined extends TType
            ? never
            : TKey
        : never;
}[keyof T];
