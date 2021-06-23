import { ExtractRouteParams, generatePath, match } from "react-router";
import { GenericPathParams, PathProcessor } from "./interface";
import { Key, parse } from "path-to-regexp";
import { Caster } from "./casters";

export type ToGenericPathParams<T> = {
    [TKey in keyof T]: T[TKey] extends string | undefined ? T[TKey] : string;
};

export type ParamsFromCasters<T> = {
    [Key in keyof T]: T[Key] extends Caster<infer Type> | Caster<infer Type>[] ? Type : never;
};

export function path<
    Path extends string,
    ExtractedPath = ExtractRouteParams<Path>,
    T extends {
        [Key in keyof Partial<ExtractedPath>]?: Caster<string | number | boolean> | Caster<string | number | boolean>[];
    } = {}
>(
    path: Path,
    shape?: T
): PathProcessor<
    Path,
    ExtractRouteParams<Path> & ParamsFromCasters<T>,
    (ToGenericPathParams<ExtractRouteParams<Path>> & ParamsFromCasters<T>) | undefined
> {
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

    function cast(params: GenericPathParams) {
        const result: Record<string, any> = {};

        Object.keys(params).forEach((key) => {
            const casterOrCasterArray = shape && shape[key as keyof ExtractedPath];
            const caster: Caster<string | number | boolean> | undefined = Array.isArray(casterOrCasterArray)
                ? casterOrCasterArray[0]
                : casterOrCasterArray;
            result[key] = caster ? caster.cast(params[key]) : params[key];
        });

        return result;
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
                    return cast(matchOrParams.params) as ToGenericPathParams<ExtractRouteParams<Path>> &
                        ParamsFromCasters<T>;
                }
            } else if (areParamsSufficient(matchOrParams)) {
                return cast(matchOrParams) as ToGenericPathParams<ExtractRouteParams<Path>> & ParamsFromCasters<T>;
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
