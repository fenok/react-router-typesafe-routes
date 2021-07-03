import { ExtractRouteParams, generatePath, match } from "react-router";
import { PathParams, PathProcessor } from "./PathProcessor";
import { Key, parse } from "path-to-regexp";
import { Params, Transformer } from "../param";

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

    function retrieve(storedParams: PathParams) {
        if (transformers) {
            const retrievedParams: Record<string, unknown> = {};

            try {
                Object.keys(transformers).forEach((key) => {
                    const value = transformers[key].retrieve(storedParams[key]);

                    if (value !== undefined) {
                        retrievedParams[key] = value;
                    }
                });
            } catch {
                return undefined;
            }

            return retrievedParams;
        } else {
            return storedParams;
        }
    }

    function store(originalParams: Record<string, unknown>): Record<string, string | undefined> {
        if (transformers) {
            const storedParams: Record<string, string | undefined> = {};

            Object.keys(transformers).forEach((key) => {
                storedParams[key] = transformers[key].store(originalParams[key]);
            });

            return storedParams;
        } else {
            return originalParams as Record<string, string | undefined>;
        }
    }

    return {
        path,
        build(params: Record<string, unknown>): string {
            return generatePath(path, store(params));
        },
        parse(matchOrParams: PathParams | match | null): Record<string, unknown> | undefined {
            if (isMatch(matchOrParams)) {
                if (matchOrParams && matchOrParams.path === path) {
                    return retrieve(matchOrParams.params);
                }
            } else if (transformers || areParamsSufficient(matchOrParams)) {
                return retrieve(matchOrParams);
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
