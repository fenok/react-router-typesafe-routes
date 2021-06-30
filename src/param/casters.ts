export type SingleValueFromString = string | null | undefined;
export type ArrayValueFromString = (string | null)[];
export type ValueFromString = SingleValueFromString | ArrayValueFromString;

export interface Transformer<TOriginal, TStored extends ValueFromString, TRetrieved = TOriginal> {
    store(value: TOriginal): TStored;
    retrieve(value: ValueFromString): TRetrieved;
}

export type Optional<T extends Transformer<any, any>> = T extends Transformer<
    infer TOriginal,
    infer TStored,
    infer TRetrieved
>
    ? T & { optional: Transformer<TOriginal | undefined, TStored | undefined, TRetrieved | undefined> }
    : never;

export function assertDefined<T>(value: T): asserts value is Exclude<T, undefined> {
    if (typeof value === "undefined") {
        throw new Error("Got undefined in required field");
    }
}

export function assertSingle<TArray extends ArrayValueFromString, TSingle extends SingleValueFromString>(
    value: TArray | TSingle
): asserts value is TSingle {
    if (Array.isArray(value)) {
        throw new Error("Got array where single value expected");
    }
}

export function assertNonNull<T>(value: T): asserts value is Exclude<T, null> {
    if (value === null) {
        throw new Error("Got unexpected null value");
    }
}

export function storeArray<T, U extends ValueFromString>(transformer: Transformer<T, U>, values: T[]): U[] {
    return values.map((value) => transformer.store(value));
}

export function storeTrivialValue(value: string | number | boolean) {
    return String(value);
}

export function storeNull(value: null) {
    return value;
}

export function retrieveNumber(value: ValueFromString): number {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    const result = Number(value);

    if (Number.isNaN(result)) {
        throw new Error(`Failed to convert ${value} to number`);
    }

    return result;
}

export function retrieveBoolean(value: ValueFromString): boolean {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error(`Failed to convert ${value} to boolean`);
}

export function retrieveString(value: ValueFromString): string {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    return value;
}

export function retrieveNull(value: ValueFromString): null {
    if (value === null) {
        return null;
    }

    throw new Error("Got non-null value where null expected");
}

export function retrieveOneOf<T extends string | number | boolean>(values: T[], value: ValueFromString): T {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

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

export function retrieveArrayOf<T, U extends string | null>(
    transformer: Transformer<T, U>,
    value: ValueFromString
): T[] {
    const arrayValue = Array.isArray(value) ? value : [value];

    return arrayValue.map((item) => transformer.retrieve(item));
}

export function optional<TOriginal, TStored extends ValueFromString, TRetrieved>(
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
            retrieve(value: ValueFromString): TRetrieved | undefined {
                return value === undefined ? value : transformer.retrieve(value);
            },
        },
    };
}
