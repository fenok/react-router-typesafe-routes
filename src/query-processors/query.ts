import queryString, { ParsedQuery, ParseOptions, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import { ArrayQueryValueValidator, QueryValueValidator } from "./validators";

export interface QueryOptions {
    stringify?: StringifyOptions;
    parse?: ParseOptions;
}

export type QueryParamsFromValidators<T, AllowedTypes> = {} extends T
    ? ParsedQuery<AllowedTypes>
    : {
          [Key in keyof T]?: T[Key] extends QueryValueValidator<infer Type>[] | QueryValueValidator<infer Type>
              ? Type
              : T[Key] extends ArrayQueryValueValidator<infer ArrayType>
              ? ArrayType[]
              : never;
      };

export type GetAllowedTypes<T extends QueryOptions["parse"]> = T extends {}
    ? T["parseBooleans"] extends true
        ? T["parseNumbers"] extends true
            ? string | number | boolean
            : string | boolean
        : T["parseNumbers"] extends true
        ? string | number
        : string
    : string;

export function createQuery<Options extends QueryOptions, AllowedTypes = GetAllowedTypes<Options["parse"]>>(
    options: Options = {} as Options
) {
    return function query<
        T extends {
            [Key in keyof T]:
                | QueryValueValidator<AllowedTypes | null>
                | QueryValueValidator<AllowedTypes | null>[]
                | ArrayQueryValueValidator<AllowedTypes>;
        } = {}
    >(
        shape?: T
    ): QueryProcessor<QueryParamsFromValidators<T, AllowedTypes>, QueryParamsFromValidators<T, AllowedTypes>> {
        function validate(object: ParsedQuery<string | number | boolean>) {
            const result: Partial<ParsedQuery<string | number | boolean>> = object;

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
            stringify(query: QueryParamsFromValidators<T, AllowedTypes>): string {
                return query && Object.keys(query).length ? `?${queryString.stringify(query, options.stringify)}` : "";
            },
            parse(query: string): QueryParamsFromValidators<T, AllowedTypes> {
                return validate(queryString.parse(query, options.parse)) as QueryParamsFromValidators<T, AllowedTypes>;
            },
        };
    };
}
