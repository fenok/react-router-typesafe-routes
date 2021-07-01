import { ExtractRouteParams, generatePath, match } from "react-router";
import { GenericPathParams, PathProcessor } from "./interface";
import { Key, parse } from "path-to-regexp";
import { Params, Transformer } from "../transformer";

export function path<TPath extends string>(
    path: TPath
): PathProcessor<TPath, ExtractRouteParams<TPath>, ExtractRouteParams<TPath, string> | undefined>;

export function path<TPath extends string, TCasters extends Record<string, Transformer<unknown, string | undefined>>>(
    path: TPath,
    shape: TCasters
): PathProcessor<TPath, Params<TCasters, true>, Params<TCasters> | undefined>;

export function path(
    path: string,
    shape?: Record<string, Transformer<unknown, string | undefined>>
): PathProcessor<string, Record<string, any>, Record<string, any> | undefined> {
    let requiredParams: string[];

    function areParamsSufficient(params: GenericPathParams) {
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

    function retrieve(params: GenericPathParams) {
        if (shape) {
            const castedParams: Record<string, any> = {};

            try {
                Object.keys(shape).forEach((key) => {
                    const value = shape[key].retrieve(params[key]);

                    if (value !== undefined) {
                        castedParams[key] = value;
                    }
                });
            } catch {
                return undefined;
            }

            return castedParams;
        } else {
            return params;
        }
    }

    function store(object: Record<string, any>) {
        if (shape) {
            const result: Record<string, any> = {};

            Object.keys(shape).forEach((key) => {
                result[key] = shape[key].store(object[key]);
            });

            return result;
        } else {
            return object;
        }
    }

    return {
        path,
        stringify(params: Record<string, any>): string {
            return generatePath(path, store(params));
        },
        parse(matchOrParams: GenericPathParams | match | null): Record<string, any> | undefined {
            if (isMatch(matchOrParams)) {
                if (matchOrParams && matchOrParams.path === path) {
                    return retrieve(matchOrParams.params);
                }
            } else if (shape || areParamsSufficient(matchOrParams)) {
                return retrieve(matchOrParams);
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
