import { Optional, OptionalTransformer, OptionalTransformerWithDefault, RoutePart, Transformer } from "./Transformer";

export function assertString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error(`Got unexpected non-string value: ${String(value)}`);
    }
}

export function optional<TOriginal, TStored, TRetrieved>(
    transformer: Transformer<TOriginal, TStored, TRetrieved>
): Optional<Transformer<TOriginal, TStored, TRetrieved>> {
    function getOptionalTransformer(): OptionalTransformer<TOriginal, TStored, TRetrieved>;
    function getOptionalTransformer(
        defaultValue: TRetrieved
    ): OptionalTransformerWithDefault<TOriginal, TStored, TRetrieved>;
    function getOptionalTransformer(defaultValue?: TRetrieved) {
        return {
            store(value: TOriginal | undefined, part: RoutePart): TStored | undefined {
                return value === undefined ? (value as undefined) : transformer.store(value, part);
            },
            retrieve(value: unknown, part: RoutePart) {
                try {
                    return transformer.retrieve(value, part);
                } catch (error) {
                    return defaultValue;
                }
            },
        };
    }

    return {
        ...transformer,
        optional: Object.assign(getOptionalTransformer, getOptionalTransformer()),
    };
}

export function retrieve<TRetrieved>(
    storedParams: Record<string, unknown>,
    transformers: Record<string, Transformer<unknown, unknown, TRetrieved>>,
    part: RoutePart
): Record<string, TRetrieved> {
    const retrievedParams: Record<string, TRetrieved> = {};

    Object.keys(transformers).forEach((key) => {
        const value = transformers[key].retrieve(storedParams[key], part);

        if (value !== undefined) {
            retrievedParams[key] = value;
        }
    });

    return retrievedParams;
}

export function store<TOriginal, TStored>(
    originalParams: Record<string, TOriginal>,
    transformers: Record<string, Transformer<TOriginal, TStored, unknown>>,
    part: RoutePart
): Record<string, TStored> {
    const storedParams: Record<string, TStored> = {};

    Object.keys(transformers).forEach((key) => {
        storedParams[key] = transformers[key].store(originalParams[key], part);
    });

    return storedParams;
}
