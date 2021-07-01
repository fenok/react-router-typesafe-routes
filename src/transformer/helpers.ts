import { Transformer } from "./interface";

export function assertString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Got unexpected non-string value: ${String(value)}`);
    }
}

export function optional<TOriginal, TStored, TRetrieved>(
    transformer: Transformer<TOriginal, TStored, TRetrieved>
): Transformer<TOriginal, TStored, TRetrieved> & {
    optional: Transformer<TOriginal | undefined, TStored | undefined, TRetrieved | undefined>;
} {
    return {
        ...transformer,
        optional: {
            store(value: TOriginal | undefined): TStored | undefined {
                return value === undefined ? (value as undefined) : transformer.store(value);
            },
            retrieve(value: unknown): TRetrieved | undefined {
                return value === undefined ? value : transformer.retrieve(value);
            },
        },
    };
}
