import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { Params, Transformer } from "../transformer";

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
    shape?: null,
    options?: TOptions
    // Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
): QueryProcessor<Record<string, any>, Record<string, QueryParam<TOptions>>>;

export function query<
    TOptions extends QueryOptions & { parseBooleans?: false; parseNumbers?: false },
    TCasters extends Record<string, Transformer<unknown, QueryParam<TOptions> | undefined>>
>(shape: TCasters, options?: TOptions): QueryProcessor<Params<TCasters, true>, Partial<Params<TCasters>>>;

export function query(
    shape?: null | Record<string, Transformer<unknown, QueryParam | undefined>>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, unknown>, Record<string, unknown>> {
    function retrieve(object: Record<string, QueryParam>) {
        if (shape) {
            const result: Record<string, unknown> = {};

            Object.keys(shape).forEach((key) => {
                try {
                    const value = shape[key].retrieve(object[key]);

                    if (value !== undefined) {
                        result[key] = value;
                    }
                } catch {
                    // Casting failed, but that's okay, we just omit this field
                }
            });

            return result;
        } else {
            return object;
        }
    }

    function store(object: Record<string, unknown>) {
        if (shape) {
            const result: Record<string, QueryParam | undefined> = {};

            Object.keys(shape).forEach((key) => {
                result[key] = shape[key].store(object[key]);
            });

            return result;
        } else {
            return object;
        }
    }

    return {
        stringify(query: Record<string, unknown>): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(store(query), options)}` : "";
        },
        parse(query: string): Record<string, unknown> {
            return retrieve(queryString.parse(query, options));
        },
    };
}
