import { RouteTypes } from "./createRoute/index.js";
import { mergeHashValues } from "./mergeHashValues.js";

export type Compose<TPathTypes, TSearchTypes, THash extends string[], TStateTypes> = RouteTypes<
    TPathTypes,
    TSearchTypes,
    THash,
    TStateTypes
> &
    (<TChildPathTypes, TChildSearchTypes, TChildHash extends string[], TChildStateTypes>(
        types:
            | {
                  types: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>;
              }
            | RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>
    ) => Compose<
        TPathTypes & TChildPathTypes,
        TSearchTypes & TChildSearchTypes,
        THash | TChildHash,
        TStateTypes & TChildStateTypes
    >);

export function compose<TPathTypes, TSearchTypes, THash extends string[], TStateTypes>(
    types:
        | {
              types: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>;
          }
        | RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes>
): Compose<TPathTypes, TSearchTypes, THash, TStateTypes> {
    const normalizedTypes: RouteTypes<TPathTypes, TSearchTypes, THash, TStateTypes> =
        "types" in types ? types.types : types;

    const result = <TChildPathTypes, TChildSearchTypes, TChildHash extends string[], TChildStateTypes>(
        childTypes:
            | {
                  types: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>;
              }
            | RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes>
    ) => {
        const normalizedChildTypes: RouteTypes<TChildPathTypes, TChildSearchTypes, TChildHash, TChildStateTypes> =
            "types" in childTypes ? childTypes.types : childTypes;

        return compose({
            types: {
                params: { ...normalizedTypes.params, ...normalizedChildTypes.params },
                searchParams: { ...normalizedTypes.searchParams, ...normalizedChildTypes.searchParams },
                state: { ...normalizedTypes.state, ...normalizedChildTypes.state },
                hash: mergeHashValues(normalizedTypes.hash, normalizedChildTypes.hash),
            },
        });
    };

    return Object.assign(result, normalizedTypes) as Compose<TPathTypes, TSearchTypes, THash, TStateTypes>;
}
