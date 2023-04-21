const WARNED: { [key: string]: boolean } = {};

export function warn(message: string) {
    if (process.env.NODE_ENV !== "production" && !WARNED[message]) {
        console.warn(`[react-router-typesafe-routes] ${message}`);
        WARNED[message] = true;
    }
}
