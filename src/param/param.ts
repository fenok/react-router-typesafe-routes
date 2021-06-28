import {
    castArrayOf,
    castBoolean,
    Caster,
    castNull,
    castNumber,
    castOneOf,
    castString,
    optional,
    ValueFromString,
    WithOptional,
} from "./casters";

export interface Param {
    string: Caster<string> & WithOptional<string>;
    number: Caster<number> & WithOptional<number>;
    boolean: Caster<boolean> & WithOptional<boolean>;
    null: Caster<null> & WithOptional<null>;
    oneOf<T extends (string | number | boolean)[]>(...values: T): Caster<T[number]> & WithOptional<T[number]>;
    arrayOf<T>(...casters: Caster<T>[]): Caster<T[]> & WithOptional<T[]>;
}

export const param: Param = {
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
