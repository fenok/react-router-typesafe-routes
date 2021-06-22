import { StringifiableRecord } from "query-string";
import { QueryProcessor } from "./interface";
import queryString from "query-string";

export type ParsedQueryValue<T> = T | T[] | null;

export type ToGenericQueryParams<T> = {
    [TKey in keyof T]?: ParsedQueryValue<string | boolean | number>;
};

export function query<InQuery extends StringifiableRecord = StringifiableRecord>(): QueryProcessor<
    InQuery,
    ToGenericQueryParams<InQuery>
> {
    return {
        stringify(query: InQuery): string {
            return query && Object.keys(query).length ? `?${queryString.stringify(query)}` : "";
        },
        parse(query: string): ToGenericQueryParams<InQuery> {
            return queryString.parse(query) as ToGenericQueryParams<InQuery>;
        },
    };
}
