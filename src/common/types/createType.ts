import { Type, CallableType, ThrowableFallback } from "./type.js";

const throwable = {} as ThrowableFallback;

function createType<TOriginal, TPlain = string, TRetrieved = TOriginal>({
    getPlain,
    getTyped,
    isArray,
}: Type<TOriginal, TPlain, TRetrieved>): CallableType<TOriginal, TPlain, TRetrieved> {
    const getType = (fallback: TOriginal | ThrowableFallback) => {
        const validFallback = !isThrowable(fallback) ? getTyped(getPlain(fallback)) : fallback;

        return {
            getPlain,
            getTyped: (plainValue: unknown) => {
                try {
                    return getTyped(plainValue);
                } catch (error) {
                    if (!isThrowable(validFallback)) {
                        return validFallback;
                    }

                    throw error;
                }
            },
            isArray,
        };
    };

    const failsafeGetTyped = (plainValue: unknown) => {
        try {
            return getTyped(plainValue);
        } catch {
            return undefined;
        }
    };

    return Object.assign(getType, { getPlain, getTyped: failsafeGetTyped, isArray }) as CallableType<
        TOriginal,
        TPlain,
        TRetrieved
    >;
}

function isThrowable(fallback: unknown): fallback is ThrowableFallback {
    return fallback === throwable;
}

export { createType, throwable };
