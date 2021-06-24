import queryString, { ParsedQuery, ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { QueryValueValidator } from "./validators";

export type QueryOptions = StringifyOptions & ParseOptions;

export type QueryParamsFromValidators<T, AllowedTypes, Options extends QueryOptions> = {} extends T
    ? ParsedQuery<AllowedTypes>
    : {
          [Key in keyof T]?: T[Key] extends QueryValueValidator<infer Type>[] | QueryValueValidator<infer Type>
              ? Type extends unknown[]
                  ? true extends IsArrayInfoStored<Options>
                      ? Type
                      : Type | Type[number]
                  : Type
              : never;
      };

export type GetAllowedTypes<T extends QueryOptions> = T extends {}
    ? T["parseBooleans"] extends true
        ? T["parseNumbers"] extends true
            ? string | number | boolean
            : string | boolean
        : T["parseNumbers"] extends true
        ? string | number
        : string
    : string;

export type IsArrayInfoStored<Options extends QueryOptions> = undefined extends Options["arrayFormat"]
    ? false
    : Options["arrayFormat"] extends "bracket" | "index" | "bracket-separator"
    ? true
    : false;

export function query<
    Options extends QueryOptions,
    AllowedTypes = GetAllowedTypes<Options>,
    T extends {
        [Key in keyof T]:
            | QueryValueValidator<AllowedTypes | AllowedTypes[] | null>
            | QueryValueValidator<AllowedTypes | AllowedTypes[] | null>[];
    } = {}
>(
    shape?: T,
    options: Options = {} as Options
): QueryProcessor<QueryParamsFromValidators<T, any, Options>, QueryParamsFromValidators<T, AllowedTypes, Options>> {
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
        stringify(query: QueryParamsFromValidators<T, AllowedTypes, Options>): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query, options)}` : "";
        },
        parse(query: string): QueryParamsFromValidators<T, AllowedTypes, Options> {
            return validate(queryString.parse(query, options)) as QueryParamsFromValidators<T, AllowedTypes, Options>;
        },
    };
}

function isArrayInfoStored(options: QueryOptions = {}) {
    return ["bracket", "index", "bracket-separator"].includes(options.arrayFormat || "none");
}
