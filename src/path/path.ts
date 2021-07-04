import { ExtractRouteParams, generatePath, match } from "react-router";
import { PathParams, PathProcessor } from "./PathProcessor";
import { Key, parse } from "path-to-regexp";
import { OriginalParams, retrieve, RetrievedParams, store, Transformer } from "../param";

export function path<TPath extends string>(
    path: TPath
): PathProcessor<TPath, ExtractRouteParams<TPath>, ExtractRouteParams<TPath, string> | undefined>;

export function path<
    TPath extends string,
    TTransformers extends Record<string, Transformer<unknown, string | undefined>>
>(
    path: TPath,
    transformers: TTransformers
): PathProcessor<TPath, OriginalParams<TTransformers>, RetrievedParams<TTransformers> | undefined>;

export function path(
    path: string,
    transformers?: Record<string, Transformer<unknown, string | undefined>>
): PathProcessor<string, Record<string, unknown>, Record<string, unknown> | undefined> {
    const { areParamsSufficient } = sufficientParams(path);

    return {
        path,
        build(params: Record<string, unknown>): string {
            return generatePath(
                path,
                transformers ? store(params, transformers) : (params as ExtractRouteParams<string>)
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

function sufficientParams(path: string) {
    let requiredParams: string[];

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
        areParamsSufficient(this: void, params: PathParams) {
            return getRequiredParams().every((requiredParam) => requiredParam in params);
        },
    };
}
