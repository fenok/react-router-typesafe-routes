export interface Transformer<TOriginal, TStored, TRetrieved = TOriginal> {
    store(value: TOriginal): TStored;
    retrieve(value: unknown): TRetrieved;
}

export type Optional<T extends Transformer<any, any>> = T extends Transformer<
    infer TOriginal,
    infer TStored,
    infer TRetrieved
>
    ? T & { optional: Transformer<TOriginal | undefined, TStored | undefined, TRetrieved | undefined> }
    : never;

export function assertString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error("Got unexpected non-string value");
    }
}

export function storeArray<T, U, O>(transformer: Transformer<T, U, O>, values: T[]): U[] {
    return values.map((value) => transformer.store(value));
}

export function storeTrivialValue(value: string | number | boolean) {
    return String(value);
}

export function storeNull(value: null) {
    return value;
}

export function retrieveNumber(value: unknown): number {
    assertString(value);

    const result = Number(value);

    if (Number.isNaN(result)) {
        throw new Error(`Failed to convert ${value} to number`);
    }

    return result;
}

export function retrieveBoolean(value: unknown): boolean {
    assertString(value);

    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error(`Failed to convert ${value} to boolean`);
}

export function retrieveString(value: unknown): string {
    assertString(value);

    return value;
}

export function retrieveNull(value: unknown): null {
    if (value === null) {
        return null;
    }

    throw new Error("Got non-null value where null expected");
}

export function retrieveOneOf<T extends string | number | boolean>(values: T[], value: unknown): T {
    assertString(value);

    for (const canonicalValue of values) {
        try {
            switch (typeof canonicalValue) {
                case "string":
                    if (retrieveString(value) === canonicalValue) return canonicalValue;
                    break;
                case "number":
                    if (retrieveNumber(value) === canonicalValue) return canonicalValue;
                    break;
                case "boolean":
                    if (retrieveBoolean(value) === canonicalValue) return canonicalValue;
            }
        } catch {
            if (canonicalValue === values[values.length - 1]) {
                throw new Error("Couldn't cast value to any of the given variants");
            }
            // Otherwise try next value
        }
    }

    throw new Error(`No matching value for ${value}`);
}

export function retrieveArrayOf<T, U extends string | null, O>(transformer: Transformer<T, U, O>, value: unknown): O[] {
    const arrayValue = Array.isArray(value) ? value : [value];

    return arrayValue.map((item) => transformer.retrieve(item));
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
