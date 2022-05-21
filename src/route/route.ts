type Route<TParams extends Record<string, unknown>, TChildren> = {
    (params: TParams): TChildren extends Record<string, Route<infer U, infer C>> ? TChildren : string;
};

function route<TParams extends Record<string, unknown>, TChildren>(
    path: string,
    params: TParams,
    children: TChildren
): Route<TParams, TChildren> {
    const fn = ((params: TParams) => {
        return typeof children === "object" ? children : "nope";
    }) as Route<TParams, TChildren>;

    return fn;
}

export { route };
