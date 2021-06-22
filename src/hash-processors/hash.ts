import { HashProcessor } from "./interface";

export function hash<InHash extends string = string>(): HashProcessor<InHash, string> {
    function normalizeHash(hash: InHash | string): string {
        return typeof hash === "string" ? (hash[0] === "#" ? hash.substr(1) : hash) : "";
    }

    return {
        parse(hash: string): string {
            return normalizeHash(hash);
        },
        stringify(hash: InHash): string {
            const normalizedHash = normalizeHash(hash);

            if (normalizedHash) {
                return `#${normalizedHash}`;
            }

            return "";
        },
    };
}
