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
            store(value: TOriginal | undefined, routePart: RoutePart): TStored | undefined {
                return value === undefined ? (value as undefined) : transformer.store(value, routePart);
            },
            retrieve(value: unknown, routePart: RoutePart) {
                try {
                    return transformer.retrieve(value, routePart);
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
    routePart: RoutePart
): Record<string, TRetrieved> {
    const retrievedParams: Record<string, TRetrieved> = {};

    Object.keys(transformers).forEach((key) => {
        const value = transformers[key].retrieve(storedParams[key], routePart);

        if (value !== undefined) {
            retrievedParams[key] = value;
        }
    });

    return retrievedParams;
}

export function store<TOriginal, TStored>(
    originalParams: Record<string, TOriginal>,
    transformers: Record<string, Transformer<TOriginal, TStored, unknown>>,
    routePart: RoutePart
): Record<string, TStored> {
    const storedParams: Record<string, TStored> = {};

    Object.keys(transformers).forEach((key) => {
        storedParams[key] = transformers[key].store(originalParams[key], routePart);
    });

    return storedParams;
}
