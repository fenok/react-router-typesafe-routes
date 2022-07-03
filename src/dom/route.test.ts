import { route } from "./route";
import { createSearchParams } from "react-router-dom";
import { numberType, booleanType, arrayOfType, stringType } from "../common";
import { hashValues } from "../common";
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

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { id: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { id: string }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ id: "42" })).toEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ id: "24" })).toEqual("/test/child/24/grand");
});

it("allows explicit path params", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:id", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { id: number }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { id: number }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ id: 42 })).toEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ id: 24 })).toEqual("/test/child/24/grand");
});

it("allows to mix explicit and implicit path params", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { id: number; value: string }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ id: 24, value: "bar" })).toEqual("/test/child/24/bar/grand");
});

it("allows to mix explicit and implicit path params across multiple routes", () => {
    const GRANDCHILD = route("grand/:name");
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { id: number; value: string }>>(true);
    assert<
        IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { id: number; value: string; name: string }>
    >(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ id: 24, value: "bar", name: "baz" })).toEqual(
        "/test/child/24/bar/grand/baz"
    );
});

it("prioritizes children when mixing path params with the same name", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: booleanType } });
    const CHILD = route("child/:id/:value", { params: { id: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { id: boolean; value: string }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ id: 42, value: "foo" })).toEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ id: false, value: "bar" })).toEqual(
        "/test/child/false/bar/grand/false"
    );
});

it("allows implicit star path param", () => {
    const GRANDCHILD = route("grand/*");
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { "*"?: string }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ "*": "star/param" })).toEqual("/test/child/grand/star/param");
});

it("allows explicit star path param", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ "*": 42 })).toEqual("/test/child/grand/42");
});

it("allows star path param to be optional", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.buildUrl({})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({})).toEqual("/test/child/grand");
});

it("allows star path param in the middle of combined path", () => {
    const GRANDCHILD = route("grand");
    const CHILD = route("child/*", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[0], { "*"?: string }>>(true);

    expect(TEST_ROUTE.buildUrl({ "*": "foo" })).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({ "*": "foo" })).toEqual("/test/child/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({ "*": "foo" })).toEqual("/test/child/grand");
});

it("allows search params", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, { foo: 1 })).toEqual("/test/child/grand?foo=1");
});

it("allows to mix search params across multiple routes", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", { searchParams: { bar: arrayOfType(numberType) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[1], { bar?: number[] } | undefined>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[1],
            { foo?: number; bar?: number[] } | undefined
        >
    >(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, { bar: [1, 2] })).toEqual("/test/child?bar=1&bar=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, { foo: 1, bar: [1, 2] })).toEqual(
        "/test/child/grand?foo=1&bar=1&bar=2"
    );
});

it("prioritizes children when mixing search params with the same name", () => {
    const GRANDCHILD = route("grand", { searchParams: { foo: numberType } });
    const CHILD = route("child", { searchParams: { foo: arrayOfType(numberType) } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[1], { foo?: number[] } | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, { foo: [1, 2] })).toEqual("/test/child?foo=1&foo=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, { foo: 1 })).toEqual("/test/child/grand?foo=1");
});

it("allows implicit hash params", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[2], string | undefined>>(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, {}, "my-id")).toEqual("/test/child/grand#my-id");
});

it("allows explicit hash params", () => {
    const GRANDCHILD = route("grand", { hash: hashValues("foo", "bar") });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[2], "foo" | "bar" | undefined>>(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, {})).toEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, {}, "foo")).toEqual("/test/child/grand#foo");
});

it("allows mixing explicit hash params across multiple routes", () => {
    const GRANDCHILD = route("grand", { hash: hashValues("foo", "bar") });
    const CHILD = route("child", { hash: hashValues("baz") }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[2], "baz" | "foo" | "bar" | undefined>>(
        true
    );

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, {}, "baz")).toEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, {}, "baz")).toEqual("/test/child/grand#baz");
});

it("allows mixing explicit and implicit hash params across multiple routes", () => {
    const GRANDCHILD = route("grand", { hash: hashValues() });
    const CHILD = route("child", { hash: hashValues("baz") }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<Parameters<typeof TEST_ROUTE.buildUrl>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.buildUrl>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.buildUrl>[2], string | undefined>>(true);

    expect(TEST_ROUTE.buildUrl({}, {})).toEqual("/test");
    expect(TEST_ROUTE.CHILD.buildUrl({}, {}, "baz")).toEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.buildUrl({}, {}, "anything")).toEqual("/test/child/grand#anything");
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

    expect(TEST_ROUTE.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({})).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1" })).toEqual({ id: "1" });
});

it("allows explicit path params parsing", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    expect(TEST_ROUTE.getTypedParams({ id: "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ id: "1" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1" })).toEqual({ id: 1 });
});

it("allows to mix path params parsing across multiple routes", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child/:childId", { params: { childId: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    expect(TEST_ROUTE.getTypedParams({ id: "1", childId: "2" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ id: "1", childId: "2" })).toEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "1", childId: "2" })).toEqual({ id: 1, childId: 2 });
});

it("throws if required path params are invalid", () => {
    const GRANDCHILD = route("grand/:id", { params: { id: numberType } });
    const CHILD = route("child/:childId", { params: { childId: numberType } }, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    expect(TEST_ROUTE.getTypedParams({ id: "foo", childId: "2" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ id: "foo", childId: "2" })).toEqual({ childId: 2 });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ id: "foo", childId: "2" })).toThrow();
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

it("allows explicit star path param parsing", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*"?: number }>>(true);

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

it("silently omits invalid star path param", () => {
    const GRANDCHILD = route("grand/*", { params: { "*": numberType } });
    const CHILD = route("child", {}, { GRANDCHILD });
    const TEST_ROUTE = route("test", {}, { CHILD });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams>, { "*"?: number }>>(true);

    expect(TEST_ROUTE.getTypedParams({ "*": "foo" })).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedParams({ "*": "foo" })).toEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedParams({ "*": "foo" })).toEqual({});
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
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.getTypedSearchParams>, { foo?: string; arr?: number[] }>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams>, { foo: number; arr?: number[] }>
    >(true);

    const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo" });

    expect(TEST_ROUTE.getTypedSearchParams(testSearchParams)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedSearchParams(testSearchParams)).toEqual({ arr: [1, 2], foo: "foo" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedSearchParams(testSearchParams)).toEqual({ arr: [1, 2], foo: 0 });
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

    const state = { foo: "test", bar: "1" };

    expect(TEST_ROUTE.getTypedState(state)).toEqual({});
    expect(TEST_ROUTE.CHILD.getTypedState(state)).toEqual({ foo: "test" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.getTypedState(state)).toEqual({ foo: "test", bar: 1 });
});
