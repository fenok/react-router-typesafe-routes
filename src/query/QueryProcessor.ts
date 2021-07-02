export interface QueryProcessor<TInQuery, TOutQuery> {
    build(query: TInQuery): string;
    parse(query: string): TOutQuery;
}
