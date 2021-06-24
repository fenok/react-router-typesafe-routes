import { cast, query, hash, path, route, valid } from "../index";
import { assert, IsExact } from "conditional-type-checks";

interface TestQuery {
    a: string;
    b: boolean;
    c: number;
    d: null;
    f: number[];
    g: undefined;
}

it("allows path without parameters", () => {
    const testRoute = route(path("/test"));

    assert<IsExact<Parameters<typeof testRoute.build>[0], {}>>(true);

    expect(testRoute.build({})).toBe("/test");

    // Reminder that any truthy value can be passed, but that's how react-router generatePath is typed
    expect(testRoute.build({ any: "value" })).toBe("/test");

    assert<IsExact<ReturnType<typeof testRoute.parse>["path"], {} | undefined>>(true);

    expect(testRoute.parse({})).toMatchObject({ path: {} });
    expect(testRoute.parse({ params: {}, isExact: false, path: "/test", url: "/test" })).toMatchObject({ path: {} });
    expect(
        testRoute.parse({
            params: {},
            isExact: false,
            path: "/other-path/:id",
            url: "/other-path/1",
        })
    ).toMatchObject({ path: undefined });
});

it("infers path params from path", () => {
    const testRoute = route(path("/test/:id(\\d+)/:id2?/:id3*"));

    assert<
        IsExact<
            Parameters<typeof testRoute.build>[0],
            { id: string | number | boolean; id2?: string | number | boolean; id3?: string | number | boolean }
        >
    >(true);

    expect(testRoute.build({ id: 1 })).toBe("/test/1");
    expect(testRoute.build({ id: 1, id2: "abc" })).toBe("/test/1/abc");
    expect(testRoute.build({ id: 1, id3: true })).toBe("/test/1/true");
    expect(testRoute.build({ id: 1, id2: "abc", id3: true })).toBe("/test/1/abc/true");

    assert<
        IsExact<
            ReturnType<typeof testRoute.parse>["path"],
            | {
                  id: string;
                  id2?: string;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(testRoute.parse({ id: "1" })).toMatchObject({ path: { id: "1" } });
    expect(testRoute.parse({ id: "1", id2: "abc", id3: "true", foo: "12" })).toMatchObject({
        path: { id: "1", id2: "abc", id3: "true", foo: "12" },
    });
    expect(testRoute.parse({ id2: "abc", id3: "true" })).toMatchObject({ path: undefined });
    expect(testRoute.parse({ foo: "abc" })).toMatchObject({ path: undefined });
});

it("allows to redefine and narrow path params", () => {
    // Parameters of this path are inferred incorrectly
    const testRoute = route(
        path("/test/:id(true|false)/:id2(\\d+)?/:id3*", {
            id: cast.boolean,
            id2: cast.number.optional,
            id3: cast.string.optional,
        })
    );

    assert<IsExact<Parameters<typeof testRoute.build>[0], { id: boolean; id2?: number; id3?: string }>>(true);

    expect(testRoute.build({ id: true })).toBe("/test/true");
    expect(testRoute.build({ id: true, id2: 2 })).toBe("/test/true/2");
    expect(testRoute.build({ id: true, id3: "abc" })).toBe("/test/true/abc");
    expect(testRoute.build({ id: true, id2: 2, id3: "abc" })).toBe("/test/true/2/abc");

    assert<
        IsExact<
            ReturnType<typeof testRoute.parse>["path"],
            | {
                  id: boolean;
                  id2?: number;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(testRoute.parse({ id: "true" })).toMatchObject({ path: { id: true } });
    expect(testRoute.parse({ id: "true", id2: "1", id3: "abc", foo: "12" })).toMatchObject({
        path: { id: true, id2: 1, id3: "abc", foo: "12" },
    });
    expect(testRoute.parse({ id2: "1", id3: "abc" })).toMatchObject({ path: undefined });
    expect(testRoute.parse({ foo: "abc" })).toMatchObject({ path: undefined });
});

it("allows to use query params", () => {
    // Note how parseNumbers, parseBooleans and arrayFormat options affect available types
    const testRoute = route(path("/test"), query({}, { parseNumbers: true }));

    // Build params are typed as Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
    assert<IsExact<Parameters<typeof testRoute.build>[1], Record<string, any> | null | undefined>>(true);

    const testQuery: TestQuery = { a: "a", b: true, c: 1, d: null, f: [1, 2], g: undefined };

    expect(testRoute.build({}, testQuery)).toBe("/test?a=a&b=true&c=1&d&f=1&f=2");

    const parseResult = testRoute.parse(null, {
        pathname: "/test",
        search: "?a=a&b=true&c=1&d&f=1&f=2",
        hash: "",
        state: undefined,
    });

    assert<IsExact<typeof parseResult["query"], Record<string, (string | number)[] | string | number | null>>>(true);

    expect(parseResult).toMatchObject({ query: { a: "a", b: "true", c: 1, d: null, f: [1, 2] } });
});

it("allows to redefine and narrow query params", () => {
    // Note how parseNumbers, parseBooleans and arrayFormat options affect available types
    const testRoute = route(
        path("/test"),
        query(
            {
                a: valid.string,
                b: valid.boolean,
                c: valid.number,
                d: valid.null,
                f: valid.arrayOf(valid.number),
            },
            { parseNumbers: true, parseBooleans: true, arrayFormat: "bracket" }
        )
    );

    assert<
        IsExact<
            Parameters<typeof testRoute.build>[1],
            | {
                  a?: string;
                  b?: boolean;
                  c?: number;
                  d?: null;
                  f?: number[];
              }
            | null
            | undefined
        >
    >(true);

    const parseResult = testRoute.parse(null, {
        pathname: "/test",
        search: "?a=abc&b=true&c=1&d&f[]=1&f[]=2&foo=bar",
        hash: "",
        state: undefined,
    });

    assert<
        IsExact<
            typeof parseResult["query"],
            {
                a?: string;
                b?: boolean;
                c?: number;
                d?: null;
                f?: number[];
            }
        >
    >(true);

    expect(parseResult).toMatchObject({
        query: { a: "abc", b: true, c: 1, d: null, f: [1, 2], foo: "bar" },
    });
});

it("detects whether single value can be stored as array in query", () => {
    const queryShape = { a: valid.arrayOf(valid.string) };

    const defaultRoute = route(path("/test"), query(queryShape));
    const bracketRoute = route(path("/test"), query(queryShape, { arrayFormat: "bracket" }));
    const indexRoute = route(path("/test"), query(queryShape, { arrayFormat: "index" }));
    const commaRoute = route(path("/test"), query(queryShape, { arrayFormat: "comma" }));
    const separatorRoute = route(path("/test"), query(queryShape, { arrayFormat: "separator" }));
    const bracketSeparatorRoute = route(path("/test"), query(queryShape, { arrayFormat: "bracket-separator" }));
    const noneRoute = route(path("/test"), query(queryShape, { arrayFormat: "none" }));

    type ArrayAwareParams = { a?: string[] };
    type ArrayUnawareParams = { a?: string[] | string };

    assert<IsExact<Parameters<typeof defaultRoute.buildQuery>[0], ArrayUnawareParams>>(true);
    assert<IsExact<Parameters<typeof bracketRoute.buildQuery>[0], ArrayAwareParams>>(true);
    assert<IsExact<Parameters<typeof indexRoute.buildQuery>[0], ArrayAwareParams>>(true);
    assert<IsExact<Parameters<typeof commaRoute.buildQuery>[0], ArrayUnawareParams>>(true);
    assert<IsExact<Parameters<typeof separatorRoute.buildQuery>[0], ArrayUnawareParams>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorRoute.buildQuery>[0], ArrayAwareParams>>(true);
    assert<IsExact<Parameters<typeof noneRoute.buildQuery>[0], ArrayUnawareParams>>(true);

    assert<IsExact<ReturnType<typeof defaultRoute.parseQuery>, ArrayUnawareParams>>(true);
    assert<IsExact<ReturnType<typeof bracketRoute.parseQuery>, ArrayAwareParams>>(true);
    assert<IsExact<ReturnType<typeof indexRoute.parseQuery>, ArrayAwareParams>>(true);
    assert<IsExact<ReturnType<typeof commaRoute.parseQuery>, ArrayUnawareParams>>(true);
    assert<IsExact<ReturnType<typeof separatorRoute.parseQuery>, ArrayUnawareParams>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorRoute.parseQuery>, ArrayAwareParams>>(true);
    assert<IsExact<ReturnType<typeof noneRoute.parseQuery>, ArrayUnawareParams>>(true);

    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: "abc" });
    expect(bracketRoute.parseQuery(bracketRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(indexRoute.parseQuery(indexRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(commaRoute.parseQuery(commaRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: "abc" });
    expect(separatorRoute.parseQuery(separatorRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: "abc" });
    expect(bracketSeparatorRoute.parseQuery(bracketSeparatorRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: "abc" });

    expect(defaultRoute.parseQuery("?a=abc")).toEqual({ a: "abc" });
    expect(bracketRoute.parseQuery("?a=abc")).toEqual({ a: undefined });
    expect(indexRoute.parseQuery("?a=abc")).toEqual({ a: undefined });
    expect(commaRoute.parseQuery("?a=abc")).toEqual({ a: "abc" });
    expect(separatorRoute.parseQuery("?a=abc")).toEqual({ a: "abc" });
    expect(bracketSeparatorRoute.parseQuery("?a=abc")).toEqual({ a: undefined });
    expect(noneRoute.parseQuery("?a=abc")).toEqual({ a: "abc" });
});

it("allows types that are either array or single value in query", () => {
    const testRoute = route(
        path("/test"),
        query(
            { a: [valid.number, valid.arrayOf<string | boolean>([valid.boolean, valid.string])] },
            { arrayFormat: "bracket", parseNumbers: true, parseBooleans: true }
        )
    );

    assert<IsExact<Parameters<typeof testRoute.buildQuery>[0], { a?: (string | boolean)[] | number }>>(true);

    expect(testRoute.parseQuery(testRoute.buildQuery({ a: 1 }))).toEqual({ a: 1 });
    expect(testRoute.parseQuery(testRoute.buildQuery({ a: ["abc", true] }))).toEqual({ a: ["abc", true] });
    expect(testRoute.parseQuery(testRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(testRoute.parseQuery("?a[]")).toEqual({ a: undefined });
    expect(testRoute.parseQuery("?a[]=1")).toEqual({ a: undefined });
});

it("allows to specify hash", () => {
    const testRoute = route(path("/test"), null, hash(["foo", "bar"] as const));

    expect(testRoute.build({}, null, "foo")).toBe("/test#foo");
});
