import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./QueryProcessor";
import { Params, retrieve, store, Transformer } from "../param";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryParam<TOptions extends QueryOptions = QueryOptions, T = KnownPrimitives<TOptions>> =
    | T
    | null
    | (CanStoreNullInArray<TOptions> extends true ? T | null : T)[];

export type CanStoreNullInArray<TOptions extends QueryOptions> = undefined extends TOptions["arrayFormat"]
    ? true
    : TOptions["arrayFormat"] extends "bracket" | "index" | "none"
    ? true
    : false;

export type KnownPrimitives<TOptions extends QueryOptions> = TOptions["parseBooleans"] extends true
    ? TOptions["parseNumbers"] extends true
        ? string | number | boolean
        : string | boolean
    : TOptions["parseNumbers"] extends true
    ? string | number
    : string;

export function query<TOptions extends QueryOptions>(
    transformers?: null,
    options?: TOptions
    // Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): QueryProcessor<Record<string, any>, Record<string, QueryParam<TOptions>>>;

export function query<
    TOptions extends QueryOptions & { parseBooleans?: false; parseNumbers?: false },
    TTransformers extends Record<string, Transformer<unknown, QueryParam<TOptions> | undefined>>
>(
    transformers: TTransformers,
    options?: TOptions
): QueryProcessor<Params<TTransformers, true>, Params<TTransformers> | undefined>;

export function query(
    transformers?: null | Record<string, Transformer<unknown, QueryParam | undefined>>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, unknown>, Record<string, unknown> | undefined> {
    return {
        build(params: Record<string, unknown>): string {
            return params && Object.keys(params).length
                ? `?${queryString.stringify(transformers ? store(params, transformers) : params, options)}`
                : "";
        },
        parse(query: string): Record<string, unknown> | undefined {
            const rawParams = queryString.parse(query, options);

            return transformers ? retrieve(rawParams, transformers) : rawParams;
        },
    };
}
