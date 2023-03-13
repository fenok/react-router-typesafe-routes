import { Type, CallableType } from "./type.deprecated.js";
import { createType } from "./createType.deprecated.js";
import {
    assertIsString,
    assertIsArray,
    assertIsBoolean,
    assertIsValidDate,
    assertIsNumber,
} from "./helpers.deprecated.js";

/** @deprecated Use string instead */
export const stringType = createType<string>({
    getPlain(value) {
        return value;
    },
    getTyped(value) {
        assertIsString(value);

        return value;
    },
});

/** @deprecated Use number instead */
export const numberType = createType<number>({
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

/** @deprecated Use boolean instead */
export const booleanType = createType<boolean>({
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

/** @deprecated Use date instead */
export const dateType = createType<Date>({
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

/** @deprecated Use union instead */
export const oneOfType = <T extends (string | number | boolean)[]>(...values: T) => {
    return createType<T[number]>({
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

/** @deprecated It's not needed for universal types */
export const arrayOfType = <TOriginal, TPlain, TRetrieved>(
    type: Type<TOriginal, TPlain, TRetrieved>
): CallableType<TOriginal[], TPlain[], TRetrieved[]> => {
    return createType<TOriginal[], TPlain[], TRetrieved[]>({
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
