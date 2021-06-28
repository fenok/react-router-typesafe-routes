import queryString, { ParsedQuery, ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { applyCasters, Caster } from "../path-processors";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryParamsFromCasters<T, AddUndefinedToArray extends boolean> = {
    [Key in keyof T]?: T[Key] extends Caster<infer Type>[] | Caster<infer Type>
        ? Type extends (infer ArrayType)[]
            ? AddUndefined<ArrayType, AddUndefinedToArray>[]
            : Type
        : never;
};

export type AddUndefined<T, Add extends boolean> = true extends Add ? T | undefined : T;

export type GetKnownTypes<T extends QueryOptions> = T extends {}
    ? T["parseBooleans"] extends true
        ? T["parseNumbers"] extends true
            ? string | number | boolean | (true extends CanStoreNullInArray<T> ? null : string)
            : string | boolean | (true extends CanStoreNullInArray<T> ? null : string)
        : T["parseNumbers"] extends true
        ? string | number | (true extends CanStoreNullInArray<T> ? null : string)
        : string | (true extends CanStoreNullInArray<T> ? null : string)
    : string | (true extends CanStoreNullInArray<T> ? null : string);

export type CanStoreNullInArray<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
    ? true
    : Options["arrayFormat"] extends "bracket" | "index" | "none"
    ? true
    : false;

export function query<Options extends QueryOptions = {}, KnownTypes = GetKnownTypes<Options>, T extends null = null>(
    shape?: T,
    options?: Options
): QueryProcessor<Record<string, any>, ParsedQuery<KnownTypes>>;

export function query<
    Options extends QueryOptions & { parseBooleans?: false; parseNumbers?: false } = {},
    KnownTypes = string | number | boolean | (true extends CanStoreNullInArray<Options> ? null : string),
    T extends {
        [Key in string]: Caster<KnownTypes | null | KnownTypes[]> | Caster<KnownTypes | null | KnownTypes[]>[];
    } = {}
>(shape: T, options?: Options): QueryProcessor<QueryParamsFromCasters<T, true>, QueryParamsFromCasters<T, false>>;

export function query<
    Options extends QueryOptions,
    AllowedTypes = string | number | boolean | null,
    T extends
        | {
              [Key in string]:
                  | Caster<AllowedTypes | null | AllowedTypes[]>
                  | Caster<AllowedTypes | null | AllowedTypes[]>[];
          }
        | null = null
>(shape?: T, options: Options = {} as Options): QueryProcessor<Record<string, any>, Record<string, any>> {
    function cast(object: ParsedQuery<string | null>) {
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
