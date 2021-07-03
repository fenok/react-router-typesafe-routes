import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./QueryProcessor";
import { Params, Transformer } from "../param";

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
): QueryProcessor<Params<TTransformers, true>, Partial<Params<TTransformers>>>;

export function query(
    transformers?: null | Record<string, Transformer<unknown, QueryParam | undefined>>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, unknown>, Record<string, unknown>> {
    function retrieve(storedParams: Record<string, QueryParam>) {
        if (transformers) {
            const retrievedParams: Record<string, unknown> = {};

            Object.keys(transformers).forEach((key) => {
                try {
                    const value = transformers[key].retrieve(storedParams[key]);

                    if (value !== undefined) {
                        retrievedParams[key] = value;
                    }
                } catch {
                    // Casting failed, but that's okay, we just omit this field
                }
            });

            return retrievedParams;
        } else {
            return storedParams;
        }
    }

    function store(originalParams: Record<string, unknown>) {
        if (transformers) {
            const storedParams: Record<string, QueryParam | undefined> = {};

            Object.keys(transformers).forEach((key) => {
                storedParams[key] = transformers[key].store(originalParams[key]);
            });

            return storedParams;
        } else {
            return originalParams;
        }
    }

    return {
        build(params: Record<string, unknown>): string {
            return params && Object.keys(params).length ? `?${queryString.stringify(store(params), options)}` : "";
        },
        parse(query: string): Record<string, unknown> {
            return retrieve(queryString.parse(query, options));
        },
    };
}
