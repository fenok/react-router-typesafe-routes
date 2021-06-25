import queryString, { ParsedQuery, ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { QueryValueValidator } from "./validators";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryParamsFromValidators<
    T,
    AllowedArrayTypes,
    Options extends QueryOptions,
    AddUndefinedToArray extends boolean
> = {} extends T
    ? ParsedQuery<AllowedArrayTypes>
    : {
          [Key in keyof T]?: T[Key] extends QueryValueValidator<infer Type>[] | QueryValueValidator<infer Type>
              ? Type extends (infer ArrayType)[]
                  ? true extends IsArrayInfoStored<Options>
                      ? AddUndefined<ArrayType, AddUndefinedToArray>[]
                      : AddUndefined<ArrayType, AddUndefinedToArray>[] | ArrayType
                  : Type
              : never;
      };

export type AddUndefined<T, Add extends boolean> = true extends Add ? T | undefined : T;

export type GetAllowedArrayTypes<T extends QueryOptions> = T extends {}
    ? T["parseBooleans"] extends true
        ? T["parseNumbers"] extends true
            ? string | number | boolean | (true extends CanStoreNullInArray<T> ? null : string)
            : string | boolean | (true extends CanStoreNullInArray<T> ? null : string)
        : T["parseNumbers"] extends true
        ? string | number | (true extends CanStoreNullInArray<T> ? null : string)
        : string | (true extends CanStoreNullInArray<T> ? null : string)
    : string | (true extends CanStoreNullInArray<T> ? null : string);

export type IsArrayInfoStored<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
    ? false
    : Options["arrayFormat"] extends "bracket" | "index" | "bracket-separator"
    ? true
    : false;

export type CanStoreNullInArray<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
    ? true
    : Options["arrayFormat"] extends "bracket" | "index" | "none"
    ? true
    : false;

export function query<
    Options extends QueryOptions,
    AllowedArrayTypes = GetAllowedArrayTypes<Options>,
    T extends {
        [Key in keyof T]:
            | QueryValueValidator<AllowedArrayTypes | null | AllowedArrayTypes[]>
            | QueryValueValidator<AllowedArrayTypes | null | AllowedArrayTypes[]>[];
    } = {}
>(
    shape?: T,
    options: Options = {} as Options
): QueryProcessor<
    QueryParamsFromValidators<T, any, Options, true>,
    QueryParamsFromValidators<T, AllowedArrayTypes, Options, false>
> {
    const isArrayAware = isArrayInfoStored(options);

    function validate(object: ParsedQuery<string | number | boolean>) {
        const result: Partial<ParsedQuery<string | number | boolean>> = object;

        for (const key in shape) {
            const validatorOrValidatorArray = shape[key];
            const value = object[key];
            const validators: QueryValueValidator<unknown>[] = Array.isArray(validatorOrValidatorArray)
                ? validatorOrValidatorArray
                : [validatorOrValidatorArray];

            if (
                !validators.some((validator) =>
                    validator.validate(validator.isArray && !isArrayAware && !Array.isArray(value) ? [value] : value)
                )
            ) {
                result[key] = undefined;
            }
        }

        return result;
    }

    return {
        stringify(query: QueryParamsFromValidators<T, any, Options, true>): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query, options)}` : "";
        },
        parse(query: string): QueryParamsFromValidators<T, AllowedArrayTypes, Options, false> {
            return validate(queryString.parse(query, options)) as QueryParamsFromValidators<
                T,
                AllowedArrayTypes,
                Options,
                false
            >;
        },
    };
}

function isArrayInfoStored(options: QueryOptions = {}) {
    return ["bracket", "index", "bracket-separator"].includes(options.arrayFormat || "none");
}
