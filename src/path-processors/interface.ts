import { match } from "react-router";

export type GenericPathParams = Record<string, string | undefined>;

export interface PathProcessor<Path extends string, InPath, OutPath> {
    stringify(path: InPath): string;
    parse(matchOrParams: GenericPathParams | match | null): OutPath | undefined;
    path: Path;
}
