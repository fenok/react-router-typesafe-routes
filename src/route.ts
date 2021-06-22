import { GenericPathParams, PathProcessor } from "./path-processors";
import { QueryProcessor } from "./query-processors";
import { HashProcessor } from "./hash-processors";
import { match } from "react-router";
import * as H from "history";

export interface RouteParams<Path extends string, InPath, OutPath, InQuery, OutQuery, InHash, OutHash> {
    path: PathProcessor<Path, InPath, OutPath>;
    query?: QueryProcessor<InQuery, OutQuery>;
    hash?: HashProcessor<InHash, OutHash>;
}

export type BuildParams<InPath, InQuery, InHash> = (keyof InPath extends never ? { path?: InPath } : { path: InPath }) &
    (keyof InQuery extends never ? { query?: InQuery } : { query: InQuery }) &
    (keyof InHash extends never ? { hash?: InHash } : { hash: InHash });

export type OutPathPart<OutPath> = { path: OutPath };
export type OutLocationPart<OutQuery, OutHash> = { query: OutQuery; hash: OutHash };
export type OutEmptyLocationPart = { query: undefined; hash: undefined };

export function route<Path extends string, InPath, OutPath, InQuery, OutQuery, InHash, OutHash>({
    path,
    query,
    hash,
}: RouteParams<Path, InPath, OutPath, InQuery, OutQuery, InHash, OutHash>) {
    function build(params: BuildParams<InPath, InQuery, InHash>) {
        return `${params.path ? buildPath(params.path) : path.path}${params.query ? buildQuery(params.query) : ""}${
            params.hash ? buildHash(params.hash) : ""
        }`;
    }

    function buildPath(pathParams: InPath): string {
        return path.stringify(pathParams);
    }

    function buildQuery(queryParams: InQuery): string {
        return query?.stringify(queryParams) || "";
    }

    function buildHash(hashValue: InHash): string {
        return hash?.stringify(hashValue) || "";
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
            ...parseLocation(location),
        };
    }

    function parseLocation(): OutEmptyLocationPart;
    function parseLocation(location?: H.Location): OutLocationPart<OutQuery, OutHash>;
    function parseLocation(location?: H.Location) {
        return {
            query: location && parseQuery(location.search),
            hash: location && parseHash(location.hash),
        };
    }

    function parsePath(matchOrParams: GenericPathParams | match | null): OutPath {
        return path.parse(matchOrParams);
    }

    function parseQuery(queryString: string): OutQuery {
        return query?.parse(queryString) as OutQuery;
    }

    function parseHash(hashString: string): OutHash {
        return hash?.parse(hashString) as OutHash;
    }

    return {
        path: path.path,
        build,
        buildPath,
        buildQuery,
        buildHash,
        parse,
        parseLocation,
        parsePath,
        parseQuery,
        parseHash,
    };
}
