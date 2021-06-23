export interface ArrayQueryValueValidator<T> {
    validate(value: unknown): value is T[];
}

export interface QueryValueValidator<T> {
    validate(value: unknown): value is T;
}

export interface Valid {
    string: QueryValueValidator<string>;
    boolean: QueryValueValidator<boolean>;
    number: QueryValueValidator<number>;
    null: QueryValueValidator<null>;
    arrayOf<T>(validators: QueryValueValidator<T> | QueryValueValidator<T>[]): ArrayQueryValueValidator<T>;
}

export const valid: Valid = {
    string: {
        validate(value): value is string {
            return typeof value === "string";
        },
    },
    boolean: {
        validate(value): value is boolean {
            return typeof value === "boolean";
        },
    },
    number: {
        validate(value): value is number {
            return typeof value === "number";
        },
    },
    null: {
        validate(value): value is null {
            return !value && typeof value === "object";
        },
    },
    arrayOf<T>(validators: QueryValueValidator<T> | QueryValueValidator<T>[]): ArrayQueryValueValidator<T> {
        const validatorsArray = Array.isArray(validators) ? validators : [validators];

        return {
            validate(valueArray: unknown): valueArray is T[] {
                return (
                    Array.isArray(valueArray) &&
                    valueArray.every((value) => validatorsArray.some((validator) => validator.validate(value)))
                );
            },
        };
    },
};
