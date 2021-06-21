import { routeGroup } from "../index";

const defaultRouteGroup = routeGroup();

it("infers path params from path", () => {
    const route = defaultRouteGroup()("/test/:id/:id2/:id3");

    expect(route.build({ path: { id: 1, id2: "2", id3: true } })).toBe("/test/1/2/true");
});

it("works with optional path parameters", () => {
    const route = defaultRouteGroup()("/test/:id?/other-test/:id2*");

    expect(route.build({ path: { id2: 1 } })).toBe("/test/other-test/1");
    expect(route.build({ path: { id: 1, id2: 2 } })).toBe("/test/1/other-test/2");
});

it("does not require empty path argument", () => {
    const route = defaultRouteGroup()("/test");

    expect(route.build({})).toBe("/test");
});

it("allows to specify query params", () => {
    const route =
        defaultRouteGroup<{ query: { a: string; b: boolean; c: number; d: null; e: undefined; f: number[] } }>()(
            "/test"
        );

    expect(route.build({ query: { a: "a", b: true, c: 1, d: null, e: undefined, f: [1, 2] } })).toBe(
        "/test?a=a&b=true&c=1&d&f=1&f=2"
    );
});

it("allows to specify hash", () => {
    const route = defaultRouteGroup<{ hash: "foo" | "bar" }>()("/test");

    expect(route.build({ hash: "foo" })).toBe("/test#foo");
});

it("allows to specify state for type-safe route-specific state creation", () => {
    const route = defaultRouteGroup<{ state: { foo: string } }>()("/test");

    expect(route.buildState({ foo: "1" })).toEqual({ foo: "1" });
});
