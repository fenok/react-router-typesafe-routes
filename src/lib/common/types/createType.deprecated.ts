import { Type, CallableType, ThrowableFallback } from "./type.deprecated.js";

/** @deprecated It's not needed for universal types */
export const throwable = {} as ThrowableFallback;

/** @deprecated Use type() instead */
export function createType<TOriginal, TPlain = string, TRetrieved = TOriginal>({
    getPlain,
    getTyped,
    isArray,
}: Type<TOriginal, TPlain, TRetrieved>): CallableType<TOriginal, TPlain, TRetrieved> {
    const getType = (fallback: TOriginal | ThrowableFallback) => {
        const validFallback = fallback !== throwable ? getTyped(getPlain(fallback as TOriginal)) : fallback;

        return {
            getPlain: getPlain,
            getTyped: (plainValue: unknown) => {
                try {
                    return getTyped(plainValue);
                } catch (error) {
                    if (validFallback !== throwable) {
                        return validFallback;
                    }

                    throw [error, throwable];
                }
            },
            isArray,
        };
    };

    return Object.assign(getType, { getPlain, getTyped, isArray }) as CallableType<TOriginal, TPlain, TRetrieved>;
}
