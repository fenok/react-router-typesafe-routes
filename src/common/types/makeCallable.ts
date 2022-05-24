import { Type, CallableType } from "./type";

export function makeCallable<TOriginal, TPlain = string, TRetrieved = TOriginal>({
    getPlain,
    getTyped,
    isArray,
}: Type<TOriginal, TPlain, TRetrieved>): CallableType<TOriginal, TPlain, TRetrieved> {
    const getType = (fallback: TRetrieved) => ({
        getPlain: getPlain,
        getTyped: (plainValue: unknown) => {
            try {
                return getTyped(plainValue);
            } catch {
                return fallback;
            }
        },
        isArray,
    });

    return Object.assign(getType, { getPlain, getTyped, isArray }) as CallableType<TOriginal, TPlain, TRetrieved>;
}
