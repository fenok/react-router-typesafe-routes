export interface HashProcessor<TInHash, TOutHash> {
    stringify(hash: TInHash): string;
    parse(hash: string): TOutHash;
}
