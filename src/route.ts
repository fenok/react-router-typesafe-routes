import { PathParams, PathProcessor } from "./path";
import { QueryProcessor } from "./query";
import { HashProcessor } from "./hash";
import { match, useLocation } from "react-router";
import { isDefined } from "./helpers";

type Location = ReturnType<typeof useLocation>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function route<
    TPath extends string,
    TInPath,
    TOutPath,
    TInQuery = never,
    TOutQuery = never,
    TInHash = never,
    TOutHash = never
>(
    pathProcessor: PathProcessor<TPath, TInPath, TOutPath>,
    queryProcessor?: QueryProcessor<TInQuery, TOutQuery> | null,
    hashProcessor?: HashProcessor<TInHash, TOutHash> | null
) {
    function build(path: TInPath, query?: TInQuery | null, hash?: TInHash | null) {
        return `${buildPath(path)}${isDefined(query) ? buildQuery(query) : ""}${
            isDefined(hash) ? buildHash(hash) : ""
        }`;
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

    function parse(matchOrParams: PathParams | match | null): { path: TOutPath };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: Location
    ): { path: TOutPath; query: TOutQuery; hash: TOutHash };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: Location
    ): { path: TOutPath; query?: TOutQuery; hash?: TOutHash } {
        return {
            path: parsePath(matchOrParams),
            query: location && parseQuery(location),
            hash: location && parseHash(location),
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

    return {
        path: pathProcessor.path,
        build,
        buildPath,
        buildQuery,
        buildHash,
        parse,
        parsePath,
        parseQuery,
        parseHash,
    };
}
