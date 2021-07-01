import { HashProcessor } from "./HashProcessor";

export type InHashValues<T extends readonly string[]> = T[number];

export type OutHashValues<T extends readonly string[]> = InHashValues<T> | "";

export function hash(): HashProcessor<string, string>;
export function hash<T extends readonly string[]>(...values: T): HashProcessor<InHashValues<T>, OutHashValues<T>>;
export function hash<T extends readonly string[]>(...values: T): HashProcessor<InHashValues<T>, OutHashValues<T>> {
    function normalizeHash(hash: string): string {
        return hash[0] === "#" ? hash.substr(1) : hash;
    }

    return {
        stringify(hash: InHashValues<T>): string {
            const normalizedHash = normalizeHash(hash);

            if (normalizedHash) {
                return `#${normalizedHash}`;
            }

            return "";
        },
        parse(hash: string): OutHashValues<T> {
            const normalizedHash = normalizeHash(hash);

            if (!values.length || values.includes(normalizedHash)) {
                return normalizedHash;
            }

            return "";
        },
    };
}
