import { route } from "../route";
import { path } from "../path";
import { query } from "../query";
import { param } from "../param";
import { assert, IsExact } from "conditional-type-checks";

it("allows to use query params", () => {
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

it("allows to redefine and narrow query params", () => {
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
                a?: string | number | boolean;
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

it("doesn't preserve unknown (and therefore untyped) params", () => {
    const testRoute = route(path("/test"), query({ a: param.string }));

    expect(testRoute.parseQuery("?a=abc&b=bar")).toEqual({ a: "abc" });
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

    type ArrayAwareParamsIn = { a?: (string | number | boolean)[] };
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

    const a = defaultRoute.parseQuery("");

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
    const arrayNull = { a: param.arrayOf(param.null) };
    const flatNull = { a: param.null };

    const defaultRoute = route(path("/test"), query(arrayNull));
    const bracketRoute = route(path("/test"), query(arrayNull, { arrayFormat: "bracket" }));
    const indexRoute = route(path("/test"), query(arrayNull, { arrayFormat: "index" }));
    const commaRoute = route(path("/test"), query(flatNull, { arrayFormat: "comma" }));
    const separatorRoute = route(path("/test"), query(flatNull, { arrayFormat: "separator" }));
    const bracketSeparatorRoute = route(path("/test"), query(flatNull, { arrayFormat: "bracket-separator" }));
    const noneRoute = route(path("/test"), query(arrayNull, { arrayFormat: "none" }));

    type ArrayNullIn = { a?: null[] };

    type ArrayNullOut = { a?: null[] };

    type FlatNull = { a?: null };

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

it("allows to specify unions of values", () => {
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

    assert<IsExact<Parameters<typeof testRoute.buildQuery>[0], { n?: 1 | 2 | "abc"; f?: ("foo" | "bar")[] }>>(true);

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

it("allows to pass numbers and booleans to string params", () => {
    const testRoute = route(path("/test"), query({ a: param.string }));

    expect(testRoute.parseQuery(testRoute.buildQuery({ a: 1 }))).toEqual({ a: "1" });
    expect(testRoute.parseQuery(testRoute.buildQuery({ a: true }))).toEqual({ a: "true" });
});

it("allows storing date values", () => {
    const testRoute = route(path("/test"), query({ date: param.date }));

    const date = new Date();

    expect(testRoute.parseQuery(testRoute.buildQuery({ date }))).toEqual({ date });
});
