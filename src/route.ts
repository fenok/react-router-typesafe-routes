import { GenericPathParams, PathProcessor } from "./path";
import { QueryProcessor } from "./query";
import { HashProcessor } from "./hash";
import { match } from "react-router";
import * as H from "history";

export type OutPathPart<TOutPath> = { path: TOutPath };
export type OutLocationPart<TOutQuery, TOutHash> = { query: TOutQuery; hash: TOutHash };
export type OutEmptyLocationPart = { query: undefined; hash: undefined };

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
        return `${buildPath(path)}${query ? buildQuery(query) : ""}${hash ? buildHash(hash) : ""}`;
    }

    function buildPath(pathParams: TInPath): string {
        return pathProcessor.stringify(pathParams);
    }

    function buildQuery(queryParams: TInQuery): string {
        return queryProcessor?.stringify(queryParams) || "";
    }

    function buildHash(hashValue: TInHash): string {
        return hashProcessor?.stringify(hashValue) || "";
    }

    function parse(matchOrParams: GenericPathParams | match | null): OutPathPart<TOutPath> & OutEmptyLocationPart;
    function parse(
        matchOrParams: GenericPathParams | match | null,
        location?: H.Location
    ): OutPathPart<TOutPath> & OutLocationPart<TOutQuery, TOutHash>;
    function parse(
        matchOrParams: GenericPathParams | match | null,
        location?: H.Location
    ): OutPathPart<TOutPath> & Partial<OutLocationPart<TOutQuery, TOutHash>> {
        return {
            path: parsePath(matchOrParams),
            query: location && parseQuery(location.search),
            hash: location && parseHash(location.hash),
        };
    }

    function parsePath(matchOrParams: GenericPathParams | match | null): TOutPath {
        return pathProcessor.parse(matchOrParams);
    }

    function parseQuery(queryString: string): TOutQuery {
        return queryProcessor?.parse(queryString) as TOutQuery;
    }

    function parseHash(hashString: string): TOutHash {
        return hashProcessor?.parse(hashString) as TOutHash;
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
