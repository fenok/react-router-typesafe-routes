type Types<TPathTypes, TSearchTypes, THash extends string[], TStateTypes> = RouteTypes<
    TPathTypes,
    TSearchTypes,
    THash,
    TStateTypes
> &
    (<TChildPathTypes, TChildSearchTypes, TChildHash extends string[], TChildStateTypes>(
        typesOrRoute:
            | {
                  types: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>;
              }
            | RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>
    ) => Types<
        TPathTypes & TChildPathTypes,
        TSearchTypes & TChildSearchTypes,
        THash | TChildHash,
        TStateTypes & TChildStateTypes
    >);

interface RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> {
    params?: TPathTypes;
    searchParams?: TSearchTypes;
    hash?: THash;
    state?: TStateTypes;
}

function types<TPathTypes, TSearchTypes, THash extends string[], TStateTypes>(
    typesOrRoute:
        | {
              types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>;
          }
        | RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>
): Types<TPathTypes, TSearchTypes, THash, TStateTypes> {
    const normalizedTypes: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> =
        "types" in typesOrRoute ? typesOrRoute.types : typesOrRoute;

    const result = <TChildPathTypes, TChildSearchTypes, TChildHash extends string[], TChildStateTypes>(
        childTypesOrRoute:
            | {
                  types: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>;
              }
            | RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>
    ) => {
        const normalizedChildTypes: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes> =
            "types" in childTypesOrRoute ? childTypesOrRoute.types : childTypesOrRoute;

        return types({
            types: {
                params: { ...normalizedTypes.params, ...normalizedChildTypes.params },
                searchParams: { ...normalizedTypes.searchParams, ...normalizedChildTypes.searchParams },
                state: { ...normalizedTypes.state, ...normalizedChildTypes.state },
                hash: mergeHashValues(normalizedTypes.hash, normalizedChildTypes.hash),
            },
        });
    };

    return Object.assign(result, normalizedTypes) as Types<TPathTypes, TSearchTypes, THash, TStateTypes>;
}

function mergeHashValues<T, U>(firstHash?: T[], secondHash?: U[]): (T | U)[] | undefined {
    if (!firstHash && !secondHash) {
        return undefined;
    }

    if (firstHash?.length === 0 || secondHash?.length === 0) {
        return [];
    }

    return [...(firstHash ?? []), ...(secondHash ?? [])];
}

export { types, Types, RouteTypes };
