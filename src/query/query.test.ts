import { query } from "./query";
import { param } from "../param";
import { assert, IsExact } from "conditional-type-checks";

it("allows to use query params", () => {
    const processor = query(null, { parseNumbers: true, parseBooleans: true, arrayFormat: "bracket" });

    // Build param are typed as Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assert<IsExact<Parameters<typeof processor.build>[0], Record<string, any>>>(true);
    assert<
        IsExact<
            ReturnType<typeof processor.parse>,
            Record<string, (string | number | boolean | null)[] | string | number | boolean | null>
        >
    >(true);

    expect(processor.parse(processor.build({ a: "a", b: true, c: 1, d: null, f: [1, 2], g: undefined }))).toEqual({
        a: "a",
        b: true,
        c: 1,
        d: null,
        f: [1, 2],
    });
});

it("allows to redefine and narrow query params", () => {
    const processor = query(
        {
            a: param.string.optional,
            b: param.boolean.optional,
            c: param.number.optional,
            d: param.null.optional,
            f: param.arrayOf(param.number).optional,
        },
        { arrayFormat: "bracket" }
    );

    assert<
        IsExact<
            Parameters<typeof processor.build>[0],
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
            ReturnType<typeof processor.parse>,
            {
                a?: string;
                b?: boolean;
                c?: number;
                d?: null;
                f?: number[];
            }
        >
    >(true);

    expect(processor.parse(processor.build({ a: "abc", b: true, c: 1, d: null, f: [1, 2] }))).toEqual({
        a: "abc",
        b: true,
        c: 1,
        d: null,
        f: [1, 2],
    });
});

it("doesn't preserve unknown (and therefore untyped) params", () => {
    const processor = query({ a: param.string.optional });

    expect(processor.parse("?a=abc&b=bar")).toEqual({ a: "abc" });
});

