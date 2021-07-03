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
