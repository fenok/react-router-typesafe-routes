import { match } from "react-router";

export type PathParams = { [K in string]?: string };

export interface PathProcessor<TPath extends string, TInPath, TOutPath> {
    build(path: TInPath): string;
    parse(matchOrParams: PathParams | match | null): TOutPath;
    path: TPath;
}
