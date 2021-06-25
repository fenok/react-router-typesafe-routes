export interface QueryValueValidator<T> {
    validate(value: unknown): value is T;
    isArray: boolean;
}

export interface WithUnionValidator<T> {
    oneOf<A extends readonly T[]>(values: A): QueryValueValidator<A[number]>;
}

export interface Valid {
    string: QueryValueValidator<string> & WithUnionValidator<string>;
    boolean: QueryValueValidator<boolean>;
    number: QueryValueValidator<number> & WithUnionValidator<number>;
    null: QueryValueValidator<null>;
    arrayOf<T>(validators: QueryValueValidator<T> | QueryValueValidator<T>[]): QueryValueValidator<T[]>;
}

export const valid: Valid = {
    string: {
        validate(value): value is string {
            return typeof value === "string";
        },
        oneOf(values) {
            return {
                validate(value): value is typeof values[number] {
                    return typeof value === "string" && values.includes(value);
                },
                isArray: false,
            };
        },
        isArray: false,
    },
    boolean: {
        validate(value): value is boolean {
            return typeof value === "boolean";
        },
        isArray: false,
    },
    number: {
        validate(value): value is number {
            return typeof value === "number";
        },
        oneOf(values) {
            return {
                validate(value): value is typeof values[number] {
                    return typeof value === "number" && values.includes(value);
                },
                isArray: false,
            };
        },
        isArray: false,
    },
    null: {
        validate(value): value is null {
            return !value && typeof value === "object";
        },
        isArray: false,
    },
    arrayOf<T>(validators: QueryValueValidator<T> | QueryValueValidator<T>[]): QueryValueValidator<T[]> {
        const validatorsArray = Array.isArray(validators) ? validators : [validators];

        return {
            validate(valueArray: unknown): valueArray is T[] {
                return (
                    Array.isArray(valueArray) &&
                    valueArray.every((value) => validatorsArray.some((validator) => validator.validate(value)))
                );
            },
            isArray: true,
        };
    },
};
