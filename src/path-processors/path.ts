import { ExtractRouteParams, generatePath, match } from "react-router";
import { GenericPathParams, PathProcessor } from "./interface";
import { Key, parse } from "path-to-regexp";
import { Caster } from "./casters";

export type ToGenericPathParams<T> = {
    [TKey in keyof T]: T[TKey] extends string | undefined ? T[TKey] : string;
};

export type ParamsFromCasters<T> = {
    [TKey in keyof T]?: T[TKey] extends Caster<infer Type> | Caster<infer Type>[] ? Type : never;
} &
    {
        [TKey in RequiredKeys<T>]: T[TKey] extends Caster<infer Type> | Caster<infer Type>[] ? Type : never;
    };

export type RequiredKeys<T> = {
    [TKey in keyof T]: T[TKey] extends Caster<infer Type> | Caster<infer Type>[]
        ? undefined extends Type
            ? never
            : TKey
        : never;
}[keyof T];

export function path<
    Path extends string,
    T extends {
        [Key in string]:
            | Caster<string | number | boolean | undefined>
            | Caster<string | number | boolean | undefined>[];
    } = {}
>(
    path: Path,
    shape?: T
): PathProcessor<
    Path,
    {} extends T ? ExtractRouteParams<Path> : ParamsFromCasters<T>,
    ({} extends T ? ToGenericPathParams<ExtractRouteParams<Path>> : ParamsFromCasters<T>) | undefined
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
        if (shape) {
            const result: Record<string, any> = {};
            Object.keys(params).forEach((key) => {
                const casterOrArray = shape[key];

                if (casterOrArray) {
                    const casters: Caster<string | number | boolean | undefined>[] = Array.isArray(casterOrArray)
                        ? casterOrArray
                        : [casterOrArray];

                    for (const caster of casters) {
                        try {
                            result[key] = caster.cast(params[key]);
                            break;
                        } catch {
                            if (casters[casters.length - 1] === caster) {
                                throw new Error(
                                    `Couldn't cast parameter ${key}:${params[key]!} with any of the given casters`
                                );
                            }
                            // Otherwise try next caster
                        }
                    }
                } else {
                    result[key] = params[key];
                }
            });
            return result;
        }

        return params;
    }

    return {
        path,
        stringify(params: {} extends T ? ExtractRouteParams<Path> : ParamsFromCasters<T>): string {
            return generatePath(path, params as any);
        },
        parse(
            matchOrParams: GenericPathParams | match | null
        ): ({} extends T ? ToGenericPathParams<ExtractRouteParams<Path>> : ParamsFromCasters<T>) | undefined {
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
