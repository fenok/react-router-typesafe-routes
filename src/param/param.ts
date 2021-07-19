import { Optional, Transformer } from "./Transformer";
import { assertString, optional } from "./helpers";

const stringTransformer: Optional<Transformer<string | number | boolean, string, string>> = optional({
    store: String,
    retrieve(value: unknown): string {
        assertString(value);

        return value;
    },
});

const numberTransformer: Optional<Transformer<number>> = optional({
    store: String,
    retrieve(value: unknown): number {
        assertString(value);

        const result = Number(value);

        if (Number.isNaN(result)) {
            throw new Error(`Failed to convert ${value} to number`);
        }

        return result;
    },
});

const booleanTransformer: Optional<Transformer<boolean>> = optional({
    store: String,
    retrieve(value: unknown): boolean {
        assertString(value);

        if (value === "true") return true;
        if (value === "false") return false;

        throw new Error(`Failed to convert ${value} to boolean`);
    },
});

const nullTransformer: Optional<Transformer<null, null>> = optional({
    store(value: null) {
        return value;
    },
    retrieve(value: unknown): null {
        if (value === null) {
            return null;
        }

        throw new Error(`Got non-null value: ${String(value)}`);
    },
});

const dateTransformer: Optional<Transformer<Date>> = optional({
    store(value: Date) {
        return value.toISOString();
    },
    retrieve(value) {
        assertString(value);

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Couldn't transform ${value} to date`);
        }

        return date;
    },
});

function oneOfTransformer<T extends (string | number | boolean)[]>(...values: T): Optional<Transformer<T[number]>> {
    return optional({
        store: String,
        retrieve(value, routePart) {
            assertString(value);

            for (const canonicalValue of values) {
                try {
                    switch (typeof canonicalValue) {
                        case "string":
                            if (stringTransformer.retrieve(value, routePart) === canonicalValue) return canonicalValue;
                            break;
                        case "number":
                            if (numberTransformer.retrieve(value, routePart) === canonicalValue) return canonicalValue;
                            break;
                        case "boolean":
                            if (booleanTransformer.retrieve(value, routePart) === canonicalValue) return canonicalValue;
                    }
                } catch {
                    // Try next value
                }
            }

            throw new Error(`No matching value for ${value}`);
        },
    });
}

function arrayOfTransformer<T, U, O>(transformer: Transformer<T, U, O>): Optional<Transformer<T[], U[], O[]>> {
    return optional({
        store(values, routePart) {
            return values.map((value) => transformer.store(value, routePart));
        },
        retrieve(value, routePart) {
            if (value !== undefined) {
                let arrayValue: unknown[];

                if (routePart === "path") {
                    assertString(value);

                    arrayValue = value.split("/");
                } else {
                    arrayValue = Array.isArray(value) ? value : [value];
                }

                return arrayValue.map((item) => transformer.retrieve(item, routePart));
            }

            return [];
        },
    });
}

export const param = {
    string: stringTransformer,
    number: numberTransformer,
    boolean: booleanTransformer,
    null: nullTransformer,
    date: dateTransformer,
    oneOf: oneOfTransformer,
    arrayOf: arrayOfTransformer,
};
