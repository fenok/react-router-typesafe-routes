import { Type, CallableType, ThrowableFallback } from "./type.js";

export const throwable = {} as ThrowableFallback;

export function createType<TOriginal, TPlain = string, TRetrieved = TOriginal>({
    getPlain,
    getTyped,
    isArray,
}: Type<TOriginal, TPlain, TRetrieved>): CallableType<TOriginal, TPlain, TRetrieved> {
    const getType = (fallback: TRetrieved | ThrowableFallback) => ({
        getPlain: getPlain,
        getTyped: (plainValue: unknown) => {
            try {
                return getTyped(plainValue);
            } catch (error) {
                if (fallback !== throwable) {
                    return fallback;
                }

                throw [error, throwable];
            }
        },
        isArray,
    });

    return Object.assign(getType, { getPlain, getTyped, isArray }) as CallableType<TOriginal, TPlain, TRetrieved>;
}
