import { cast, query, hash, path, route, valid } from "../index";
import { assert, IsExact } from "conditional-type-checks";

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
    const testRoute = route(
        path("/test"),
        query({}, { parseNumbers: true, parseBooleans: true, arrayFormat: "bracket" })
    );

    // Build params are typed as Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
    assert<IsExact<Parameters<typeof testRoute.build>[1], Record<string, any> | null | undefined>>(true);
    assert<
        IsExact<
            ReturnType<typeof testRoute.parseQuery>,
            Record<string, (string | number | boolean | null)[] | string | number | boolean | null>
        >
    >(true);

    expect(
        testRoute.parseQuery(testRoute.buildQuery({ a: "a", b: true, c: 1, d: null, f: [1, 2], g: undefined }))
    ).toEqual({
        a: "a",
        b: true,
        c: 1,
        d: null,
        f: [1, 2],
    });
});

it("allows to redefine and narrow query params", () => {
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
            Parameters<typeof testRoute.buildQuery>[0],
            {
                a?: string;
                b?: boolean;
                c?: number;
                d?: null;
                f?: number[];
            }
        >
    >(true);
    assert<
        IsExact<
            ReturnType<typeof testRoute.parseQuery>,
            {
                a?: string;
                b?: boolean;
                c?: number;
                d?: null;
                f?: number[];
            }
        >
    >(true);

    expect(testRoute.parseQuery(testRoute.buildQuery({ a: "abc", b: true, c: 1, d: null, f: [1, 2] }))).toEqual({
        a: "abc",
        b: true,
        c: 1,
        d: null,
        f: [1, 2],
    });
});

it("preserves unknown (and therefore untyped) query keys", () => {
    const testRoute = route(path("/test"), query({ a: valid.string }));

    expect(testRoute.parseQuery("?a=abc&b=bar")).toEqual({ a: "abc", b: "bar" });
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

it("detects whether it is possible to store null values in array", () => {
    const arrayNull = { a: valid.arrayOf([valid.number, valid.null]) };
    const flatNull = { a: [valid.number, valid.null] };

    const defaultRoute = route(path("/test"), query(arrayNull, { parseNumbers: true }));
    const bracketRoute = route(path("/test"), query(arrayNull, { arrayFormat: "bracket", parseNumbers: true }));
    const indexRoute = route(path("/test"), query(arrayNull, { arrayFormat: "index", parseNumbers: true }));
    const commaRoute = route(path("/test"), query(flatNull, { arrayFormat: "comma", parseNumbers: true }));
    const separatorRoute = route(path("/test"), query(flatNull, { arrayFormat: "separator", parseNumbers: true }));
    const bracketSeparatorRoute = route(
        path("/test"),
        query(flatNull, { arrayFormat: "bracket-separator", parseNumbers: true })
    );
    const noneRoute = route(path("/test"), query(arrayNull, { arrayFormat: "none", parseNumbers: true }));

    type ArrayNull = { a?: (number | null)[] };
    type ArrayAndFlatNull = { a?: (number | null)[] | number | null };
    type FlatNull = { a?: number | null };

    assert<IsExact<Parameters<typeof defaultRoute.buildQuery>[0], ArrayAndFlatNull>>(true);
    assert<IsExact<Parameters<typeof bracketRoute.buildQuery>[0], ArrayNull>>(true);
    assert<IsExact<Parameters<typeof indexRoute.buildQuery>[0], ArrayNull>>(true);
    assert<IsExact<Parameters<typeof commaRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof separatorRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof noneRoute.buildQuery>[0], ArrayAndFlatNull>>(true);

    assert<IsExact<ReturnType<typeof defaultRoute.parseQuery>, ArrayAndFlatNull>>(true);
    assert<IsExact<ReturnType<typeof bracketRoute.parseQuery>, ArrayNull>>(true);
    assert<IsExact<ReturnType<typeof indexRoute.parseQuery>, ArrayNull>>(true);
    assert<IsExact<ReturnType<typeof commaRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof separatorRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof noneRoute.parseQuery>, ArrayAndFlatNull>>(true);

    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: [null] }))).toEqual({ a: null });
    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(bracketRoute.parseQuery(bracketRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(bracketRoute.parseQuery(bracketRoute.buildQuery({ a: [null] }))).toEqual({ a: [null] });
    expect(bracketRoute.parseQuery(bracketRoute.buildQuery({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(indexRoute.parseQuery(indexRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(indexRoute.parseQuery(indexRoute.buildQuery({ a: [null] }))).toEqual({ a: [null] });
    expect(indexRoute.parseQuery(indexRoute.buildQuery({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(commaRoute.parseQuery(commaRoute.buildQuery({ a: null }))).toEqual({ a: null });
    expect(separatorRoute.parseQuery(separatorRoute.buildQuery({ a: null }))).toEqual({ a: null });
    expect(bracketSeparatorRoute.parseQuery(bracketSeparatorRoute.buildQuery({ a: null }))).toEqual({ a: null });

    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: [null] }))).toEqual({ a: null });
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: [null, null] }))).toEqual({ a: [null, null] });
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
