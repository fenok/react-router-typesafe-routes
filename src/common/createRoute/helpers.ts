export type Merge<T, U> = Readable<Omit<T, keyof U> & U>;

export type Identity<T> = T;

export type Readable<T> = Identity<{
    [K in keyof T]: T[K];
}>;

export type ErrorMessage<T extends string> = T & { __brand: ErrorMessage<T> };