it("allows single value to be stored as array regardless of array format", () => {
    const queryShape = { a: param.arrayOf(param.string).optional };

    const defaultProcessor = query(queryShape);
    const bracketProcessor = query(queryShape, { arrayFormat: "bracket" });
    const indexProcessor = query(queryShape, { arrayFormat: "index" });
    const commaProcessor = query(queryShape, { arrayFormat: "comma" });
    const separatorProcessor = query(queryShape, { arrayFormat: "separator" });
    const bracketSeparatorProcessor = query(queryShape, { arrayFormat: "bracket-separator" });
    const noneProcessor = query(queryShape, { arrayFormat: "none" });

    type ArrayAwareParamsIn = { a?: (string | number | boolean)[] };
    type ArrayAwareParamsOut = { a?: string[] };

    assert<IsExact<Parameters<typeof defaultProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof bracketProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof indexProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof commaProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof separatorProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorProcessor.build>[0], ArrayAwareParamsIn>>(true);
    assert<IsExact<Parameters<typeof noneProcessor.build>[0], ArrayAwareParamsIn>>(true);

    assert<IsExact<ReturnType<typeof defaultProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof bracketProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof indexProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof commaProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof separatorProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorProcessor.parse>, ArrayAwareParamsOut>>(true);
    assert<IsExact<ReturnType<typeof noneProcessor.parse>, ArrayAwareParamsOut>>(true);

    expect(defaultProcessor.parse(defaultProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(bracketProcessor.parse(bracketProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(indexProcessor.parse(indexProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(commaProcessor.parse(commaProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(separatorProcessor.parse(separatorProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });
    expect(bracketSeparatorProcessor.parse(bracketSeparatorProcessor.build({ a: ["abc"] }))).toEqual({
        a: ["abc"],
    });
    expect(noneProcessor.parse(noneProcessor.build({ a: ["abc"] }))).toEqual({ a: ["abc"] });

    expect(defaultProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(bracketProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(indexProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(commaProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(separatorProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(bracketSeparatorProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
    expect(noneProcessor.parse("?a=abc")).toEqual({ a: ["abc"] });
});

it("detects whether it is possible to store null values in array", () => {
    const arrayNull = { a: param.arrayOf(param.null).optional };
    const flatNull = { a: param.null.optional };

    const defaultProcessor = query(arrayNull);
    const bracketProcessor = query(arrayNull, { arrayFormat: "bracket" });
    const indexProcessor = query(arrayNull, { arrayFormat: "index" });
    const commaProcessor = query(flatNull, { arrayFormat: "comma" });
    const separatorProcessor = query(flatNull, { arrayFormat: "separator" });
    const bracketSeparatorProcessor = query(flatNull, { arrayFormat: "bracket-separator" });
    const noneProcessor = query(arrayNull, { arrayFormat: "none" });

    type ArrayNullIn = { a?: null[] };
    type ArrayNullOut = { a?: null[] };
    type FlatNullIn = { a?: null };
    type FlatNullOut = { a?: null };

    assert<IsExact<Parameters<typeof defaultProcessor.build>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof bracketProcessor.build>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof indexProcessor.build>[0], ArrayNullIn>>(true);
    assert<IsExact<Parameters<typeof commaProcessor.build>[0], FlatNullIn>>(true);
    assert<IsExact<Parameters<typeof separatorProcessor.build>[0], FlatNullIn>>(true);
    assert<IsExact<Parameters<typeof bracketSeparatorProcessor.build>[0], FlatNullIn>>(true);
    assert<IsExact<Parameters<typeof noneProcessor.build>[0], ArrayNullIn>>(true);

    assert<IsExact<ReturnType<typeof defaultProcessor.parse>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof bracketProcessor.parse>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof indexProcessor.parse>, ArrayNullOut>>(true);
    assert<IsExact<ReturnType<typeof commaProcessor.parse>, FlatNullOut>>(true);
    assert<IsExact<ReturnType<typeof separatorProcessor.parse>, FlatNullOut>>(true);
    assert<IsExact<ReturnType<typeof bracketSeparatorProcessor.parse>, FlatNullOut>>(true);
    assert<IsExact<ReturnType<typeof noneProcessor.parse>, ArrayNullOut>>(true);

    expect(defaultProcessor.parse(defaultProcessor.build({ a: [] }))).toEqual({ a: [] });
    expect(defaultProcessor.parse(defaultProcessor.build({ a: [null] }))).toEqual({ a: [null] });
    expect(defaultProcessor.parse(defaultProcessor.build({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(bracketProcessor.parse(bracketProcessor.build({ a: [] }))).toEqual({ a: [] });
    expect(bracketProcessor.parse(bracketProcessor.build({ a: [null] }))).toEqual({ a: [null] });
    expect(bracketProcessor.parse(bracketProcessor.build({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(indexProcessor.parse(indexProcessor.build({ a: [] }))).toEqual({ a: [] });
    expect(indexProcessor.parse(indexProcessor.build({ a: [null] }))).toEqual({ a: [null] });
    expect(indexProcessor.parse(indexProcessor.build({ a: [null, null] }))).toEqual({ a: [null, null] });
    expect(commaProcessor.parse(commaProcessor.build({ a: null }))).toEqual({ a: null });
    expect(separatorProcessor.parse(separatorProcessor.build({ a: null }))).toEqual({ a: null });
    expect(bracketSeparatorProcessor.parse(bracketSeparatorProcessor.build({ a: null }))).toEqual({ a: null });

    expect(noneProcessor.parse(noneProcessor.build({ a: [] }))).toEqual({ a: [] });
    expect(noneProcessor.parse(noneProcessor.build({ a: [null] }))).toEqual({ a: [null] });
    expect(noneProcessor.parse(noneProcessor.build({ a: [null, null] }))).toEqual({ a: [null, null] });
});

it("allows to specify unions of values", () => {
    const processor = query(
        {
            n: param.oneOf(1, 2, "abc").optional,
            f: param.arrayOf(param.oneOf("foo", "bar")).optional,
        },
        { arrayFormat: "bracket" }
    );

    assert<IsExact<Parameters<typeof processor.build>[0], { n?: 1 | 2 | "abc"; f?: ("foo" | "bar")[] }>>(true);

    expect(processor.parse(processor.build({ n: "abc", f: ["foo", "bar"] }))).toEqual({
        n: "abc",
        f: ["foo", "bar"],
    });

    expect(processor.parse(processor.build({ n: 2, f: ["foo", "bar"] }))).toEqual({
        n: 2,
        f: ["foo", "bar"],
    });

    expect(processor.parse("?n=4&f[]=baz")).toEqual({});
});

it("allows to pass numbers and booleans to string params", () => {
    const processor = query({ a: param.string.optional });

    expect(processor.parse(processor.build({ a: 1 }))).toEqual({ a: "1" });
    expect(processor.parse(processor.build({ a: true }))).toEqual({ a: "true" });
});

it("allows storing date values", () => {
    const processor = query({ date: param.date.optional });

    const date = new Date();

    expect(processor.parse(processor.build({ date }))).toEqual({ date });
    expect(processor.parse("?date=invalid")).toEqual({});
});

it("allows specifying default values for optional params", () => {
    const processor = query({ foo: param.number.optional(1) });

    assert<IsExact<ReturnType<typeof processor.parse>, { foo: number }>>(true);

    expect(processor.parse(processor.build({}))).toEqual({ foo: 1 });
    expect(processor.parse(processor.build({ foo: 2 }))).toEqual({ foo: 2 });
    expect(processor.parse("?foo=3")).toEqual({ foo: 3 });
    expect(processor.parse("?foo=foo")).toEqual({ foo: 1 });
});
