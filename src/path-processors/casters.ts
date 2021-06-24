export interface Cast {
    string: CasterWithOptional<string>;
    number: CasterWithOptional<number>;
    boolean: CasterWithOptional<boolean>;
}

export interface Caster<T> {
    cast(value: unknown): T;
}

export interface CasterWithOptional<T> extends Caster<T> {
    optional: Caster<T | undefined>;
}

export const cast: Cast = {
    string: {
        cast(value: unknown): string {
            return String(value);
        },
        optional: {
            cast(value: unknown): string | undefined {
                return typeof value === "undefined" ? value : String(value);
            },
        },
    },
    number: {
        cast(value: unknown): number {
            return Number(value);
        },
        optional: {
            cast(value: unknown): number | undefined {
                return typeof value === "undefined" ? value : Number(value);
            },
        },
    },
    boolean: {
        cast(value: unknown): boolean {
            return Boolean(value);
        },
        optional: {
            cast(value: unknown): boolean | undefined {
                return typeof value === "undefined" ? value : Boolean(value);
            },
        },
    },
};
