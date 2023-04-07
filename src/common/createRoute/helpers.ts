export type Merge<T, U> = Omit<T, keyof U> & U;

export type Identity<T> = T;

export type Readable<T> = Identity<{
    [K in keyof T]: T[K];
}>;
