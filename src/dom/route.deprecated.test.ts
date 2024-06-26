import { route } from "./route.js";
import { createSearchParams } from "react-router-dom";
import {
    numberType,
    booleanType,
    arrayOfType,
    stringType,
    hashValues,
    throwable,
    dateType,
    types,
} from "../common/index.js";
import { assert, IsExact } from "conditional-type-checks";

it("provides absolute path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/child/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/child/grand");
});

it("provides absolute path with optional segments", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/optional-child?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/optional?", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test/optional?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/optional?/child/optional-child?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/optional?/child/optional-child?/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test/optional?");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/optional?/child/optional-child?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/optional?/child/optional-child?/grand");
});

it("provides absolute path with optional dynamic segments", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:optional-child?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/:optional?", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test/:optional?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/:optional?/child/:optional-child?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/:optional?/child/:optional-child?/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test/:optional?");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/:optional?/child/:optional-child?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/:optional?/child/:optional-child?/grand");
});

it("preserves intermediate stars in absolute path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/child/*/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/child/*/grand");
});

it("preserves optional intermediate stars in absolute path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/*?", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/*?/child/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/*?/child/*?/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test/*?");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/*?/child/*?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/*?/child/*?/grand");
});

it("provides relative path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.relativePath).toEqual("test");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/child/grand");
});

it("provides relative path with optional segments", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:dynamic-param?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/dynamic?", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test/dynamic?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/dynamic?/child/:dynamic-param?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/dynamic?/child/:dynamic-param?/grand">>(true);

    expect(TEST_ROUTE.relativePath).toEqual("test/dynamic?");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/dynamic?/child/:dynamic-param?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/dynamic?/child/:dynamic-param?/grand");
});

it("removes intermediate stars from relative path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.relativePath).toEqual("test");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/child/grand");
});

it("removes multiple intermediate stars from relative path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/*", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.relativePath).toEqual("test/*");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/child/grand");
});

it("removes multiple optional intermediate stars from relative path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test/*?", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/child/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.relativePath).toEqual("test/*?");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/child/*?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/child/grand");
});

it("allows empty segment at the beginning of the route", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/child/grand">>(true);

    assert<IsExact<typeof TEST_ROUTE.relativePath, "">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "child/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/");
    expect(TEST_ROUTE.CHILD.path).toEqual("/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/child/grand");

    expect(TEST_ROUTE.relativePath).toEqual("");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("child/grand");
});

it("allows empty segment in the middle of the route", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/grand">>(true);

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/grand");

    expect(TEST_ROUTE.relativePath).toEqual("test");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/grand");
});

it("allows empty segment at the end of the route", () => {
    const GRANDCHILD = route("");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.path, "/test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.path, "/test/child">>(true);

    assert<IsExact<typeof TEST_ROUTE.relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.relativePath, "test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.relativePath, "test/child">>(true);

    expect(TEST_ROUTE.path).toEqual("/test");
    expect(TEST_ROUTE.CHILD.path).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.path).toEqual("/test/child");

    expect(TEST_ROUTE.relativePath).toEqual("test");
    expect(TEST_ROUTE.CHILD.relativePath).toEqual("test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.relativePath).toEqual("test/child");
});

it("allows implicit path params", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:id", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { id: string }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: "42" })).toEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: "24" })).toEqual("/test/child/24/grand");
});

it("allows explicit path params", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:id", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id: number }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { id: number }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: 42 })).toEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: 24 })).toEqual("/test/child/24/grand");
});

it("allows to mix explicit and implicit path params", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { id: number; value: string }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: 24, value: "bar" })).toEqual("/test/child/24/bar/grand");
});

it("allows to mix explicit and implicit path params in case of optional params", () => {
    const GRANDCHILD = route("grand/:name");
    const CHILD = route("child/:id?/:value?", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id?: number; value?: string }>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0],
            { id?: number; value?: string; name: string }
        >
    >(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: 42 })).toEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: 24, value: "bar", name: "baz" })).toEqual(
        "/test/child/24/bar/grand/baz"
    );
});

it("allows to mix explicit and implicit path params across multiple routes", () => {
    const GRANDCHILD = route("grand/:name");
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id: number; value: string }>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0],
            { id: number; value: string; name: string }
        >
    >(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: 24, value: "bar", name: "baz" })).toEqual(
        "/test/child/24/bar/grand/baz"
    );
});

it("prioritizes children when mixing path params with the same name", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: booleanType } });
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { id: boolean; value: string }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ id: false, value: "bar" })).toEqual(
        "/test/child/false/bar/grand/false"
    );
});

it("allows implicit star path param", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ "*": "star/param" })).toEqual("/test/child/star/param");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({})).toEqual("/test/child/grand");
});

it("allows implicit optional star path param", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ "*": "star/param" })).toEqual("/test/child/star/param");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({})).toEqual("/test/child/grand");
});

it("allows explicit star path param", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ "*": 42 })).toEqual("/test/child/grand/42");
});

it("allows explicit optional star path param", () => {
    const GRANDCHILD = route("grand/*?", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({ "*": 42 })).toEqual("/test/child/grand/42");
});

it("always treats star param as optional upon building", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({})).toEqual("/test/child/grand");
});

it("allows star path param in the middle of combined path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.buildPath({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({ "*": "foo" })).toEqual("/test/child/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({})).toEqual("/test/child/grand");
});

it("allows search params", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, { foo: 1 })).toEqual("/test/child/grand?foo=1");
});

it("allows to mix search params across multiple routes", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", { searchParams: { bar: arrayOfType(numberType) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[1], { bar?: number[] } | undefined>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[1],
            { foo?: number; bar?: number[] } | undefined
        >
    >(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, { bar: [1, 2] })).toEqual("/test/child?bar=1&bar=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, { foo: 1, bar: [1, 2] })).toEqual(
        "/test/child/grand?foo=1&bar=1&bar=2"
    );
});

it("prioritizes children when mixing search params with the same name", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", { searchParams: { foo: arrayOfType(numberType) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[1], { foo?: number[] } | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, { foo: [1, 2] })).toEqual("/test/child?foo=1&foo=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, { foo: 1 })).toEqual("/test/child/grand?foo=1");
});

it("allows implicit hash params", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[2], string | undefined>>(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, {}, "my-id")).toEqual("/test/child/grand#my-id");
});

it("allows explicit hash params", () => {
    const GRANDCHILD = route("grand", { hash: hashValues("foo", "bar") });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[2], "foo" | "bar" | undefined>>(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, {}, "foo")).toEqual("/test/child/grand#foo");
});

it("allows mixing explicit hash params across multiple routes", () => {
    const GRANDCHILD = route("grand", { hash: hashValues("foo", "bar") });
    const CHILD = route("child", { hash: hashValues("baz") }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[2], "baz" | "foo" | "bar" | undefined>>(
        true
    );

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, {}, "baz")).toEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, {}, "baz")).toEqual("/test/child/grand#baz");
});

it("allows mixing explicit and implicit hash params across multiple routes", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route("child", { hash: hashValues("baz") }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildPath>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildPath>[2], string | undefined>>(true);

    expect(TEST_ROUTE.buildPath({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildPath({}, {}, "baz")).toEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildPath({}, {}, "anything")).toEqual("/test/child/grand#anything");
});

it("allows state params", () => {
    const GRANDCHILD = route("grand", { state: { bar: numberType } });
    const CHILD = route("child", { state: { foo: stringType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildState>[0], { foo?: string; bar?: number }>>(true);

    expect(TEST_ROUTE.buildState({})).toEqual({});
    expect(TEST_ROUTE.CHILD.buildState({ foo: "test" })).toEqual({ foo: "test" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildState({ foo: "test", bar: 1 })).toEqual({ foo: "test", bar: "1" });
});

it("allows implicit path params parsing", () => {
    const GRANDCHILD = route("grand/:id", {});
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { id: string }>>(true);

    expect(TEST_ROUTE.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1" })).toEqual({ id: "1" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({})).toThrow();
});

it("allows implicit optional path params parsing", () => {
    const GRANDCHILD = route("grand/:id?");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { id?: string }>>(true);

    expect(TEST_ROUTE.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1" })).toEqual({ id: "1" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({})).toEqual({});
});

it("allows explicit path params parsing", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { id: number | undefined }>>(true);

    expect(TEST_ROUTE.getTypedParams({ id: "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ id: "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1" })).toEqual({ id: 1 });
});

it("allows to mix path params parsing across multiple routes", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child/:childId", { params: { childId: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId: number | undefined }>>(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>,
            { childId: number | undefined; id: number | undefined }
        >
    >(true);

    expect(TEST_ROUTE.getTypedParams({ id: "1", childId: "2" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ id: "1", childId: "2" })).toEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1", childId: "2" })).toEqual({ id: 1, childId: 2 });
});

it("provides untyped path params", () => {
    const GRANDCHILD = route("grand/:id", {});
    const CHILD = route("child/:childId/:opt?", { params: { childId: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getUntypedParams>, Record<string, string | undefined>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getUntypedParams>, Record<string, string | undefined>>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getUntypedParams>, Record<string, string | undefined>>
    >(true);

    expect(TEST_ROUTE.getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })).toStrictEqual({
        id: "1",
        childId: "2",
        opt: "3",
        untyped: "untyped",
    });
    expect(TEST_ROUTE.CHILD.getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })).toStrictEqual({
        id: "1",
        untyped: "untyped",
    });
    expect(
        TEST_ROUTE.CHILD.GRANDCHILD.getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })
    ).toStrictEqual({
        untyped: "untyped",
    });
});

it("throws if implicit path params are invalid", () => {
    const GRANDCHILD = route("grand/:id", {});
    const CHILD = route("child/:childId", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { childId: string; id: string }>>(
        true
    );

    expect(TEST_ROUTE.getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ childId: "2" })).toThrow();
});

it("doesn't throw if implicit optional path params are omitted", () => {
    const GRANDCHILD = route("grand/:id?", {});
    const CHILD = route("child/:childId?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { childId?: string; id?: string }>>(
        true
    );

    expect(TEST_ROUTE.getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
});

it("doesn't throw if explicit path params are invalid", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child/:childId", { params: { childId: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId: number | undefined }>>(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>,
            { childId: number | undefined; id: number | undefined }
        >
    >(true);

    expect(TEST_ROUTE.getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2, id: undefined });
});

it("doesn't throw if explicit path params with fallback are invalid", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType(-1) } });
    const CHILD = route("child/:childId", { params: { childId: numberType(-1) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { childId: number; id: number }>>(
        true
    );

    expect(TEST_ROUTE.getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2, id: -1 });
});

it("throws if explicit throwable path params are invalid", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType(throwable) } });
    const CHILD = route("child/:childId", { params: { childId: numberType(throwable) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { childId: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { childId: number; id: number }>>(
        true
    );

    expect(TEST_ROUTE.getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ childId: "2" })).toThrow();
});

it("allows implicit star path param parsing", () => {
    const GRANDCHILD = route("grand/*", {});
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*": string }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "foo/bar" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "foo/bar" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "foo/bar" })).toEqual({ "*": "foo/bar" });
});

it("allows implicit optional star path param parsing", () => {
    const GRANDCHILD = route("grand", {});
    const CHILD = route("child/*?", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { "*"?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*"?: string }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "foo/bar" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({})).toStrictEqual({});
});

it("allows explicit star path param parsing", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*": number | undefined }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "1" })).toEqual({ "*": 1 });
});

it("allows explicit star path param parsing (with fallback)", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType(42) } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*": number }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "" })).toEqual({ "*": 42 });
});

it("doesn't throw if explicit star param is invalid", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*": number | undefined }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "foo" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "foo" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "foo" })).toStrictEqual({ "*": undefined });
});

it("allows intermediate star param parsing", () => {
    const GRANDCHILD = route("grand", {});
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, { "*": string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*": string }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "foo/bar" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "foo/bar" })).toEqual({ "*": "foo/bar" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "foo/bar" })).toEqual({ "*": "foo/bar" });
});

it("allows search params parsing", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType(0) } });
    const CHILD = route(
        "child",
        {
            searchParams: { foo: stringType, arr: arrayOfType(numberType) },
        },
        { GRANDCHILD }
    );
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedSearchParams>, Record<never, never>>>(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.getTypedSearchParams>,
            { foo: string | undefined; arr: number[] | undefined }
        >
    >(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams>,
            { foo: number; arr: number[] | undefined }
        >
    >(true);

    const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

    expect(TEST_ROUTE.getTypedSearchParams(testSearchParams)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedSearchParams(testSearchParams)).toEqual({ arr: [1, 2], foo: "foo" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams(testSearchParams)).toEqual({ arr: [1, 2], foo: 0 });

    expect(TEST_ROUTE.getUntypedSearchParams(testSearchParams).getAll("arr")).toEqual(["1", "2"]);
    expect(TEST_ROUTE.CHILD.getUntypedSearchParams(testSearchParams).getAll("arr")).toEqual([]);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getUntypedSearchParams(testSearchParams).getAll("arr")).toEqual([]);

    expect(TEST_ROUTE.getUntypedSearchParams(testSearchParams).get("foo")).toEqual("foo");
    expect(TEST_ROUTE.CHILD.getUntypedSearchParams(testSearchParams).get("foo")).toEqual(null);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getUntypedSearchParams(testSearchParams).get("foo")).toEqual(null);

    expect(TEST_ROUTE.getUntypedSearchParams(testSearchParams).get("untyped")).toEqual("untyped");
    expect(TEST_ROUTE.CHILD.getUntypedSearchParams(testSearchParams).get("untyped")).toEqual("untyped");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getUntypedSearchParams(testSearchParams).get("untyped")).toEqual("untyped");
});

it("throws if throwable search params are invalid", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType(throwable) } });
    const CHILD = route(
        "child",
        {
            searchParams: { foo: stringType, arr: arrayOfType(numberType) },
        },
        { GRANDCHILD }
    );
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedSearchParams>, Record<never, never>>>(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.getTypedSearchParams>,
            { foo: string | undefined; arr: number[] | undefined }
        >
    >(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams>,
            { foo: number; arr: number[] | undefined }
        >
    >(true);

    const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

    expect(TEST_ROUTE.getTypedSearchParams(testSearchParams)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedSearchParams(testSearchParams)).toEqual({ arr: [1, 2], foo: "foo" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams(testSearchParams)).toThrow();
});

it("allows hash parsing", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route(
        "child",
        {
            hash: hashValues("foo", "bar"),
        },
        { GRANDCHILD }
    );
    const TEST_ROUTE = route("test", {}, { CHILD });

    const testHash = "#foo";

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedHash>, undefined>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedHash>, "foo" | "bar" | undefined>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedHash>, string | undefined>>(true);

    expect(TEST_ROUTE.getTypedHash(testHash)).toEqual(undefined);
    expect(TEST_ROUTE.CHILD.getTypedHash(testHash)).toEqual("foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedHash(testHash)).toEqual("foo");
});

it("allows any hash parsing", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route(
        "child",
        {
            hash: hashValues("foo", "bar"),
        },
        { GRANDCHILD }
    );
    const TEST_ROUTE = route("test", {}, { CHILD });

    const testHash = "#baz";

    expect(TEST_ROUTE.getTypedHash(testHash)).toEqual(undefined);
    expect(TEST_ROUTE.CHILD.getTypedHash(testHash)).toEqual(undefined);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedHash(testHash)).toEqual("baz");
});

it("allows state params parsing", () => {
    const GRANDCHILD = route("grand", { state: { bar: numberType } });
    const CHILD = route("child", { state: { foo: stringType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildState>[0], { foo?: string; bar?: number }>>(true);

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedState>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedState>, { foo: string | undefined }>>(true);
    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedState>,
            { foo: string | undefined; bar: number | undefined }
        >
    >(true);

    const state = { foo: "test", bar: "1", untyped: "untyped" };

    expect(TEST_ROUTE.getTypedState(state)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedState(state)).toEqual({ foo: "test" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedState(state)).toEqual({ foo: "test", bar: 1 });

    expect(TEST_ROUTE.getUntypedState(state)).toEqual({ foo: "test", bar: "1", untyped: "untyped" });
    expect(TEST_ROUTE.CHILD.getUntypedState(state)).toEqual({ bar: "1", untyped: "untyped" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getUntypedState(state)).toEqual({ untyped: "untyped" });
});

it("throws if throwable state params are invalid", () => {
    const GRANDCHILD = route("grand", { state: { bar: numberType(throwable) } });
    const CHILD = route("child", { state: { foo: stringType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildState>[0], { foo?: string; bar?: number }>>(true);

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedState>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedState>, { foo: string | undefined }>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedState>, { foo: string | undefined; bar: number }>
    >(true);

    const state = { foo: "test", bar: "bar", untyped: "untyped" };

    expect(TEST_ROUTE.getTypedState(state)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedState(state)).toEqual({ foo: "test" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedState(state)).toThrow();
});

it("throws upon specifying an invalid fallback", () => {
    expect(() => route("", { searchParams: { id: dateType(new Date("foo")) } })).toThrow();
});

it("allows types composition", () => {
    const PATH = route(":id", { params: { id: numberType } });
    const SEARCH = route("", { searchParams: { page: numberType } });
    const STATE = route("", { state: { fromList: booleanType } });
    const HASH = route("", { hash: hashValues("about", "more") });

    const ROUTE = route(
        ":id/:subId",
        types({
            params: {
                subId: numberType,
            },
            searchParams: {
                ordered: booleanType,
                page: booleanType, // This should be overridden
            },
            state: {
                hidden: booleanType,
            },
            hash: hashValues("info"),
        })(PATH)(SEARCH)(STATE)(HASH)
    );

    assert<IsExact<Parameters<typeof ROUTE.buildPath>[0], { id: number; subId: number }>>(true);

    assert<IsExact<Parameters<typeof ROUTE.buildPath>[1], { page?: number; ordered?: boolean } | undefined>>(true);

    assert<IsExact<Parameters<typeof ROUTE.buildPath>[2], "about" | "more" | "info" | undefined>>(true);

    assert<IsExact<Parameters<typeof ROUTE.buildState>[0], { fromList?: boolean; hidden?: boolean }>>(true);

    expect(ROUTE.buildPath({ id: 1, subId: 2 }, { page: 1, ordered: true }, "info")).toEqual(
        "/1/2?page=1&ordered=true#info"
    );

    expect(ROUTE.buildState({ fromList: true, hidden: true })).toStrictEqual({ fromList: "true", hidden: "true" });
});

it("allows to trim path pattern", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<typeof TEST_ROUTE.path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.$.CHILD.path, "/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.path, "/grand">>(true);
    assert<IsExact<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.path, "/child/grand">>(true);

    expect(TEST_ROUTE.path).toEqual("/test");
    expect(TEST_ROUTE.$.CHILD.path).toEqual("/child");
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.path).toEqual("/grand");
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.path).toEqual("/child/grand");
});

it("allows to inherit non-path params in trimmed children", () => {
    const GRANDCHILD = route("grand", {
        searchParams: { baz: booleanType },
        state: { stateBaz: stringType },
        hash: hashValues("hashBaz"),
    });
    const CHILD = route(
        "child",
        { searchParams: { bar: stringType }, state: { stateBar: numberType }, hash: hashValues("hashBar") },
        { GRANDCHILD }
    );
    const TEST_ROUTE = route(
        "test",
        { searchParams: { foo: numberType }, state: { stateFoo: booleanType }, hash: hashValues("hashFoo") },
        { CHILD }
    );

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[1], { foo?: number } | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[2], "hashFoo" | undefined>>(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.buildPath>[1], { foo?: number; bar?: string } | undefined>>(
        true
    );
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.buildPath>[2], "hashFoo" | "hashBar" | undefined>>(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath>[0], Record<never, never>>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath>[1],
            { foo?: number; bar?: string; baz?: boolean } | undefined
        >
    >(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath>[2],
            "hashFoo" | "hashBar" | "hashBaz" | undefined
        >
    >(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath>[0], Record<never, never>>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath>[1],
            { foo?: number; bar?: string; baz?: boolean } | undefined
        >
    >(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath>[2],
            "hashFoo" | "hashBar" | "hashBaz" | undefined
        >
    >(true);

    expect(TEST_ROUTE.buildPath({}, { foo: 1 }, "hashFoo")).toEqual("/test?foo=1#hashFoo");
    expect(TEST_ROUTE.$.CHILD.buildPath({}, { foo: 1, bar: "test" }, "hashBar")).toEqual(
        "/child?foo=1&bar=test#hashBar"
    );
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath({}, { foo: 1, bar: "test", baz: false }, "hashBaz")).toEqual(
        "/grand?foo=1&bar=test&baz=false#hashBaz"
    );
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath({}, { foo: 1, bar: "test", baz: false }, "hashBaz")).toEqual(
        "/child/grand?foo=1&bar=test&baz=false#hashBaz"
    );

    const testSearchParams = createSearchParams({ foo: "1", bar: "test", baz: "false" });

    expect(TEST_ROUTE.getTypedSearchParams(testSearchParams)).toStrictEqual({ foo: 1 });
    expect(TEST_ROUTE.$.CHILD.getTypedSearchParams(testSearchParams)).toStrictEqual({ foo: 1, bar: "test" });
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.getTypedSearchParams(testSearchParams)).toStrictEqual({
        foo: 1,
        bar: "test",
        baz: false,
    });
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.getTypedSearchParams(testSearchParams)).toStrictEqual({
        foo: 1,
        bar: "test",
        baz: false,
    });
});

it("prevents path param inheritance in trimmed children", () => {
    const GRANDCHILD = route("grand/:id", {});
    const CHILD = route("child/:subId", { params: { subId: booleanType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test/:id", { params: { id: numberType } }, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildPath>[0], { id: number }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.buildPath>[0], { subId: boolean }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath>[0], { id: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath>[0], { id: string; subId: boolean }>>(
        true
    );

    expect(TEST_ROUTE.buildPath({ id: 1 })).toEqual("/test/1");
    expect(TEST_ROUTE.$.CHILD.buildPath({ subId: true })).toEqual("/child/true");
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.buildPath({ id: "test" })).toEqual("/grand/test");
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.buildPath({ subId: true, id: "test" })).toEqual("/child/true/grand/test");

    expect(TEST_ROUTE.getTypedParams({ id: "1", subId: "true" })).toEqual({ id: 1 });
    expect(TEST_ROUTE.$.CHILD.getTypedParams({ id: "1", subId: "true" })).toEqual({ subId: true });
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.getTypedParams({ id: "1", subId: "true" })).toEqual({ id: "1" });
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.getTypedParams({ id: "1", subId: "true" })).toEqual({ id: "1", subId: true });
});
