export interface QueryProcessor<TInQuery, TOutQuery> {
    stringify(query: TInQuery): string;
    parse(query: string): TOutQuery;
}
