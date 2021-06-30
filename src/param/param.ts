import {
    retrieveBoolean,
    retrieveNull,
    retrieveNumber,
    retrieveOneOf,
    retrieveString,
    Optional,
    optional,
    Transformer,
    storeTrivialValue,
    storeNull,
    storeArray,
    retrieveArrayOf,
} from "./casters";

export interface Param {
    string: Optional<Transformer<string | number | boolean, string, string>>;
    number: Optional<Transformer<number, string>>;
    boolean: Optional<Transformer<boolean, string>>;
    null: Optional<Transformer<null, null>>;
    oneOf<T extends (string | number | boolean)[]>(...values: T): Optional<Transformer<T[number], string>>;
    arrayOf<T, U extends string | null>(transformer: Transformer<T, U>): Optional<Transformer<T[], U[]>>;
}

export const param: Param = {
    string: optional({
        store: storeTrivialValue,
        retrieve: retrieveString,
    }),
    number: optional({
        store: storeTrivialValue,
        retrieve: retrieveNumber,
    }),
    boolean: optional({
        store: storeTrivialValue,
        retrieve: retrieveBoolean,
    }),
    null: optional({
        store: storeNull,
        retrieve: retrieveNull,
    }),
    oneOf<T extends (string | number | boolean)[]>(...values: T): Optional<Transformer<T[number], string>> {
        return optional({
            store: storeTrivialValue,
            retrieve(value) {
                return retrieveOneOf(values, value);
            },
        });
    },
    arrayOf<T, U extends string | null>(transformer: Transformer<T, U>): Optional<Transformer<T[], U[]>> {
        return optional({
            store(value) {
                return storeArray(transformer, value);
            },
            retrieve(value) {
                return retrieveArrayOf(transformer, value);
            },
        });
    },
};
