export type SingleValueFromString = string | null | undefined;
export type ArrayValueFromString = (string | null)[];
export type ValueFromString = SingleValueFromString | ArrayValueFromString;

export interface Caster<T> {
    cast(value: ValueFromString): T;
}

export interface WithOptional<T> {
    optional: Caster<T | undefined>;
}

function assertDefined<T>(value: T): asserts value is Exclude<T, undefined> {
    if (typeof value === "undefined") {
        throw new Error("Got undefined in required field");
    }
}

function assertSingle<TArray extends ArrayValueFromString, TSingle extends SingleValueFromString>(
    value: TArray | TSingle
): asserts value is TSingle {
    if (Array.isArray(value)) {
        throw new Error("Got array where single value expected");
    }
}

function assertNonNull<T>(value: T): asserts value is Exclude<T, null> {
    if (value === null) {
        throw new Error("Got unexpected null value");
    }
}

function castNumber(value: ValueFromString): number {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    const result = Number(value);

    if (Number.isNaN(result)) {
        throw new Error(`Failed to convert ${value} to number`);
    }

    return result;
}

function castBoolean(value: ValueFromString): boolean {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error(`Failed to convert ${value} to boolean`);
}

function castString(value: ValueFromString): string {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    return value;
}

function castNull(value: ValueFromString): null {
    if (value === null) {
        return null;
    }

    throw new Error("Got non-null value where null expected");
}

function castOneOf<T extends string | number | boolean>(values: T[], value: ValueFromString): T {
    assertDefined(value);
    assertSingle(value);
    assertNonNull(value);

    for (const canonicalValue of values) {
        switch (typeof canonicalValue) {
            case "string":
                if (castString(value) === canonicalValue) return canonicalValue;
                break;
            case "number":
                if (castNumber(value) === canonicalValue) return canonicalValue;
                break;
            case "boolean":
                if (castBoolean(value) === canonicalValue) return canonicalValue;
        }
    }

    throw new Error(`No matching value for ${value}`);
}

function castArrayOf<T>(casters: Caster<T>[], value: ValueFromString): T[] {
    const arrayValue = Array.isArray(value) ? value : [value];

    return arrayValue.map((item) => applyCasters(item, ...casters));
}

export function applyCasters<T>(value: ValueFromString, ...casters: Caster<T>[]): T {
    if (casters.length) {
        for (const caster of casters) {
            try {
                return caster.cast(value);
            } catch {
                if (caster === casters[casters.length - 1]) {
                    throw new Error("Couldn't cast value with any caster");
                }
                // Otherwise try next caster
            }
        }
    }

    throw new Error("No casters provided");
}

function optional<T>(cast: (value: ValueFromString) => T): (value: ValueFromString) => T | undefined {
    return (value) => {
        if (typeof value === "undefined") {
            return value;
        }
        return cast(value);
    };
}

export interface Cast {
    string: Caster<string> & WithOptional<string>;
    number: Caster<number> & WithOptional<number>;
    boolean: Caster<boolean> & WithOptional<boolean>;
    null: Caster<null> & WithOptional<null>;
    oneOf<T extends (string | number | boolean)[]>(...values: T): Caster<T[number]> & WithOptional<T[number]>;
    arrayOf<T>(...casters: Caster<T>[]): Caster<T[]> & WithOptional<T[]>;
}

export const cast: Cast = {
    string: {
        cast: castString,
        optional: {
            cast: optional(castString),
        },
    },
    number: {
        cast: castNumber,
        optional: {
            cast: optional(castNumber),
        },
    },
    boolean: {
        cast: castBoolean,
        optional: {
            cast: optional(castBoolean),
        },
    },
    null: {
        cast: castNull,
        optional: {
            cast: optional(castNull),
        },
    },
    oneOf<T extends (string | number | boolean)[]>(...values: T): Caster<T[number]> & WithOptional<T[number]> {
        return {
            cast(value) {
                return castOneOf(values, value);
            },
            optional: {
                cast(value: ValueFromString): T[number] | undefined {
                    return optional(castOneOf.bind(null, values))(value);
                },
            },
        };
    },
    arrayOf<T>(...casters: Caster<T>[]): Caster<T[]> & WithOptional<T[]> {
        return {
            cast(value) {
                return castArrayOf(casters, value);
            },
            optional: {
                cast(value: ValueFromString): T[] | undefined {
                    return optional<T[]>(castArrayOf.bind(null, casters) as any)(value);
                },
            },
        };
    },
};
