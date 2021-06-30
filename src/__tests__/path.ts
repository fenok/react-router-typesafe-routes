import { route } from "../route";
import { path } from "../path";
import { param } from "../param";
import { assert, IsExact } from "conditional-type-checks";

it("allows path without parameters", () => {
    const testRoute = route(path("/test"));

    assert<IsExact<Parameters<typeof testRoute.buildPath>[0], Record<string, unknown>>>(true);

    expect(testRoute.buildPath({})).toBe("/test");

    // Reminder that any truthy value can be passed, but that's how react-router generatePath is typed
    expect(testRoute.buildPath({ any: "value" })).toBe("/test");

    assert<IsExact<ReturnType<typeof testRoute.parsePath>, Record<string, unknown> | undefined>>(true);

    expect(testRoute.parsePath({})).toEqual({});
    expect(testRoute.parsePath({ params: {}, isExact: false, path: "/test", url: "/test" })).toEqual({});
    expect(
        testRoute.parsePath({
            params: {},
            isExact: false,
            path: "/other-path/:id",
            url: "/other-path/1",
        })
    ).toBe(undefined);
});

it("infers path params from path", () => {
    const testRoute = route(path("/test/:id(\\d+)/:id2?/:id3*"));

    assert<
        IsExact<
            Parameters<typeof testRoute.buildPath>[0],
            { id: string | number | boolean; id2?: string | number | boolean; id3?: string | number | boolean }
        >
    >(true);

    expect(testRoute.buildPath({ id: 1 })).toBe("/test/1");
    expect(testRoute.buildPath({ id: 1, id2: "abc" })).toBe("/test/1/abc");
    expect(testRoute.buildPath({ id: 1, id3: true })).toBe("/test/1/true");
    expect(testRoute.buildPath({ id: 1, id2: "abc", id3: true })).toBe("/test/1/abc/true");

    assert<
        IsExact<
            ReturnType<typeof testRoute.parsePath>,
            | {
                  id: string;
                  id2?: string;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(testRoute.parsePath({ id: "1" })).toEqual({ id: "1" });
    expect(testRoute.parsePath({ id: "1", id2: "abc", id3: "true", foo: "12" })).toEqual({
        id: "1",
        id2: "abc",
        id3: "true",
        foo: "12",
    });
    expect(testRoute.parsePath({ id2: "abc", id3: "true" })).toBe(undefined);
    expect(testRoute.parsePath({ foo: "abc" })).toBe(undefined);
});

it("allows to redefine and narrow path params", () => {
    // Parameters of this path are inferred incorrectly
    const testRoute = route(
        path("/test/:id(true|false)/:id2(\\d+)?/:id3*", {
            id: param.boolean,
            id2: param.number.optional,
            id3: param.string.optional,
        })
    );

    assert<
        IsExact<
            Parameters<typeof testRoute.buildPath>[0],
            { id: boolean; id2?: number; id3?: string | number | boolean }
        >
    >(true);

    expect(testRoute.buildPath({ id: true })).toBe("/test/true");
    expect(testRoute.buildPath({ id: true, id2: 2 })).toBe("/test/true/2");
    expect(testRoute.buildPath({ id: true, id3: "abc" })).toBe("/test/true/abc");
    expect(testRoute.buildPath({ id: true, id2: 2, id3: "abc" })).toBe("/test/true/2/abc");

    assert<
        IsExact<
            ReturnType<typeof testRoute.parsePath>,
            | {
                  id: boolean;
                  id2?: number;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(testRoute.parsePath({ id: "true" })).toEqual({ id: true });
    expect(testRoute.parsePath({ id: "true", id2: "1", id3: "abc", foo: "12" })).toEqual({
        id: true,
        id2: 1,
        id3: "abc",
    });
    expect(testRoute.parsePath({ id2: "1", id3: "abc" })).toBe(undefined);
    expect(testRoute.parsePath({ foo: "abc" })).toBe(undefined);
});

it("allows to specify numbers and booleans for string params", () => {
    const testRoute = route(path("/test/:id", { id: param.string }));

    expect(testRoute.buildPath({ id: 1 })).toBe("/test/1");
    expect(testRoute.buildPath({ id: true })).toBe("/test/true");
});

it("allows to specify unions of values", () => {
    const testRoute = route(path("/test/:id", { id: param.oneOf("1", "2") }));
    const testOptionalRoute = route(path("/test/:id?", { id: param.oneOf("1", "2").optional }));

    assert<IsExact<Parameters<typeof testRoute.buildPath>[0], { id: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof testRoute.parsePath>, { id: "1" | "2" } | undefined>>(true);

    assert<IsExact<Parameters<typeof testOptionalRoute.buildPath>[0], { id?: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof testOptionalRoute.parsePath>, { id?: "1" | "2" } | undefined>>(true);

    expect(testRoute.parsePath({ id: "1" })).toEqual({ id: "1" });
    expect(testRoute.parsePath({ id: "2" })).toEqual({ id: "2" });
    expect(testRoute.parsePath({ id: "3" })).toEqual(undefined);
    expect(testRoute.parsePath({})).toEqual(undefined);

    expect(testOptionalRoute.parsePath({ id: "1" })).toEqual({ id: "1" });
    expect(testOptionalRoute.parsePath({ id: "2" })).toEqual({ id: "2" });
    expect(testOptionalRoute.parsePath({ id: "3" })).toEqual(undefined);
    expect(testOptionalRoute.parsePath({})).toEqual({ id: undefined });
});
