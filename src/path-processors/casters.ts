export interface Cast {
    string: Caster<string>;
    number: Caster<number>;
    boolean: Caster<boolean>;
}

export interface Caster<T> {
    cast(value: unknown): T;
}

export const cast: Cast = {
    string: {
        cast(value: unknown): string {
            return String(value);
        },
    },
    number: {
        cast(value: unknown): number {
            return Number(value);
        },
    },
    boolean: {
        cast(value: unknown): boolean {
            return Boolean(value);
        },
    },
};
