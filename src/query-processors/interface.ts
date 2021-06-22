export interface QueryProcessor<InQuery, OutQuery> {
    stringify(query: InQuery): string;
    parse(query: string): OutQuery | undefined;
}
