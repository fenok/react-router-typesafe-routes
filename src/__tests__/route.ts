import { cast, createQuery, hash, path, route, valid } from "../index";

it("infers path params from path", () => {
    const testRoute = route(path("/test/:id/:id2/:id3", { id: cast.number }));

    expect(testRoute.build({ id: 1, id2: "2", id3: true })).toBe("/test/1/2/true");
});

it("works with optional path parameters", () => {
    const testRoute = route(path("/test/:id?/other-test/:id2*"));

    expect(testRoute.build({ id2: 1 })).toBe("/test/other-test/1");
    expect(testRoute.build({ id: 1 })).toBe("/test/1/other-test");
    expect(testRoute.build({ id: 1, id2: 2 })).toBe("/test/1/other-test/2");
});

it("does not require empty path argument", () => {
    const testRoute = route(path("/test"));

    expect(testRoute.build({})).toBe("/test");
});

it("allows to specify query params", () => {
    const query = createQuery({ parse: { parseNumbers: true, parseBooleans: true } });

    const testRoute = route(
        path("/test"),
        query({ a: valid.string, b: valid.boolean, c: valid.number, d: valid.null, f: valid.arrayOf(valid.number) })
    );

    expect(testRoute.build({}, { a: "a", b: true, c: 1, d: null, f: [1, 2] })).toBe("/test?a=a&b=true&c=1&d&f=1&f=2");
});

it("allows to specify hash", () => {
    const testRoute = route(path("/test"), null, hash(["foo", "bar"] as const));

    expect(testRoute.build({}, null, "foo")).toBe("/test#foo");
});

it("can parse params", () => {
    const testRoute = route(path("/test/:id"));

    const parsedParams = testRoute.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id: "1" } });
});

it("can parse params with optional params", () => {
    const testRoute = route(path("/test/:id?/id2*/:id3"));

    const parsedParams = testRoute.parse({ id3: "1" });
    const parsedIncorrectParams = testRoute.parse({ id: "1" });

    expect(parsedParams).toMatchObject({ path: { id3: "1" } });
    expect(parsedIncorrectParams).toMatchObject({ path: undefined });
});
