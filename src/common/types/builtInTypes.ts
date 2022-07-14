import { Type, CallableType } from "./type.js";
import { makeCallable } from "./makeCallable.js";
import { assertIsString, assertIsArray, assertIsBoolean, assertIsValidDate, assertIsNumber } from "./helpers.js";

export const stringType = makeCallable<string>({
    getPlain(value) {
        return value;
    },
    getTyped(value) {
        assertIsString(value);

        return value;
    },
});

export const numberType = makeCallable<number>({
    getPlain(value) {
        return JSON.stringify(value);
    },
    getTyped(value) {
        assertIsString(value);

        const parsedValue: unknown = JSON.parse(value);
        assertIsNumber(parsedValue);

        return parsedValue;
    },
});

export const booleanType = makeCallable<boolean>({
    getPlain(value) {
        return JSON.stringify(value);
    },
    getTyped(value) {
        assertIsString(value);

        const parsedValue: unknown = JSON.parse(value);
        assertIsBoolean(parsedValue);

        return parsedValue;
    },
});

export const dateType = makeCallable<Date>({
    getPlain(value) {
        return value.toISOString();
    },
    getTyped(value) {
        assertIsString(value);

        const parsedValue = new Date(value);
        assertIsValidDate(parsedValue, `Couldn't transform ${value} to date`);

        return parsedValue;
    },
});

export const oneOfType = <T extends (string | number | boolean)[]>(...values: T) => {
    return makeCallable<T[number]>({
        getPlain: (value) => {
            switch (typeof value) {
                case "string":
                    return stringType.getPlain(value);
                case "number":
                    return numberType.getPlain(value);
                case "boolean":
                    return booleanType.getPlain(value);
                default:
                    throw new Error(`Expected ${String(value)} to be string, number or boolean`);
            }
        },
        getTyped(value) {
            for (const canonicalValue of values) {
                try {
                    switch (typeof canonicalValue) {
                        case "string":
                            if (stringType.getTyped(value) === canonicalValue) return canonicalValue;
                            break;
                        case "number":
                            if (numberType.getTyped(value) === canonicalValue) return canonicalValue;
                            break;
                        case "boolean":
                            if (booleanType.getTyped(value) === canonicalValue) return canonicalValue;
                    }
                } catch {
                    // Try next value
                }
            }

            throw new Error(`No matching value for ${String(value)}`);
        },
    });
};

export const arrayOfType = <TOriginal, TPlain, TRetrieved>(
    type: Type<TOriginal, TPlain, TRetrieved>
): CallableType<TOriginal[], TPlain[], TRetrieved[]> => {
    return makeCallable<TOriginal[], TPlain[], TRetrieved[]>({
        getPlain(values: TOriginal[]) {
            return values.map((value) => type.getPlain(value));
        },
        getTyped(value: unknown) {
            assertIsArray(value);

            return value.map((item) => type.getTyped(item));
        },
        isArray: true,
    });
};
