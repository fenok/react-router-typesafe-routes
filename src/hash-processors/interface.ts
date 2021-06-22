export interface HashProcessor<InHash, OutHash> {
    stringify(hash: InHash): string;
    parse(hash: string): OutHash;
}
