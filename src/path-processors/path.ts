import { ExtractRouteParams, generatePath, match } from "react-router";
import { GenericPathParams, PathProcessor } from "./interface";
import { Key, parse } from "path-to-regexp";

export type ToGenericPathParams<T> = {
    [TKey in keyof T]: T[TKey] extends string | undefined ? T[TKey] : string;
};

export function path<Path extends string>(
    path: Path
): PathProcessor<Path, ExtractRouteParams<Path>, ToGenericPathParams<ExtractRouteParams<Path>> | undefined> {
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

    return {
        path,
        stringify(params: ExtractRouteParams<Path>): string {
            return generatePath(path, params);
        },
        parse(
            matchOrParams: GenericPathParams | match | null
        ): ToGenericPathParams<ExtractRouteParams<Path>> | undefined {
            if (isMatch(matchOrParams)) {
                if (matchOrParams && matchOrParams.path === path) {
                    return matchOrParams.params as ToGenericPathParams<ExtractRouteParams<Path>>;
                }
            } else if (areParamsSufficient(matchOrParams)) {
                return matchOrParams as ToGenericPathParams<ExtractRouteParams<Path>>;
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
