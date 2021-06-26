export interface Cast {
    string: Caster<string> & WithOptional<string>;
    number: Caster<number> & WithOptional<number>;
    boolean: Caster<boolean> & WithOptional<boolean>;
    oneOf<T extends (string | number | boolean)[]>(...values: T): Caster<T[number]> & WithOptional<T[number]>;
}

export interface Caster<T> {
    cast(value: string | undefined): T;
}

export interface WithOptional<T> {
    optional: Caster<T | undefined>;
}

function castNumber(value: string | undefined) {
    if (typeof value === "undefined") {
        throw new Error("Got undefined in required field");
    }

    const result = Number(value);

    if (Number.isNaN(result)) {
        throw new Error(`Failed to convert ${value} to number`);
    }

    return result;
}

function castBoolean(value: string | undefined) {
    if (typeof value === "undefined") {
        throw new Error("Got undefined in required field");
    }

    if (value === "true") return true;
    if (value === "false") return false;

    throw new Error(`Failed to convert ${value} to boolean`);
}

export const cast: Cast = {
    oneOf<T extends (string | number | boolean)[]>(...values: T) {
        function cast(value: string | undefined): typeof values[number] {
            for (const canonicalValue of values) {
                switch (typeof canonicalValue) {
                    case "string":
                        if (value === canonicalValue) return canonicalValue;
                        break;
                    case "number":
                        if (Number(value) === canonicalValue) return canonicalValue;
                        break;
                    case "boolean":
                        if ((value === "true" && canonicalValue) || (value === "false" && !canonicalValue))
                            return canonicalValue;
                }
            }

            throw new Error(`No matching value for ${value!}`);
        }

        return {
            cast(value: string | undefined) {
                return cast(value);
            },
            optional: {
                cast(value: string | undefined) {
                    if (typeof value === "undefined") return value;

                    return cast(value);
                },
            },
        };
    },
    string: {
        cast(value: string | undefined): string {
            if (typeof value === "undefined") {
                throw new Error("Got undefined in required field");
            }

            return value;
        },
        optional: {
            cast(value: string | undefined): string | undefined {
                return value;
            },
        },
    },
    number: {
        cast(value: string | undefined): number {
            return castNumber(value);
        },
        optional: {
            cast(value: string | undefined): number | undefined {
                return typeof value === "undefined" ? value : castNumber(value);
            },
        },
    },
    boolean: {
        cast(value: string | undefined): boolean {
            return castBoolean(value);
        },
        optional: {
            cast(value: string | undefined): boolean | undefined {
                return typeof value === "undefined" ? value : castBoolean(value);
            },
        },
    },
};
