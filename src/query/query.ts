import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { applyCasters, Caster } from "../param";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryTypes<TOptions extends QueryOptions = Record<string, unknown>, T = string | number | boolean> =
    | T
    | null
    | (NullInArray<TOptions> extends true ? T | null : T)[];

export type QueryParams<TCasters, TLoose extends boolean = false> = {
    [Key in keyof TCasters]?: TCasters[Key] extends Caster<infer TType>[] | Caster<infer TType>
        ? TType extends (infer TArrayType)[]
            ? (TLoose extends true ? LooseQueryType<TArrayType> : TArrayType)[]
            : TLoose extends true
            ? LooseQueryType<TType>
            : TType
        : never;
};

export type LooseQueryType<T> = string extends T ? T | number | boolean | undefined : T | undefined;

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
    TCasters extends Record<string, Caster<QueryTypes<TOptions>> | Caster<QueryTypes<TOptions>>[]>
>(shape: TCasters, options?: TOptions): QueryProcessor<QueryParams<TCasters, true>, QueryParams<TCasters>>;

export function query(
    shape?: null | Record<string, Caster<QueryTypes> | Caster<QueryTypes>[]>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, any>, Record<string, any>> {
    function cast(object: Record<string, QueryTypes<Record<string, unknown>, string>>) {
        const result: Record<string, any> = {};

        Object.keys(object).forEach((key) => {
            try {
                result[key] = shape && shape[key] ? applyCasters(object[key], ...[shape[key]].flat()) : object[key];
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
            return cast(queryString.parse(query, options));
        },
    };
}
