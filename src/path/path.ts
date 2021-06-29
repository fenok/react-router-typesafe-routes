import { ExtractRouteParams, generatePath, match } from "react-router";
import { GenericPathParams, PathProcessor } from "./interface";
import { Key, parse } from "path-to-regexp";
import { applyCasters, Caster } from "../param";

export type ToGenericPathParams<T> = {
    [TKey in keyof T]: T[TKey] extends string | undefined ? T[TKey] : string;
};

export type PathParams<TCasters, TLoose extends boolean = false> = {
    [TKey in keyof TCasters]?: TCasters[TKey] extends Caster<infer TType> | Caster<infer TType>[]
        ? TLoose extends true
            ? LoosePathType<TType>
            : TType
        : never;
} &
    {
        [TKey in RequiredKeys<TCasters>]: TCasters[TKey] extends Caster<infer TType> | Caster<infer TType>[]
            ? TLoose extends true
                ? LoosePathType<TType>
                : TType
            : never;
    };

export type LoosePathType<T> = string extends T ? T | number | boolean : T;

export type RequiredKeys<T> = {
    [TKey in keyof T]: T[TKey] extends Caster<infer TType> | Caster<infer TType>[]
        ? undefined extends TType
            ? never
            : TKey
        : never;
}[keyof T];

export function path<TPath extends string>(
    path: TPath
): PathProcessor<TPath, ExtractRouteParams<TPath>, ToGenericPathParams<ExtractRouteParams<TPath>> | undefined>;

export function path<
    TPath extends string,
    TCasters extends Record<
        string,
        Caster<string | number | boolean | undefined> | Caster<string | number | boolean | undefined>[]
    >
>(path: TPath, shape: TCasters): PathProcessor<TPath, PathParams<TCasters, true>, PathParams<TCasters> | undefined>;

export function path(
    path: string,
    shape?: Record<
        string,
        Caster<string | number | boolean | undefined> | Caster<string | number | boolean | undefined>[]
    >
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

    function cast(params: GenericPathParams) {
        if (shape) {
            const castedParams: Record<string, any> = {};

            try {
                Object.keys(shape).forEach((key) => {
                    const value = applyCasters(params[key], ...[shape[key]].flat());

                    if (value !== undefined) {
                        castedParams[key] = value;
                    }
                });
            } catch {
                return undefined;
            }

            return { ...params, ...castedParams };
        } else {
            return params;
        }
    }

    return {
        path,
        stringify(params: Record<string, any>): string {
            return generatePath(path, params);
        },
        parse(matchOrParams: GenericPathParams | match | null): Record<string, any> | undefined {
            if (isMatch(matchOrParams)) {
                if (matchOrParams && matchOrParams.path === path) {
                    return cast(matchOrParams.params);
                }
            } else if (shape || areParamsSufficient(matchOrParams)) {
                return cast(matchOrParams);
            }
        },
    };
}

function isMatch(matchCandidate: Record<string, string | undefined> | match | null): matchCandidate is match | null {
    return matchCandidate === null || typeof (matchCandidate as match).params === "object";
}
