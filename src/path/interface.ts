import { match } from "react-router";

export type GenericPathParams = Record<string, string | undefined>;

export interface PathProcessor<TPath extends string, TInPath, TOutPath> {
    stringify(path: TInPath): string;
    parse(matchOrParams: GenericPathParams | match | null): TOutPath;
    path: TPath;
}
