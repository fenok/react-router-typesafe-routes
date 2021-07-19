export type RoutePart = "path" | "query" | "hash" | "state";

export interface Transformer<TOriginal, TStored = string, TRetrieved = TOriginal> {
    store(value: TOriginal, routePart: RoutePart): TStored;
    retrieve(value: unknown, routePart: RoutePart): TRetrieved;
}

export type OptionalTransformer<TOriginal, TStored = string, TRetrieved = TOriginal> = Transformer<
    TOriginal | undefined,
    TStored | undefined,
    TRetrieved | undefined
> & { __brand: "optional" };

export type OptionalTransformerWithDefault<TOriginal, TStored = string, TRetrieved = TOriginal> = Transformer<
    TOriginal | undefined,
    TStored | undefined,
    TRetrieved
> & { __brand: "optional" };

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
