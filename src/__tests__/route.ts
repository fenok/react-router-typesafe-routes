import { query, hash, path, route, param } from "../index";
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

it("infers path param from path", () => {
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

it("allows to redefine and narrow path param", () => {
    // Parameters of this path are inferred incorrectly
    const testRoute = route(
        path("/test/:id(true|false)/:id2(\\d+)?/:id3*", {
            id: param.boolean,
            id2: param.number.optional,
            id3: param.string.optional,
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

it("allows to specify unions for path param", () => {
    const testRoute = route(path("/test/:id", { id: param.oneOf("1", "2") }));
    const testOptionalRoute = route(path("/test/:id?", { id: param.oneOf("1", "2").optional }));

    assert<IsExact<Parameters<typeof testRoute.buildPath>[0], { id: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof testRoute.parsePath>, { id: "1" | "2" } | undefined>>(true);

    assert<IsExact<Parameters<typeof testOptionalRoute.buildPath>[0], { id?: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof testOptionalRoute.parsePath>, { id?: "1" | "2" } | undefined>>(true);

    expect(testRoute.parsePath({ id: "1" })).toEqual({ id: "1" });
    expect(testRoute.parsePath({ id: "2" })).toEqual({ id: "2" });
    expect(() => testRoute.parsePath({ id: "3" })).toThrow();
    expect(testRoute.parsePath({})).toEqual(undefined);

    expect(testOptionalRoute.parsePath({ id: "1" })).toEqual({ id: "1" });
    expect(testOptionalRoute.parsePath({ id: "2" })).toEqual({ id: "2" });
    expect(() => testOptionalRoute.parsePath({ id: "3" })).toThrow();
    expect(testOptionalRoute.parsePath({})).toEqual({ id: undefined });
});

it("allows to specify array of param", () => {
    const testRoute = route(path("/test/:id", { id: [param.number, param.oneOf("abc", true)] }));
    const testOptionalRoute = route(path("/test/:id?", { id: [param.number, param.oneOf("abc", true).optional] }));

    assert<IsExact<Parameters<typeof testRoute.buildPath>[0], { id: number | "abc" | true }>>(true);
    assert<IsExact<ReturnType<typeof testRoute.parsePath>, { id: number | "abc" | true } | undefined>>(true);

    assert<IsExact<Parameters<typeof testOptionalRoute.buildPath>[0], { id?: number | "abc" | true }>>(true);
    assert<IsExact<ReturnType<typeof testOptionalRoute.parsePath>, { id?: number | "abc" | true } | undefined>>(true);

    expect(testRoute.parsePath({ id: "abc" })).toEqual({ id: "abc" });
    expect(testRoute.parsePath({ id: "true" })).toEqual({ id: true });
    expect(testRoute.parsePath({ id: "42" })).toEqual({ id: 42 });
    expect(() => testRoute.parsePath({ id: "false" })).toThrow();
    expect(testRoute.parsePath({})).toEqual(undefined);

    expect(testOptionalRoute.parsePath({ id: "abc" })).toEqual({ id: "abc" });
    expect(testOptionalRoute.parsePath({ id: "true" })).toEqual({ id: true });
    expect(testOptionalRoute.parsePath({ id: "42" })).toEqual({ id: 42 });
    expect(() => testOptionalRoute.parsePath({ id: "false" })).toThrow();
    expect(testOptionalRoute.parsePath({})).toEqual({ id: undefined });
});

it("allows to use query param", () => {
    const testRoute = route(
        path("/test"),
        query(null, { parseNumbers: true, parseBooleans: true, arrayFormat: "bracket" })
    );

    // Build param are typed as Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
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

it("allows to redefine and narrow query param", () => {
    const testRoute = route(
        path("/test"),
        query(
            {
                a: param.string,
                b: param.boolean,
                c: param.number,
                d: param.null,
                f: param.arrayOf(param.number),
            },
            { arrayFormat: "bracket" }
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
                f?: (number | undefined)[];
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
    const testRoute = route(path("/test"), query({ a: param.string }));

    expect(testRoute.parseQuery("?a=abc&b=bar")).toEqual({ a: "abc", b: "bar" });
});

it("allows single value to be stored as array regardless of array format", () => {
    const queryShape = { a: param.arrayOf(param.string) };

    const defaultRoute = route(path("/test"), query(queryShape));
    const bracketRoute = route(path("/test"), query(queryShape, { arrayFormat: "bracket" }));
    const indexRoute = route(path("/test"), query(queryShape, { arrayFormat: "index" }));
    const commaRoute = route(path("/test"), query(queryShape, { arrayFormat: "comma" }));
    const separatorRoute = route(path("/test"), query(queryShape, { arrayFormat: "separator" }));
    const bracketSeparatorRoute = route(path("/test"), query(queryShape, { arrayFormat: "bracket-separator" }));
    const noneRoute = route(path("/test"), query(queryShape, { arrayFormat: "none" }));

    type ArrayAwareParamsIn = { a?: (string | undefined)[] };
    type ArrayAwareParamsOut = { a?: string[] };

    assert<IsExact<Parameters<typeof defaultRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof bracketRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof indexRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof commaRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof separatorRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof noneRoute.buildQuery>[0], ArrayAwareParamsIn>>(true);

    assert<IsExact<ReturnType<typeof defaultRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof bracketRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof indexRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof commaRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof separatorRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorRoute.parseQuery>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof noneRoute.parseQuery>, ArrayAwareParamsOut>>(true);

    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(bracketRoute.parseQuery(bracketRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(indexRoute.parseQuery(indexRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(commaRoute.parseQuery(commaRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(separatorRoute.parseQuery(separatorRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(bracketSeparatorRoute.parseQuery(bracketSeparatorRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: ["abc"] }))).toEqual({ a: ["abc"] });

    expect(defaultRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(bracketRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(indexRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(commaRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(separatorRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(bracketSeparatorRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
    expect(noneRoute.parseQuery("?a=abc")).toEqual({ a: ["abc"] });
});

it("detects whether it is possible to store null values in array", () => {
    const arrayNull = { a: param.arrayOf(param.number, param.null) };
    const flatNull = { a: [param.number, param.null] };

    const defaultRoute = route(path("/test"), query(arrayNull));
    const bracketRoute = route(path("/test"), query(arrayNull, { arrayFormat: "bracket" }));
    const indexRoute = route(path("/test"), query(arrayNull, { arrayFormat: "index" }));
    const commaRoute = route(path("/test"), query(flatNull, { arrayFormat: "comma" }));
    const separatorRoute = route(path("/test"), query(flatNull, { arrayFormat: "separator" }));
    const bracketSeparatorRoute = route(path("/test"), query(flatNull, { arrayFormat: "bracket-separator" }));
    const noneRoute = route(path("/test"), query(arrayNull, { arrayFormat: "none" }));

    type ArrayNullIn = { a?: (number | null | undefined)[] };

    type ArrayNullOut = { a?: (number | null)[] };

    type FlatNull = { a?: number | null };

    assert<IsExact<Parameters<typeof defaultRoute.buildQuery>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof bracketRoute.buildQuery>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof indexRoute.buildQuery>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof commaRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof separatorRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorRoute.buildQuery>[0], FlatNull>>(true);
    assert<IsExact<Parameters<typeof noneRoute.buildQuery>[0], ArrayNullIn>>(true);

    assert<IsExact<ReturnType<typeof defaultRoute.parseQuery>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof bracketRoute.parseQuery>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof indexRoute.parseQuery>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof commaRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof separatorRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorRoute.parseQuery>, FlatNull>>(true);
    assert<IsExact<ReturnType<typeof noneRoute.parseQuery>, ArrayNullOut>>(true);

    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(defaultRoute.parseQuery(defaultRoute.buildQuery({ a: [null] }))).toEqual({ a: [null] });
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
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: [null] }))).toEqual({ a: [null] });
    expect(noneRoute.parseQuery(noneRoute.buildQuery({ a: [null, null] }))).toEqual({ a: [null, null] });
});

it("allows types that are either array or single value in query", () => {
    const testRoute = route(
        path("/test"),
        query(
            { a: [param.number, param.arrayOf<string | boolean>(param.boolean, param.string)] },
            { arrayFormat: "bracket" }
        )
    );

    assert<IsExact<Parameters<typeof testRoute.buildQuery>[0], { a?: (string | boolean | undefined)[] | number }>>(
        true
    );

    expect(testRoute.parseQuery(testRoute.buildQuery({ a: 1 }))).toEqual({ a: 1 });
    expect(testRoute.parseQuery(testRoute.buildQuery({ a: ["abc", true] }))).toEqual({ a: ["abc", true] });
    expect(testRoute.parseQuery(testRoute.buildQuery({ a: [] }))).toEqual({ a: undefined });
    expect(testRoute.parseQuery("?a[]")).toEqual({ a: undefined });
    expect(testRoute.parseQuery("?a[]=1")).toEqual({ a: ["1"] });
});

it("allows to specify unions for query keys", () => {
    const testRoute = route(
        path("/test"),
        query(
            {
                n: param.oneOf(1, 2, "abc"),
                f: param.arrayOf(param.oneOf("foo", "bar")),
            },
            { arrayFormat: "bracket" }
        )
    );

    assert<
        IsExact<Parameters<typeof testRoute.buildQuery>[0], { n?: 1 | 2 | "abc"; f?: ("foo" | "bar" | undefined)[] }>
    >(true);

    expect(testRoute.parseQuery(testRoute.buildQuery({ n: "abc", f: ["foo", "bar"] }))).toEqual({
        n: "abc",
        f: ["foo", "bar"],
    });

    expect(testRoute.parseQuery(testRoute.buildQuery({ n: 2, f: ["foo", "bar"] }))).toEqual({
        n: 2,
        f: ["foo", "bar"],
    });

    expect(testRoute.parseQuery("?n=4&f[]=baz")).toEqual({ n: undefined, f: undefined });
});

it("respects param order", () => {
    const testRouteNumbers = route(path("/test"), query({ a: [param.number, param.string] }));
    const testRouteBooleans = route(path("/test"), query({ a: [param.string, param.boolean] }));

    expect(testRouteNumbers.parseQuery(testRouteNumbers.buildQuery({ a: "1" }))).toEqual({ a: 1 });
    expect(testRouteBooleans.parseQuery(testRouteBooleans.buildQuery({ a: true }))).toEqual({ a: "true" });
});

it("allows to specify hash", () => {
    const testRoute = route(path("/test"), null, hash("foo", "bar"));

    expect(testRoute.build({}, null, "foo")).toBe("/test#foo");
});
