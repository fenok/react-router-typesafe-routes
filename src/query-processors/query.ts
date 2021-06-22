import { ParseOptions, StringifiableRecord, StringifyOptions } from "query-string";
import { QueryProcessor } from "./interface";
import queryString from "query-string";

export type ParsedQueryValue<T> = T | T[] | null;

export type ToGenericQueryParams<T> = {
    [TKey in keyof T]?: ParsedQueryValue<string | boolean | number>;
};

export interface QueryOptions {
    stringify?: StringifyOptions;
    parse?: ParseOptions;
}

export function query<InQuery extends StringifiableRecord = StringifiableRecord>({
    stringify,
    parse,
}: QueryOptions = {}): QueryProcessor<InQuery, ToGenericQueryParams<InQuery>> {
    return {
        stringify(query: InQuery): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query, stringify)}` : "";
        },
        parse(query: string): ToGenericQueryParams<InQuery> {
            return queryString.parse(query, parse) as ToGenericQueryParams<InQuery>;
        },
    };
}
