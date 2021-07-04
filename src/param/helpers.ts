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

export function retrieve<TRetrieved>(
    storedParams: Record<string, unknown>,
    transformers: Record<string, Transformer<unknown, unknown, TRetrieved>>
): Record<string, TRetrieved> {
    const retrievedParams: Record<string, TRetrieved> = {};

    Object.keys(transformers).forEach((key) => {
        const value = transformers[key].retrieve(storedParams[key]);

        if (value !== undefined) {
            retrievedParams[key] = value;
        }
    });

    return retrievedParams;
}

export function store<TOriginal, TStored>(
    originalParams: Record<string, TOriginal>,
    transformers: Record<string, Transformer<TOriginal, TStored, unknown>>
): Record<string, TStored> {
    const storedParams: Record<string, TStored> = {};

    Object.keys(transformers).forEach((key) => {
        storedParams[key] = transformers[key].store(originalParams[key]);
    });

    return storedParams;
}
