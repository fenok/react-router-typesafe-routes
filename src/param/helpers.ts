import { Optional, Transformer } from "./Transformer";

export function assertString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Got unexpected non-string value: ${String(value)}`);
    }
}

export function optional<TOriginal, TStored, TRetrieved>(
    transformer: Transformer<TOriginal, TStored, TRetrieved>
): Optional<Transformer<TOriginal, TStored, TRetrieved>> {
    return {
        ...transformer,
        optional: {
            store(value: TOriginal | undefined): TStored | undefined {
                return value === undefined ? (value as undefined) : transformer.store(value);
            },
            retrieve(value: unknown) {
                try {
                    return transformer.retrieve(value);
                } catch (error) {
                    return undefined;
                }
            },
        },
    };
}
