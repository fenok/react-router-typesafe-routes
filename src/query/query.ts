import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { Transformer } from "../param";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryTypes<TOptions extends QueryOptions = Record<string, unknown>, T = string | number | boolean> =
    | T
    | null
    | (NullInArray<TOptions> extends true ? T | null : T)[];

export type QueryParams<TCasters, TIn extends boolean = false> = {
    [Key in keyof TCasters]?: TCasters[Key] extends Transformer<infer TOriginal, any, infer TRetrieved>
        ? TIn extends true
            ? TOriginal
            : TRetrieved
        : never;
};

export type KnownTypes<TOptions extends QueryOptions> = TOptions["parseBooleans"] extends true
    ? TOptions["parseNumbers"] extends true
        ? string | number | boolean
        : string | boolean
    : TOptions["parseNumbers"] extends true
    ? string | number
    : string;

export type NullInArray<TOptions extends QueryOptions> = undefined extends TOptions["arrayFormat"]
    ? true
    : TOptions["arrayFormat"] extends "bracket" | "index" | "none"
    ? true
    : false;

export function query<TOptions extends QueryOptions>(
    shape?: null,
    options?: TOptions
    // Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
): QueryProcessor<Record<string, any>, Record<string, QueryTypes<TOptions, KnownTypes<TOptions>>>>;

export function query<
    TOptions extends QueryOptions & { parseBooleans?: false; parseNumbers?: false },
    TCasters extends Record<string, Transformer<unknown, QueryTypes<TOptions, string> | undefined>>
>(shape: TCasters, options?: TOptions): QueryProcessor<QueryParams<TCasters, true>, QueryParams<TCasters>>;

export function query(
    shape?: null | Record<string, Transformer<unknown, QueryTypes<QueryOptions, string>>>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, any>, Record<string, any>> {
    function retrieve(object: Record<string, QueryTypes<Record<string, unknown>, string>>) {
        const result: Record<string, any> = {};

        Object.keys(object).forEach((key) => {
            try {
                result[key] = shape && shape[key] ? shape[key].retrieve(object[key]) : object[key];
            } catch {
                // Casting failed, but that's okay, we just omit this field
            }
        });

        return result;
    }

    return {
        stringify(query: Record<string, any>): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query, options)}` : "";
        },
        parse(query: string): Record<string, any> {
            return retrieve(queryString.parse(query, options));
        },
    };
}
