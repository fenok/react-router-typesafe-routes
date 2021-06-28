import queryString, { ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { applyCasters, Caster } from "../path-processors";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryTypes<Options extends QueryOptions = Record<string, unknown>, T = string | number | boolean> =
    | T
    | null
    | (CanStoreNullInArray<Options> extends true ? T | null : T)[];

export type QueryParamsFromCasters<T, Loose extends boolean = false> = {
    [Key in keyof T]?: T[Key] extends Caster<infer Type>[] | Caster<infer Type>
        ? Type extends (infer ArrayType)[]
            ? AddUndefined<ArrayType, Loose>[]
            : Type
        : never;
};

export type AddUndefined<T, Add extends boolean> = true extends Add ? T | undefined : T;

export type KnownTypes<Options extends QueryOptions> = Options["parseBooleans"] extends true
    ? Options["parseNumbers"] extends true
        ? string | number | boolean
        : string | boolean
    : Options["parseNumbers"] extends true
    ? string | number
    : string;

export type CanStoreNullInArray<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
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
>(shape?: T, options?: Options): QueryProcessor<QueryParamsFromCasters<T, true>, QueryParamsFromCasters<T>>;

export function query(
    shape?: null | Record<string, Caster<QueryTypes> | Caster<QueryTypes>[]>,
    options: QueryOptions = {}
): QueryProcessor<Record<string, any>, Record<string, any>> {
    function cast(object: Record<string, any>) {
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
