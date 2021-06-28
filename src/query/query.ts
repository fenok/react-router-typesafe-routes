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
            ? AddUndefined<TArrayType, TLoose>[]
            : TType
        : never;
};

export type AddUndefined<T, Add extends boolean> = Add extends true ? T | undefined : T;

export type KnownTypes<Options extends QueryOptions> = Options["parseBooleans"] extends true
    ? Options["parseNumbers"] extends true
        ? string | number | boolean
        : string | boolean
    : Options["parseNumbers"] extends true
    ? string | number
    : string;

export type NullInArray<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
    ? true
    : Options["arrayFormat"] extends "bracket" | "index" | "none"
    ? true
    : false;

export function query<Options extends QueryOptions>(
    shape?: null,
    options?: Options
): QueryProcessor<Record<string, any>, Record<string, QueryTypes<Options, KnownTypes<Options>>>>;

export function query<
    Options extends QueryOptions & { parseBooleans?: false; parseNumbers?: false },
    T extends Record<string, Caster<QueryTypes<Options>> | Caster<QueryTypes<Options>>[]>
>(shape?: T, options?: Options): QueryProcessor<QueryParams<T, true>, QueryParams<T>>;

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
