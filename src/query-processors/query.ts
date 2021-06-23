import queryString, { ParsedQuery, ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { ArrayQueryValueValidator, QueryValueValidator } from "./validators";

export type ParsedQueryValue<T> = T | T[] | null;

export type ToGenericQueryParams<T> = {
    [TKey in keyof T]?: ParsedQueryValue<string | boolean | number>;
};

export interface QueryOptions {
    stringify?: StringifyOptions;
    parse?: ParseOptions;
}

export type QueryParamsFromValidators<T, Fallback> = {} extends T
    ? ParsedQuery<Fallback>
    : {
          [Key in keyof T]?: T[Key] extends QueryValueValidator<infer Type>[] | QueryValueValidator<infer Type>
              ? Type
              : T[Key] extends ArrayQueryValueValidator<infer ArrayType>
              ? ArrayType[]
              : never;
      };

export function query<
    T extends {
        [Key in keyof T]:
            | QueryValueValidator<string | boolean | number | null>
            | QueryValueValidator<string | boolean | number | null>[]
            | ArrayQueryValueValidator<string | boolean | number>;
    } = {}
>(
    shape?: T
): QueryProcessor<
    QueryParamsFromValidators<T, string | boolean | number>,
    QueryParamsFromValidators<T, string | boolean | number>
> {
    function validate(object: ParsedQuery<string | boolean | number>) {
        const result: Partial<ParsedQuery<string | boolean | number>> = object;

        for (const key in shape) {
            const validatorOrValidatorArray = shape[key];
            const value = object[key];

            if (Array.isArray(validatorOrValidatorArray)) {
                if (!validatorOrValidatorArray.some((validator) => validator.validate(value))) {
                    result[key] = undefined;
                }
            } else {
                if (!validatorOrValidatorArray.validate(value)) {
                    result[key] = undefined;
                }
            }
        }

        return result;
    }

    return {
        stringify(query: QueryParamsFromValidators<T, string | boolean | number>): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query)}` : "";
        },
        parse(query: string): QueryParamsFromValidators<T, string | boolean | number> {
            return validate(queryString.parse(query)) as QueryParamsFromValidators<T, string | boolean | number>;
        },
    };
}
