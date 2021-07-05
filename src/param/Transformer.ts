export interface Transformer<TOriginal, TStored = string, TRetrieved = TOriginal> {
    store(value: TOriginal): TStored;
    retrieve(value: unknown): TRetrieved;
}

export type OptionalTransformer<TOriginal, TStored = string, TRetrieved = TOriginal> = Transformer<
    TOriginal | undefined,
    TStored | undefined,
    TRetrieved | undefined
>;

export type OptionalTransformerWithDefault<TOriginal, TStored = string, TRetrieved = TOriginal> = Transformer<
    TOriginal | undefined,
    TStored | undefined,
    TRetrieved
>;

export type Optional<T extends Transformer<unknown, unknown, unknown>> = T extends Transformer<
    infer TOriginal,
    infer TStored,
    infer TRetrieved
>
    ? T & {
          optional: OptionalTransformer<TOriginal, TStored, TRetrieved> & {
              (defaultValue: TRetrieved): OptionalTransformerWithDefault<TOriginal, TStored, TRetrieved>;
          };
      }
    : never;
