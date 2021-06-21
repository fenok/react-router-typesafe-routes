import { routeGroup } from "../index";

const defaultRoute = routeGroup();

it("infers path params from path", () => {
    const route = defaultRoute()("/test/:id/:id2/:id3");

    expect(route.build({ path: { id: 1, id2: "2", id3: true } })).toBe("/test/1/2/true");
});

it("works with optional path parameters", () => {
    const route = defaultRoute()("/test/:id?/other-test/:id2*");

    expect(route.build({ path: { id2: 1 } })).toBe("/test/other-test/1");
    expect(route.build({ path: { id: 1 } })).toBe("/test/1/other-test");
    expect(route.build({ path: { id: 1, id2: 2 } })).toBe("/test/1/other-test/2");
});

it("does not require empty path argument", () => {
    const route = defaultRoute()("/test");

    expect(route.build({})).toBe("/test");
});

it("allows to specify query params", () => {
    const route =
        defaultRoute<{ query: { a: string; b: boolean; c: number; d: null; e: undefined; f: number[] } }>()("/test");

    expect(route.build({ query: { a: "a", b: true, c: 1, d: null, e: undefined, f: [1, 2] } })).toBe(
        "/test?a=a&b=true&c=1&d&f=1&f=2"
    );
});

it("allows to specify hash", () => {
    const route = defaultRoute<{ hash: "foo" | "bar" }>()("/test");

    expect(route.build({ hash: "foo" })).toBe("/test#foo");
});

it("allows to specify state for type-safe route-specific state creation", () => {
    const route = defaultRoute<{ state: { foo: string } }>()("/test");

    expect(route.buildState({ foo: "1" })).toEqual({ foo: "1" });
});

it("can parse params", () => {
    const route = defaultRoute()("/test/:id");

    const parsedParams = route.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id: "1" } });
});

it("can parse params with optional params", () => {
    const route = defaultRoute()("/test/:id?/id2*/:id3");

    const parsedParams = route.parse({ id3: "1" });
    const parsedIncorrectParams = route.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id3: "1" } });
    expect(parsedIncorrectParams).toBe(null);
});
