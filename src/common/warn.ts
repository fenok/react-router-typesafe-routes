export function warn(message: string) {
    if (process.env.NODE_ENV !== "production") {
        console.warn(`[react-router-typesafe-routes] ${message}`);
    }
}
