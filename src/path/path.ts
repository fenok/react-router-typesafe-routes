import { ExtractRouteParams, generatePath, match } from "react-router";
import { PathParams, PathProcessor } from "./PathProcessor";
import { Key, parse } from "path-to-regexp";
import { Params, retrieve, store, Transformer } from "../param";

export function path<TPath extends string>(
    path: TPath
): PathProcessor<TPath, ExtractRouteParams<TPath>, ExtractRouteParams<TPath, string> | undefined>;

export function path<
    TPath extends string,
    TTransformers extends Record<string, Transformer<unknown, string | undefined>>
>(
    path: TPath,
    transformers: TTransformers
): PathProcessor<TPath, Params<TTransformers, true>, Params<TTransformers> | undefined>;

export function path(
    path: string,
    transformers?: Record<string, Transformer<unknown, string | undefined>>
): PathProcessor<string, Record<string, unknown>, Record<string, unknown> | undefined> {
    let requiredParams: string[];

    function areParamsSufficient(params: PathParams) {
        return getRequiredParams().every((requiredParam) => requiredParam in params);
    }

    function getRequiredParams() {
        requiredParams =
            requiredParams ||
            parse(path)
                .filter(
                    (keyOrString) => typeof keyOrString !== "string" && !keyOrString.optional && !keyOrString.asterisk
                )
                .map((key) => (key as Key).name);

        return requiredParams;
    }

    return {
        path,
        build(params: Record<string, unknown>): string {
            return generatePath(
                path,
                transformers ? store(params, transformers) : (params as Record<string, string | undefined>)
            );
        },
        parse(matchOrParams: PathParams | match | null): Record<string, unknown> | undefined {
            if (isMatch(matchOrParams)) {
                if (matchOrParams && matchOrParams.path === path) {
                    return transformers ? retrieve(matchOrParams.params, transformers) : matchOrParams.params;
                }
            } else if (transformers || areParamsSufficient(matchOrParams)) {
                return transformers ? retrieve(matchOrParams, transformers) : matchOrParams;
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
