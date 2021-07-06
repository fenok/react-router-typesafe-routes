import { match, useLocation } from "react-router";
import { PathParams, PathProcessor } from "./path";
import { QueryProcessor } from "./query";
import { HashProcessor } from "./hash";
import { StateProcessor } from "./state";
import { isDefined } from "./helpers";

type Location = ReturnType<typeof useLocation>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function route<
    TPath extends string,
    TInPath,
    TOutPath,
    TInQuery = undefined,
    TOutQuery = undefined,
    TInHash = undefined,
    TOutHash = undefined,
    TInState = undefined,
    TSerializableState = undefined,
    TOutState = undefined
>(
    pathProcessor: PathProcessor<TPath, TInPath, TOutPath>,
    queryProcessor?: QueryProcessor<TInQuery, TOutQuery> | null,
    hashProcessor?: HashProcessor<TInHash, TOutHash> | null,
    stateProcessor?: StateProcessor<TInState, TSerializableState, TOutState> | null
) {
    function build(path: TInPath, query?: TInQuery | null, hash?: TInHash | null) {
        return `${buildPath(path)}${isDefined(query) ? buildQuery(query) : ""}${
            isDefined(hash) ? buildHash(hash) : ""
        }`;
    }

    function buildLocation(state: TInState, path: TInPath, query?: TInQuery | null, hash?: TInHash | null) {
        return {
            state: buildState(state),
            pathname: buildPath(path),
            search: isDefined(query) ? buildQuery(query) : undefined,
            hash: isDefined(hash) ? buildHash(hash) : undefined,
        };
    }

    function buildPath(path: TInPath): string {
        return pathProcessor.build(path);
    }

    function buildQuery(query: TInQuery): string {
        return queryProcessor?.build(query) || "";
    }

    function buildHash(hash: TInHash): string {
        return hashProcessor?.build(hash) || "";
    }

    function buildState(state: TInState): TSerializableState {
        return stateProcessor?.build(state) as TSerializableState;
    }

    function parse(matchOrParams: PathParams | match | null): { path: TOutPath };
    function parse(
        matchOrParams: PathParams | match | null,
        location: Location
    ): { path: TOutPath; query: TOutQuery; hash: TOutHash; state: TOutState };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: Location
    ): { path: TOutPath; query?: TOutQuery; hash?: TOutHash; state?: TOutState };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: Location
    ): { path: TOutPath; query?: TOutQuery; hash?: TOutHash; state?: TOutState } {
        return {
            path: parsePath(matchOrParams),
            query: location && parseQuery(location),
            hash: location && parseHash(location),
            state: location && parseState(location),
        };
    }

    function parsePath(matchOrParams: PathParams | match | null): TOutPath {
        return pathProcessor.parse(matchOrParams);
    }

    function parseQuery(location: Location): TOutQuery {
        return queryProcessor?.parse(location.search) as TOutQuery;
    }

    function parseHash(location: Location): TOutHash {
        return hashProcessor?.parse(location.hash) as TOutHash;
    }

    function parseState(location: Location): TOutState {
        return stateProcessor?.parse(location.state) as TOutState;
    }

    return {
        path: pathProcessor.path,
        build,
        buildLocation,
        buildPath,
        buildQuery,
        buildHash,
        buildState,
        parse,
        parsePath,
        parseQuery,
        parseHash,
        parseState,
    };
}
