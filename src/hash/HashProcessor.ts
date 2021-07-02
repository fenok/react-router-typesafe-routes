export interface HashProcessor<TInHash, TOutHash> {
    build(hash: TInHash): string;
    parse(hash: string): TOutHash;
}
