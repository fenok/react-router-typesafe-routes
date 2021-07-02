import { route } from "../route";
import { path } from "./index";
import { param } from "../transformer";
import { assert, IsExact } from "conditional-type-checks";

it("allows path without parameters", () => {
    const processor = path("/test");

    assert<IsExact<Parameters<typeof processor.build>[0], Record<string, unknown>>>(true);

    expect(processor.build({})).toBe("/test");

    // Reminder that any truthy value can be passed, but that's how react-router generatePath is typed
    expect(processor.build({ any: "value" })).toBe("/test");

    assert<IsExact<ReturnType<typeof processor.parse>, Record<string, unknown> | undefined>>(true);

    expect(processor.parse({})).toEqual({});
    expect(processor.parse({ params: {}, isExact: false, path: "/test", url: "/test" })).toEqual({});
    expect(
        processor.parse({
            params: {},
            isExact: false,
            path: "/other-path/:id",
            url: "/other-path/1",
        })
    ).toBe(undefined);
});

it("infers path params from path", () => {
    const processor = path("/test/:id(\\d+)/:id2?/:id3*");

    assert<
        IsExact<
            Parameters<typeof processor.build>[0],
            { id: string | number | boolean; id2?: string | number | boolean; id3?: string | number | boolean }
        >
    >(true);

    expect(processor.build({ id: 1 })).toBe("/test/1");
    expect(processor.build({ id: 1, id2: "abc" })).toBe("/test/1/abc");
    expect(processor.build({ id: 1, id3: true })).toBe("/test/1/true");
    expect(processor.build({ id: 1, id2: "abc", id3: true })).toBe("/test/1/abc/true");

    assert<
        IsExact<
            ReturnType<typeof processor.parse>,
            | {
                  id: string;
                  id2?: string;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(processor.parse({ id: "1" })).toEqual({ id: "1" });
    expect(processor.parse({ id: "1", id2: "abc", id3: "true", foo: "12" })).toEqual({
        id: "1",
        id2: "abc",
        id3: "true",
        foo: "12",
    });
    expect(processor.parse({ id2: "abc", id3: "true" })).toBe(undefined);
    expect(processor.parse({ foo: "abc" })).toBe(undefined);
});

it("allows to redefine and narrow path params", () => {
    // Parameters of this path are inferred incorrectly
    const processor = path("/test/:id(true|false)/:id2(\\d+)?/:id3*", {
        id: param.boolean,
        id2: param.number.optional,
        id3: param.string.optional,
    });

    assert<
        IsExact<Parameters<typeof processor.build>[0], { id: boolean; id2?: number; id3?: string | number | boolean }>
    >(true);

    expect(processor.build({ id: true })).toBe("/test/true");
    expect(processor.build({ id: true, id2: 2 })).toBe("/test/true/2");
    expect(processor.build({ id: true, id3: "abc" })).toBe("/test/true/abc");
    expect(processor.build({ id: true, id2: 2, id3: "abc" })).toBe("/test/true/2/abc");

    assert<
        IsExact<
            ReturnType<typeof processor.parse>,
            | {
                  id: boolean;
                  id2?: number;
                  id3?: string;
              }
            | undefined
        >
    >(true);

    expect(processor.parse({ id: "true" })).toEqual({ id: true });
    expect(processor.parse({ id: "true", id2: "1", id3: "abc", foo: "12" })).toEqual({
        id: true,
        id2: 1,
        id3: "abc",
    });
    expect(processor.parse({ id2: "1", id3: "abc" })).toBe(undefined);
    expect(processor.parse({ foo: "abc" })).toBe(undefined);
});

it("allows to specify numbers and booleans for string params", () => {
    const processor = path("/test/:id", { id: param.string });

    expect(processor.build({ id: 1 })).toBe("/test/1");
    expect(processor.build({ id: true })).toBe("/test/true");
});

it("allows to specify unions of values", () => {
    const processor = path("/test/:id", { id: param.oneOf("1", "2") });
    const optionalProcessor = path("/test/:id?", { id: param.oneOf("1", "2").optional });

    assert<IsExact<Parameters<typeof processor.build>[0], { id: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof processor.parse>, { id: "1" | "2" } | undefined>>(true);

    assert<IsExact<Parameters<typeof optionalProcessor.build>[0], { id?: "1" | "2" }>>(true);
    assert<IsExact<ReturnType<typeof optionalProcessor.parse>, { id?: "1" | "2" } | undefined>>(true);

    expect(processor.parse({ id: "1" })).toEqual({ id: "1" });
    expect(processor.parse({ id: "2" })).toEqual({ id: "2" });
    expect(processor.parse({ id: "3" })).toEqual(undefined);
    expect(processor.parse({})).toEqual(undefined);

    expect(optionalProcessor.parse({ id: "1" })).toEqual({ id: "1" });
    expect(optionalProcessor.parse({ id: "2" })).toEqual({ id: "2" });
    expect(optionalProcessor.parse({ id: "3" })).toEqual(undefined);
    expect(optionalProcessor.parse({})).toEqual({ id: undefined });
});
