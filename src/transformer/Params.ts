import { Transformer } from "./Transformer";

export type Params<
    TTransformers extends Record<string, Transformer<unknown, unknown, unknown>>,
    TUseOriginal extends boolean = false
> = {
    [TKey in keyof TTransformers]?: TransformerType<TTransformers[TKey], TUseOriginal>;
} &
    {
        [TKey in RequiredKeys<TTransformers>]: TransformerType<TTransformers[TKey], TUseOriginal>;
    };

type TransformerType<
    T extends Transformer<unknown, unknown, unknown>,
    TUseOriginal extends boolean
> = T extends Transformer<infer TOriginal, unknown, infer TRetrieved>
    ? TUseOriginal extends true
        ? TOriginal
        : TRetrieved
    : never;

type RequiredKeys<T> = {
    [TKey in keyof T]: T[TKey] extends Transformer<infer TType, unknown, unknown>
        ? undefined extends TType
            ? never
            : TKey
        : never;
}[keyof T];
