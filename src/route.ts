import { PathParams, PathProcessor } from "./path";
import { QueryProcessor } from "./query";
import { HashProcessor } from "./hash";
import { match } from "react-router";
import * as H from "history";
import { isDefined } from "./helpers";

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
        return pathProcessor.stringify(path);
    }

    function buildQuery(query: TInQuery): string {
        return queryProcessor?.stringify(query) || "";
    }

    function buildHash(hash: TInHash): string {
        return hashProcessor?.stringify(hash) || "";
    }

    function parse(matchOrParams: PathParams | match | null): { path: TOutPath };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: H.Location
    ): { path: TOutPath; query: TOutQuery; hash: TOutHash };
    function parse(
        matchOrParams: PathParams | match | null,
        location?: H.Location
    ): { path: TOutPath; query?: TOutQuery; hash?: TOutHash } {
        return {
            path: parsePath(matchOrParams),
            query: location && parseQuery(location.search),
            hash: location && parseHash(location.hash),
        };
    }

    function parsePath(matchOrParams: PathParams | match | null): TOutPath {
        return pathProcessor.parse(matchOrParams);
    }

    function parseQuery(query: string): TOutQuery {
        return queryProcessor?.parse(query) as TOutQuery;
    }

    function parseHash(hash: string): TOutHash {
        return hashProcessor?.parse(hash) as TOutHash;
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
