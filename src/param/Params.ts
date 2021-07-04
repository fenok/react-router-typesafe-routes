import { Transformer } from "./Transformer";

export type OriginalParams<TTransformers extends Record<string, Transformer<unknown, unknown, unknown>>> = Params<
    TTransformers,
    true
>;

export type RetrievedParams<TTransformers extends Record<string, Transformer<unknown, unknown, unknown>>> =
    Params<TTransformers>;

type Params<
    TTransformers extends Record<string, Transformer<unknown, unknown, unknown>>,
    TUseOriginal extends boolean = false
> = {
    [TKey in keyof TTransformers]?: TransformerType<TTransformers[TKey], TUseOriginal>;
} &
    {
        [TKey in RequiredKeys<TTransformers, TUseOriginal>]: TransformerType<TTransformers[TKey], TUseOriginal>;
    };

type TransformerType<
    T extends Transformer<unknown, unknown, unknown>,
    TUseOriginal extends boolean
> = T extends Transformer<infer TOriginal, unknown, infer TRetrieved>
    ? TUseOriginal extends true
        ? TOriginal
        : TRetrieved
    : never;

type RequiredKeys<T, TUseOriginal extends boolean> = {
    [TKey in keyof T]: T[TKey] extends Transformer<infer TOriginal, unknown, infer TRetrieved>
        ? TUseOriginal extends true
            ? RequiredKey<TOriginal, TKey>
            : RequiredKey<TRetrieved, TKey>
        : never;
}[keyof T];

type RequiredKey<T, K> = undefined extends T ? never : K;
