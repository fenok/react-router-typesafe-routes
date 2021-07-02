import { HashProcessor } from "./HashProcessor";

export function hash(): HashProcessor<string, string>;
export function hash<T extends readonly string[]>(...values: T): HashProcessor<T[number], T[number] | "">;
export function hash(...values: string[]): HashProcessor<string, string> {
    function normalizeHash(hash: string): string {
        return hash[0] === "#" ? hash.substr(1) : hash;
    }

    return {
        build(hash: string): string {
            const normalizedHash = normalizeHash(hash);

            if (normalizedHash) {
                return `#${normalizedHash}`;
            }

            return "";
        },
        parse(hash: string): string {
            const normalizedHash = normalizeHash(hash);

            if (!values.length || ~values.findIndex((value) => value === normalizedHash)) {
                return normalizedHash;
            }

            return "";
        },
    };
}
