import { GenericPathParams, PathProcessor } from "./path-processors";
import { QueryProcessor } from "./query-processors";
import { HashProcessor } from "./hash-processors";
import { match } from "react-router";
import * as H from "history";

export type OutPathPart<OutPath> = { path: OutPath };
export type OutLocationPart<OutQuery, OutHash> = { query: OutQuery; hash: OutHash };
export type OutEmptyLocationPart = { query: undefined; hash: undefined };

export function route<
    Path extends string,
    InPath,
    OutPath,
    InQuery = never,
    OutQuery = never,
    InHash = never,
    OutHash = never
>(
    pathProcessor: PathProcessor<Path, InPath, OutPath>,
    queryProcessor?: QueryProcessor<InQuery, OutQuery> | null,
    hashProcessor?: HashProcessor<InHash, OutHash> | null
) {
    function build(path: InPath, query?: InQuery | null, hash?: InHash | null) {
        return `${path ? buildPath(path) : pathProcessor.path}${query ? buildQuery(query) : ""}${
            hash ? buildHash(hash) : ""
        }`;
    }

    function buildPath(pathParams: InPath): string {
        return pathProcessor.stringify(pathParams);
    }

    function buildQuery(queryParams: InQuery): string {
        return queryProcessor?.stringify(queryParams) || "";
    }

    function buildHash(hashValue: InHash): string {
        return hashProcessor?.stringify(hashValue) || "";
    }

    function parse(matchOrParams: GenericPathParams | match | null): OutPathPart<OutPath> & OutEmptyLocationPart;
    function parse(
        matchOrParams: GenericPathParams | match | null,
        location?: H.Location
    ): OutPathPart<OutPath> & OutLocationPart<OutQuery, OutHash>;
    function parse(
        matchOrParams: GenericPathParams | match | null,
        location?: H.Location
    ): OutPathPart<OutPath> & Partial<OutLocationPart<OutQuery, OutHash>> {
        return {
            path: parsePath(matchOrParams),
            query: location && parseQuery(location.search),
            hash: location && parseHash(location.hash),
        };
    }

    function parsePath(matchOrParams: GenericPathParams | match | null): OutPath {
        return pathProcessor.parse(matchOrParams);
    }

    function parseQuery(queryString: string): OutQuery {
        return queryProcessor?.parse(queryString) as OutQuery;
    }

    function parseHash(hashString: string): OutHash {
        return hashProcessor?.parse(hashString) as OutHash;
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
