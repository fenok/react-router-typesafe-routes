import { Merge } from "./helpers.js";

type Types<TPathTypes, TSearchTypes, THash extends string, TStateTypes> = RouteTypes<
    TPathTypes,
    TSearchTypes,
    THash,
    TStateTypes
> &
    (<TChildPathTypes, TChildSearchTypes, TChildHash extends string, TChildStateTypes>(
        typesOrRoute:
            | {
                  types: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>;
              }
            | RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>
    ) => Types<
        Merge<TPathTypes, TChildPathTypes>,
        Merge<TSearchTypes, TChildSearchTypes>,
        THash | TChildHash,
        Merge<TStateTypes, TChildStateTypes>
    >);

interface RouteTypes<TPathTypes, TSearchTypes, THash extends string, TStateTypes> {
    params?: TPathTypes;
    searchParams?: TSearchTypes;
    hash?: ReadonlyArray<THash>;
    state?: TStateTypes;
}

type MergeTypesArray<T extends readonly unknown[]> = T extends readonly [infer TFirst, infer TSecond, ...infer TRest]
    ? MergeTypesArray<[MergeTypesArrayItems<TFirst, TSecond>, ...TRest]>
    : T extends readonly [infer TFirst]
    ? TFirst
    : never;

type MergeTypesArrayItems<T, U> = T extends RouteTypes<infer TPathTypes, infer TSearchTypes, infer THash, infer TState>
    ? U extends RouteTypes<infer TChildPathTypes, infer TChildSearchTypes, infer TChildHash, infer TChildState>
        ? RouteTypes<
              Merge<TPathTypes, TChildPathTypes>,
              Merge<TSearchTypes, TChildSearchTypes>,
              string extends THash
                  ? string extends TChildHash
                      ? never
                      : TChildHash
                  : string extends TChildHash
                  ? THash
                  : TChildHash | THash,
              Merge<TState, TChildState>
          >
        : never
    : never;

function arrTypes<T extends readonly RouteTypes<any, any, any, any>[]>(types: T): MergeTypesArray<T> {
    // TODO
    return {} as any;
}

function types<TPathTypes, TSearchTypes, THash extends string, TStateTypes>(
    typesOrRoute:
        | {
              types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>;
          }
        | RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>
): Types<TPathTypes, TSearchTypes, THash, TStateTypes> {
    const normalizedTypes: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> =
        "types" in typesOrRoute ? typesOrRoute.types : typesOrRoute;

    const result = <TChildPathTypes, TChildSearchTypes, TChildHash extends string, TChildStateTypes>(
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

function mergeHashValues<T, U>(firstHash?: readonly T[], secondHash?: readonly U[]): (T | U)[] | undefined {
    if (!firstHash && !secondHash) {
        return undefined;
    }

    if (firstHash?.length === 0 || secondHash?.length === 0) {
        return [];
    }

    return [...(firstHash ?? []), ...(secondHash ?? [])];
}

export { types, Types, RouteTypes, arrTypes };
