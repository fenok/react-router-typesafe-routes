import * as H from "history";
import { Key, parse as ptrParse } from "path-to-regexp";
import queryString, { ParseOptions, StringifiableRecord, StringifyOptions } from "query-string";
import { ExtractRouteParams, generatePath, match } from "react-router";

// TODO: allow to override inferred path type
export type OuterParams<
    TQuery extends StringifiableRecord = StringifiableRecord,
    THash extends string = string,
    TState = unknown
> = {
    query?: TQuery;
    hash?: THash;
    state?: TState;
};

export type BuildParams<TBaseParams extends OuterParams, TParams extends OuterParams, TInferredPath> = TBaseParams &
    TParams &
    (keyof TInferredPath extends never ? { path?: TInferredPath } : { path: TInferredPath });

export type Define<T, U> = undefined extends T ? U : T;

// Location can be updated to any values by user or third-party code
export type ParsedLocation<TBaseParams extends OuterParams, TParams extends OuterParams> = {
    // TODO: Narrow type depending on passed options (parseNumbers and parseBooleans)
    query?: {
        [TQueryKey in keyof (TBaseParams & TParams)["query"]]?: ParsedQueryValue<string | boolean | number>;
    };
    hash?: (TBaseParams & TParams)["hash"] | string;
    state?: { [TStateKey in keyof (TBaseParams & TParams)["state"]]?: unknown };
};

export type CastedLocation<TBaseParams extends OuterParams, TParams extends OuterParams> = TBaseParams & TParams;

export type CastedParams<
    TBaseParams extends OuterParams,
    TParams extends OuterParams,
    TInferredPath
> = ParsedPath<TInferredPath> & CastedLocation<TBaseParams, TParams>;

export type ParsedPath<TInferredPath> = {
    // Path params are always parsed as 'string' by react-router, and the match.params field always exists
    path: {
        [TPathKey in keyof TInferredPath]: TInferredPath[TPathKey] extends string | undefined
            ? TInferredPath[TPathKey]
            : string;
    };
};

export type ParsedQueryValue<T> = T | T[] | null;

export type ParsedParams<
    TBaseParams extends OuterParams,
    TParams extends OuterParams,
    TInferredPath
> = ParsedPath<TInferredPath> & ParsedLocation<TBaseParams, TParams>;

export interface Options {
    stringify?: StringifyOptions;
    parse?: ParseOptions;
}

export function routeGroup<TBaseParams extends OuterParams>(baseOptions: Options = {}) {
    return function route<TParams extends OuterParams>(options: Options = {}) {
        const mergedOptions = mergeOptions(baseOptions, options);

        function mergeOptions(a: Options, b: Options): Options {
            return {
                stringify: { ...a.stringify, ...b.stringify },
                parse: { ...a.parse, ...b.parse },
            };
        }

        return function innerRoute<TString extends string, TInferredPath = ExtractRouteParams<TString>>(path: TString) {
            function build(params: BuildParams<TBaseParams, TParams, TInferredPath>) {
                return `${buildPath(params.path as any)}${buildQuery(params.query as any)}${buildHash(
                    params.hash as any
                )}`;
            }

            function buildObject(params: BuildParams<TBaseParams, TParams, TInferredPath>): H.Location {
                return {
                    pathname: buildPath(params.path as any),
                    search: buildQuery(params.query as any),
                    hash: buildHash(params.hash as any),
                    state: buildState(params.state as any),
                };
            }

            function buildPath(params: BuildParams<TBaseParams, TParams, TInferredPath>["path"]) {
                return `${generatePath(path, params)}`;
            }

            // TODO: allow passing location to build query on top of it
            function buildQuery(query: BuildParams<TBaseParams, TParams, TInferredPath>["query"]) {
                return query && Object.keys(query).length
                    ? `?${queryString.stringify(query, mergedOptions.stringify)}`
                    : "";
            }

            function buildHash(hash: BuildParams<TBaseParams, TParams, TInferredPath>["hash"]) {
                const normalizedHash = normalizeHash(hash || "");

                if (normalizedHash) {
                    return `#${normalizedHash}`;
                }

                return "";
            }

            function buildState(
                state: BuildParams<TBaseParams, TParams, TInferredPath>["state"]
            ): BuildParams<TBaseParams, TParams, TInferredPath>["state"] {
                return state;
            }

            function normalizeHash(hash: string) {
                return hash[0] === "#" ? hash.substr(1) : hash;
            }

            function parse(
                matchOrParams: Record<string, string | undefined> | match | null,
                location?: H.Location
            ): ParsedParams<TBaseParams, TParams, TInferredPath> | null {
                const { query, hash, state } = parseLocation(location);

                if (isMatch(matchOrParams)) {
                    if (matchOrParams && matchOrParams.path === path) {
                        return { path: matchOrParams.params as any, query, hash, state };
                    }
                } else if (areParamsSufficient(matchOrParams)) {
                    return { path: matchOrParams as any, query, hash, state };
                }

                return null;
            }

            function parseLocation(location?: H.Location): ParsedLocation<TBaseParams, TParams> {
                const query = location && queryString.parse(location.search, mergedOptions.parse);
                const hash = location && normalizeHash(location.hash);

                return { query: query as any, hash, state: location?.state as any };
            }

            function isMatch(
                matchCandidate: Record<string, string | undefined> | match | null
            ): matchCandidate is match | null {
                return matchCandidate === null || typeof (matchCandidate as match).params === "object";
            }

            function areParamsSufficient(params: Record<string, string | undefined>) {
                return getRequiredParams().every((requiredParam) => requiredParam in params);
            }

            let requiredParams: string[];

            function getRequiredParams() {
                requiredParams =
                    requiredParams ||
                    ptrParse(path)
                        .filter(
                            (keyOrString) =>
                                typeof keyOrString !== "string" && !keyOrString.optional && !keyOrString.asterisk
                        )
                        .map((key) => (key as Key).name);

                return requiredParams;
            }

            return {
                build,
                buildObject,
                buildState,
                parse,
                parseLocation,
                path,
            };
        };
    };
}
