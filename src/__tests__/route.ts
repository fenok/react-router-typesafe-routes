import { route, path, query, hash } from "../index";

it("infers path params from path", () => {
    const testRoute = route({ path: path("/test/:id/:id2/:id3") });

    expect(testRoute.build({ path: { id: 1, id2: "2", id3: true } })).toBe("/test/1/2/true");
});

it("works with optional path parameters", () => {
    const testRoute = route({ path: path("/test/:id?/other-test/:id2*") });

    expect(testRoute.build({ path: { id2: 1 } })).toBe("/test/other-test/1");
    expect(testRoute.build({ path: { id: 1 } })).toBe("/test/1/other-test");
    expect(testRoute.build({ path: { id: 1, id2: 2 } })).toBe("/test/1/other-test/2");
});

it("does not require empty path argument", () => {
    const testRoute = route({ path: path("/test") });

    expect(testRoute.build({})).toBe("/test");
});

it("allows to specify query params", () => {
    const testRoute = route({
        path: path("/test"),
        query: query<{ a: string; b: boolean; c: number; d: null; e: undefined; f: number[] }>(),
    });

    expect(testRoute.build({ query: { a: "a", b: true, c: 1, d: null, e: undefined, f: [1, 2] } })).toBe(
        "/test?a=a&b=true&c=1&d&f=1&f=2"
    );
});

it("allows to specify hash", () => {
    const testRoute = route({ path: path("/test"), hash: hash<"foo" | "bar">() });

    expect(testRoute.build({ hash: "foo" })).toBe("/test#foo");
});

it("can parse params", () => {
    const testRoute = route({ path: path("/test/:id") });

    const parsedParams = testRoute.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id: "1" } });
});

it("can parse params with optional params", () => {
    const testRoute = route({ path: path("/test/:id?/id2*/:id3") });

    const parsedParams = testRoute.parse({ id3: "1" });
    const parsedIncorrectParams = testRoute.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id3: "1" } });
    expect(parsedIncorrectParams).toMatchObject({ path: undefined });
});
