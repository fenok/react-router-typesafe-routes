import { route } from "./route.js";
import { createSearchParams } from "react-router-dom";
import {
    number,
    boolean,
    string,
    date,
    type,
    union,
    ParamType,
    SearchParamType,
    StateParamType,
    BaseRoute,
} from "../common/index.js";
import { assert, IsExact } from "conditional-type-checks";
import { zod } from "../zod/index.js";
import { z } from "zod";
import { yup } from "../yup/index.js";
import * as y from "yup";

it("provides absolute path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/child/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/child/grand");
});

it("provides absolute path with optional segments", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/optional-child?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/optional?",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test/optional?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/optional?/child/optional-child?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/optional?/child/optional-child?/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test/optional?");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/optional?/child/optional-child?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/optional?/child/optional-child?/grand");
});

it("provides absolute path with optional dynamic segments", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/:optional-child?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/:optional?",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test/:optional?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/:optional?/child/:optional-child?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/:optional?/child/:optional-child?/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test/:optional?");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/:optional?/child/:optional-child?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/:optional?/child/:optional-child?/grand");
});

it("preserves intermediate stars in absolute path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/child/*/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/child/*/grand");
});

it("preserves optional intermediate stars in absolute path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/*?",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/*?/child/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/*?/child/*?/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test/*?");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/*?/child/*?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/*?/child/*?/grand");
});

it("provides relative path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/child/grand");
});

it("provides relative path with optional segments", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/:dynamic-param?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/dynamic?",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test/dynamic?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/dynamic?/child/:dynamic-param?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/dynamic?/child/:dynamic-param?/grand">>(
        true
    );

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test/dynamic?");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/dynamic?/child/:dynamic-param?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/dynamic?/child/:dynamic-param?/grand");
});

it("removes intermediate stars from relative path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/child/grand");
});

it("removes multiple intermediate stars from relative path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/*",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/child/*">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test/*");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/child/*");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/child/grand");
});

it("removes multiple optional intermediate stars from relative path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/*?",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/child/*?">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/child/grand">>(true);

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test/*?");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/child/*?");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/child/grand");
});

it("allows empty segment at the beginning of the route", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/child/grand">>(true);

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "child/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/child/grand");

    expect(TEST_ROUTE.$relativePath).toStrictEqual("");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("child/grand");
});

it("allows empty segment in the middle of the route", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/grand">>(true);

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/grand");

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/grand");
});

it("allows empty segment at the end of the route", () => {
    const GRANDCHILD = route({
        path: "",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$path, "/test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$path, "/test/child">>(true);

    assert<IsExact<typeof TEST_ROUTE.$relativePath, "test">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$relativePath, "test/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.GRANDCHILD.$relativePath, "test/child">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$path).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$path).toStrictEqual("/test/child");

    expect(TEST_ROUTE.$relativePath).toStrictEqual("test");
    expect(TEST_ROUTE.CHILD.$relativePath).toStrictEqual("test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$relativePath).toStrictEqual("test/child");
});

it("allows implicit path params", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/:id",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { id: string }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: "42" })).toStrictEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: "24" })).toStrictEqual("/test/child/24/grand");
});

it("allows explicit path params", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/:id",
        params: { id: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id: number }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { id: number }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: 42 })).toStrictEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: 24 })).toStrictEqual("/test/child/24/grand");
});

it("allows to mix explicit and implicit path params", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/:id/:value",
        params: { id: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { id: number; value: string }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: 42, value: "foo" })).toStrictEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: 24, value: "bar" })).toStrictEqual("/test/child/24/bar/grand");
});

it("allows to mix explicit and implicit path params in case of optional params", () => {
    const GRANDCHILD = route({
        path: "grand/:name",
    });
    const CHILD = route({
        path: "child/:id?/:value?",
        params: { id: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id?: number; value?: string }>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0],
            { id?: number; value?: string; name: string }
        >
    >(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: 42 })).toStrictEqual("/test/child/42");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: 24, value: "bar", name: "baz" })).toStrictEqual(
        "/test/child/24/bar/grand/baz"
    );
});

it("allows to mix explicit and implicit path params across multiple routes", () => {
    const GRANDCHILD = route({
        path: "grand/:name",
    });
    const CHILD = route({
        path: "child/:id/:value",
        params: { id: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id: number; value: string }>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0],
            { id: number; value: string; name: string }
        >
    >(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: 42, value: "foo" })).toStrictEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: 24, value: "bar", name: "baz" })).toStrictEqual(
        "/test/child/24/bar/grand/baz"
    );
});

it("prioritizes children when mixing path params with the same name", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: boolean() },
    });
    const CHILD = route({
        path: "child/:id/:value",
        params: { id: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { id: number; value: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { id: boolean; value: string }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ id: 42, value: "foo" })).toStrictEqual("/test/child/42/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ id: false, value: "bar" })).toStrictEqual(
        "/test/child/false/bar/grand/false"
    );
});

it("allows implicit star path param", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ "*": "star/param" })).toStrictEqual("/test/child/star/param");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ "*": "star/param" })).toStrictEqual("/test/child/grand");
});

it("allows implicit optional star path param", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ "*": "star/param" })).toStrictEqual("/test/child/star/param");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ "*": "star/param" })).toStrictEqual("/test/child/grand");
});

it("allows explicit star path param", () => {
    const GRANDCHILD = route({
        path: "grand/*",
        params: { "*": number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ "*": 42 })).toStrictEqual("/test/child/grand/42");
});

it("allows explicit optional star path param", () => {
    const GRANDCHILD = route({
        path: "grand/*?",
        params: { "*": number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ "*": 42 })).toStrictEqual("/test/child/grand/42");
});

it("always treats star param as optional upon building", () => {
    const GRANDCHILD = route({
        path: "grand/*",
        params: { "*": number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], { "*"?: number }>>(true);

    expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({})).toStrictEqual("/test/child/grand");
});

it("allows star path param in the middle of combined path", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[0], { "*"?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[0], Record<never, never>>>(true);

    expect(TEST_ROUTE.$buildPath({ "*": "foo" })).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({ "*": "foo" })).toStrictEqual("/test/child/foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ "*": "foo" })).toStrictEqual("/test/child/grand");
});

it("allows search params", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { foo: number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, {})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, { foo: 1 })).toStrictEqual("/test/child/grand?foo=1");
});

it("allows to mix search params across multiple routes", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { foo: number().defined() },
    });
    const CHILD = route({
        path: "child",
        searchParams: { bar: number().default(1).array() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[1], { bar?: number[] } | undefined>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[1],
            { foo?: number; bar?: number[] } | undefined
        >
    >(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, { bar: [1, 2] })).toStrictEqual("/test/child?bar=1&bar=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, { foo: 1, bar: [1, 2] })).toStrictEqual(
        "/test/child/grand?foo=1&bar=1&bar=2"
    );
});

it("prioritizes children when mixing search params with the same name", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { foo: number() },
    });
    const CHILD = route({
        path: "child",
        searchParams: { foo: number().defined().array() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[1], Record<never, never> | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[1], { foo?: number[] } | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[1], { foo?: number } | undefined>>(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, { foo: [1, 2] })).toStrictEqual("/test/child?foo=1&foo=2");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, { foo: 1 })).toStrictEqual("/test/child/grand?foo=1");
});

it("allows implicit hash params", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: string(),
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[2], string | undefined>>(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, {})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, {}, "my-id")).toStrictEqual("/test/child/grand#my-id");
});

it("allows explicit hash params", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: ["foo", "bar"],
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[2], "foo" | "bar" | undefined>>(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, {})).toStrictEqual("/test/child");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, {}, "foo")).toStrictEqual("/test/child/grand#foo");
});

it("allows mixing explicit hash params across multiple routes", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: ["foo", "bar"],
    });
    const CHILD = route({
        path: "child",
        hash: ["baz"],
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[2], "baz" | "foo" | "bar" | undefined>>(
        true
    );

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, {}, "baz")).toStrictEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, {}, "baz")).toStrictEqual("/test/child/grand#baz");
});

it("allows mixing explicit and implicit hash params across multiple routes", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: string(),
    });
    const CHILD = route({
        path: "child",
        hash: ["baz"],
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[2], undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPath>[2], "baz" | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPath>[2], string | undefined>>(true);

    expect(TEST_ROUTE.$buildPath({}, {})).toStrictEqual("/test");
    expect(TEST_ROUTE.CHILD.$buildPath({}, {}, "baz")).toStrictEqual("/test/child#baz");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({}, {}, "anything")).toStrictEqual("/test/child/grand#anything");
});

it("allows state params", () => {
    const GRANDCHILD = route({
        path: "grand",
        state: { bar: number() },
    });
    const CHILD = route({
        path: "child",
        state: { foo: string() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0], { foo?: string; bar?: number }>>(
        true
    );

    expect(TEST_ROUTE.$buildState({})).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$buildState({ foo: "test" })).toStrictEqual({ foo: "test" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildState({ foo: "test", bar: 1 })).toStrictEqual({ foo: "test", bar: 1 });
});

it("allows implicit path params parsing", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { id: string }>>(true);

    expect(TEST_ROUTE.$getTypedParams({})).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({})).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ id: "1" })).toStrictEqual({ id: "1" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({})).toThrow();
});

it("allows implicit optional path params parsing", () => {
    const GRANDCHILD = route({
        path: "grand/:id?",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { id?: string }>>(true);

    expect(TEST_ROUTE.$getTypedParams({})).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({})).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ id: "1" })).toStrictEqual({ id: "1" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({})).toStrictEqual({});
});

it("allows explicit path params parsing", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { id?: number }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ id: "1" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ id: "1" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ id: "1" })).toStrictEqual({ id: 1 });
});

it("allows to mix path params parsing across multiple routes", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: number() },
    });
    const CHILD = route({
        path: "child/:childId",
        params: { childId: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId?: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId?: number; id?: number }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ id: "1", childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ id: "1", childId: "2" })).toStrictEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ id: "1", childId: "2" })).toStrictEqual({ id: 1, childId: 2 });
});

it("provides untyped path params", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
    });
    const CHILD = route({
        path: "child/:childId/:opt?",
        params: { childId: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getUntypedParams>, Record<string, string | undefined>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getUntypedParams>, Record<string, string | undefined>>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedParams>, Record<string, string | undefined>>
    >(true);

    expect(TEST_ROUTE.$getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })).toStrictEqual({
        id: "1",
        childId: "2",
        opt: "3",
        untyped: "untyped",
    });
    expect(TEST_ROUTE.CHILD.$getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })).toStrictEqual({
        id: "1",
        untyped: "untyped",
    });
    expect(
        TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedParams({ id: "1", childId: "2", opt: "3", untyped: "untyped" })
    ).toStrictEqual({
        untyped: "untyped",
    });
});

it("throws if implicit path params are invalid", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
    });
    const CHILD = route({
        path: "child/:childId",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId: string; id: string }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ childId: "2" })).toThrow();
});

it("doesn't throw if implicit optional path params are omitted", () => {
    const GRANDCHILD = route({
        path: "grand/:id?",
    });
    const CHILD = route({
        path: "child/:childId?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId?: string; id?: string }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: "2" });
});

it("doesn't throw if explicit path params are invalid", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: number() },
    });
    const CHILD = route({
        path: "child/:childId",
        params: { childId: number() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId?: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId?: number; id?: number }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
});

it("doesn't throw if explicit path params with defaults are invalid", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: number().default(-1) },
    });
    const CHILD = route({
        path: "child/:childId",
        params: { childId: number().default(-1) },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId: number; id: number }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2, id: -1 });
});

it("throws if explicit throwable path params are invalid", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
        params: { id: number().defined() },
    });
    const CHILD = route({
        path: "child/:childId",
        params: { childId: number().defined() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { childId: number }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { childId: number; id: number }>>(
        true
    );

    expect(TEST_ROUTE.$getTypedParams({ childId: "2" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ childId: "2" })).toStrictEqual({ childId: 2 });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ childId: "2" })).toThrow();
});

it("allows implicit star path param parsing", () => {
    const GRANDCHILD = route({
        path: "grand/*",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*": string }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
});

it("allows implicit optional star path param parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*?",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { "*"?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*"?: string }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({})).toStrictEqual({});
});

it("allows explicit star path param parsing", () => {
    const GRANDCHILD = route({
        path: "grand/*",
        params: { "*": number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*"?: number }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "1" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "1" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ "*": "1" })).toStrictEqual({ "*": 1 });
});

it("allows explicit star path param parsing (with default value)", () => {
    const GRANDCHILD = route({
        path: "grand/*",
        params: { "*": number().default(42) },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*": number }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ "*": "" })).toStrictEqual({ "*": 42 });
});

it("doesn't throw if explicit star param is invalid", () => {
    const GRANDCHILD = route({
        path: "grand/*",
        params: { "*": number() },
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*"?: number }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "foo" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "foo" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ "*": "foo" })).toStrictEqual({});
});

it("allows intermediate star param parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child/*",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedParams>, { "*": string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams>, { "*": string }>>(true);

    expect(TEST_ROUTE.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
});

it("allows search params parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { foo: number().default(0) },
    });
    const CHILD = route({
        path: "child",
        searchParams: { foo: string(), arr: number().defined().array() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedSearchParams>, { foo?: string; arr: number[] }>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedSearchParams>, { foo: number; arr: number[] }>
    >(true);

    const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

    expect(TEST_ROUTE.$getTypedSearchParams(testSearchParams)).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: "foo" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: 0 });

    expect(TEST_ROUTE.$getUntypedSearchParams(testSearchParams).getAll("arr")).toStrictEqual(["1", "2"]);
    expect(TEST_ROUTE.CHILD.$getUntypedSearchParams(testSearchParams).getAll("arr")).toStrictEqual([]);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedSearchParams(testSearchParams).getAll("arr")).toStrictEqual([]);

    expect(TEST_ROUTE.$getUntypedSearchParams(testSearchParams).get("foo")).toStrictEqual("foo");
    expect(TEST_ROUTE.CHILD.$getUntypedSearchParams(testSearchParams).get("foo")).toStrictEqual(null);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedSearchParams(testSearchParams).get("foo")).toStrictEqual(null);

    expect(TEST_ROUTE.$getUntypedSearchParams(testSearchParams).get("untyped")).toStrictEqual("untyped");
    expect(TEST_ROUTE.CHILD.$getUntypedSearchParams(testSearchParams).get("untyped")).toStrictEqual("untyped");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedSearchParams(testSearchParams).get("untyped")).toStrictEqual(
        "untyped"
    );
});

it("throws if throwable search params are invalid", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { foo: number().defined() },
    });
    const CHILD = route({
        path: "child",
        searchParams: { foo: string(), arr: number().defined().array() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedSearchParams>, { foo?: string; arr: number[] }>>(true);
    assert<
        IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedSearchParams>, { foo: number; arr: number[] }>
    >(true);

    const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

    expect(TEST_ROUTE.$getTypedSearchParams(testSearchParams)).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: "foo" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$getTypedSearchParams(testSearchParams)).toThrow();
});

it("allows hash parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: string(),
    });
    const CHILD = route({
        path: "child",
        hash: ["foo", "bar"],
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    const testHash = "#foo";

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedHash>, undefined>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedHash>, "foo" | "bar" | undefined>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedHash>, string | undefined>>(true);

    expect(TEST_ROUTE.$getTypedHash(testHash)).toStrictEqual(undefined);
    expect(TEST_ROUTE.CHILD.$getTypedHash(testHash)).toStrictEqual("foo");
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedHash(testHash)).toStrictEqual("foo");
});

it("allows any hash parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
        hash: string(),
    });
    const CHILD = route({
        path: "child",
        hash: ["foo", "bar"],
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    const testHash = "#baz";

    expect(TEST_ROUTE.$getTypedHash(testHash)).toStrictEqual(undefined);
    expect(TEST_ROUTE.CHILD.$getTypedHash(testHash)).toStrictEqual(undefined);
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedHash(testHash)).toStrictEqual("baz");
});

it("allows state params parsing", () => {
    const GRANDCHILD = route({
        path: "grand",
        state: { bar: number() },
    });
    const CHILD = route({
        path: "child",
        state: { foo: string() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0], { foo?: string; bar?: number }>>(
        true
    );

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedState>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedState>, { foo?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedState>, { foo?: string; bar?: number }>>(
        true
    );

    const state = { foo: "test", bar: 1, untyped: "untyped" };

    expect(TEST_ROUTE.$getTypedState(state)).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedState(state)).toStrictEqual({ foo: "test" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getTypedState(state)).toStrictEqual({ foo: "test", bar: 1 });

    expect(TEST_ROUTE.$getUntypedState(state)).toStrictEqual({ foo: "test", bar: 1, untyped: "untyped" });
    expect(TEST_ROUTE.CHILD.$getUntypedState(state)).toStrictEqual({ bar: 1, untyped: "untyped" });
    expect(TEST_ROUTE.CHILD.GRANDCHILD.$getUntypedState(state)).toStrictEqual({ untyped: "untyped" });
});

it("throws if throwable state params are invalid", () => {
    const GRANDCHILD = route({
        path: "grand",
        state: { bar: number().defined() },
    });
    const CHILD = route({
        path: "child",
        state: { foo: string() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0], { foo?: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0], { foo?: string; bar?: number }>>(
        true
    );

    assert<IsExact<ReturnType<typeof TEST_ROUTE.$getTypedState>, Record<never, never>>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$getTypedState>, { foo?: string }>>(true);
    assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$getTypedState>, { foo?: string; bar: number }>>(true);

    const state = { foo: "test", bar: "bar", untyped: "untyped" };

    expect(TEST_ROUTE.$getTypedState(state)).toStrictEqual({});
    expect(TEST_ROUTE.CHILD.$getTypedState(state)).toStrictEqual({ foo: "test" });
    expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$getTypedState(state)).toThrow();
});

it("throws upon specifying an invalid default value", () => {
    expect(() =>
        route({
            path: "",
            searchParams: { id: date().default(new Date("foo")) },
        })
    ).toThrow();
});

it("throws upon specifying a default value that validates to undefined", () => {
    expect(() =>
        route({
            path: "",
            searchParams: { id: type((value: unknown): string | undefined => undefined).default("test") },
        })
    ).toThrow();
});

it("allows types composition", () => {
    const PATH = route({
        path: ":id",
        params: { id: number() },
    });
    const SEARCH = route({
        path: "",
        searchParams: { page: number() },
    });
    const STATE = route({
        path: "",
        state: { fromList: boolean() },
    });
    const HASH = route({
        path: "",
        hash: ["about", "more"],
    });

    const ROUTE = route({
        path: ":id/:subId",
        compose: [PATH, SEARCH, STATE, HASH],

        params: {
            subId: number(),
        },

        searchParams: {
            ordered: boolean(),
            page: boolean(),
        },

        state: {
            hidden: boolean(),
        },

        hash: ["info"],
    });

    assert<IsExact<Parameters<typeof ROUTE.$buildPath>[0], { id: number; subId: number }>>(true);

    assert<IsExact<Parameters<typeof ROUTE.$buildPath>[1], { page?: boolean; ordered?: boolean } | undefined>>(true);

    assert<IsExact<Parameters<typeof ROUTE.$buildPath>[2], "about" | "more" | "info" | undefined>>(true);

    assert<IsExact<Parameters<typeof ROUTE.$buildState>[0], { fromList?: boolean; hidden?: boolean }>>(true);

    expect(ROUTE.$buildPath({ id: 1, subId: 2 }, { page: true, ordered: true }, "info")).toStrictEqual(
        "/1/2?page=true&ordered=true#info"
    );

    expect(ROUTE.$buildState({ fromList: true, hidden: true })).toStrictEqual({ fromList: true, hidden: true });
});

it("allows to trim path pattern", () => {
    const GRANDCHILD = route({
        path: "grand",
    });
    const CHILD = route({
        path: "child",
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        children: { CHILD },
    });

    assert<IsExact<typeof TEST_ROUTE.$path, "/test">>(true);
    assert<IsExact<typeof TEST_ROUTE.$.CHILD.$path, "/child">>(true);
    assert<IsExact<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$path, "/grand">>(true);
    assert<IsExact<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$path, "/child/grand">>(true);

    expect(TEST_ROUTE.$path).toStrictEqual("/test");
    expect(TEST_ROUTE.$.CHILD.$path).toStrictEqual("/child");
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$path).toStrictEqual("/grand");
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$path).toStrictEqual("/child/grand");
});

it("allows to inherit non-path params in trimmed children", () => {
    const GRANDCHILD = route({
        path: "grand",
        searchParams: { baz: boolean() },
        state: { stateBaz: string() },
        hash: ["hashBaz"],
    });
    const CHILD = route({
        path: "child",
        searchParams: { bar: string() },
        state: { stateBar: number() },
        hash: ["hashBar"],
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test",
        searchParams: { foo: number() },
        state: { stateFoo: boolean() },
        hash: ["hashFoo"],
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[1], { foo?: number } | undefined>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[2], "hashFoo" | undefined>>(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPath>[1], { foo?: number; bar?: string } | undefined>>(
        true
    );
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPath>[2], "hashFoo" | "hashBar" | undefined>>(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath>[1],
            { foo?: number; bar?: string; baz?: boolean } | undefined
        >
    >(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath>[2],
            "hashFoo" | "hashBar" | "hashBaz" | undefined
        >
    >(true);

    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath>[0], Record<never, never>>>(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath>[1],
            { foo?: number; bar?: string; baz?: boolean } | undefined
        >
    >(true);
    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath>[2],
            "hashFoo" | "hashBar" | "hashBaz" | undefined
        >
    >(true);

    expect(TEST_ROUTE.$buildPath({}, { foo: 1 }, "hashFoo")).toStrictEqual("/test?foo=1#hashFoo");
    expect(TEST_ROUTE.$.CHILD.$buildPath({}, { foo: 1, bar: "test" }, "hashBar")).toStrictEqual(
        "/child?foo=1&bar=test#hashBar"
    );
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath({}, { foo: 1, bar: "test", baz: false }, "hashBaz")).toStrictEqual(
        "/grand?foo=1&bar=test&baz=false#hashBaz"
    );
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath({}, { foo: 1, bar: "test", baz: false }, "hashBaz")).toStrictEqual(
        "/child/grand?foo=1&bar=test&baz=false#hashBaz"
    );

    const testSearchParams = createSearchParams({ foo: "1", bar: "test", baz: "false" });

    expect(TEST_ROUTE.$getTypedSearchParams(testSearchParams)).toStrictEqual({ foo: 1 });
    expect(TEST_ROUTE.$.CHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({ foo: 1, bar: "test" });
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({
        foo: 1,
        bar: "test",
        baz: false,
    });
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$getTypedSearchParams(testSearchParams)).toStrictEqual({
        foo: 1,
        bar: "test",
        baz: false,
    });
});

it("prevents path param inheritance in trimmed children", () => {
    const GRANDCHILD = route({
        path: "grand/:id",
    });
    const CHILD = route({
        path: "child/:subId",
        params: { subId: boolean() },
        children: { GRANDCHILD },
    });
    const TEST_ROUTE = route({
        path: "test/:id",
        params: { id: number() },
        children: { CHILD },
    });

    assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPath>[0], { id: number }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPath>[0], { subId: boolean }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath>[0], { id: string }>>(true);
    assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath>[0], { id: string; subId: boolean }>>(
        true
    );

    expect(TEST_ROUTE.$buildPath({ id: 1 })).toStrictEqual("/test/1");
    expect(TEST_ROUTE.$.CHILD.$buildPath({ subId: true })).toStrictEqual("/child/true");
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath({ id: "test" })).toStrictEqual("/grand/test");
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath({ subId: true, id: "test" })).toStrictEqual(
        "/child/true/grand/test"
    );

    expect(TEST_ROUTE.$getTypedParams({ id: "1", subId: "true" })).toStrictEqual({ id: 1 });
    expect(TEST_ROUTE.$.CHILD.$getTypedParams({ id: "1", subId: "true" })).toStrictEqual({ subId: true });
    expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$getTypedParams({ id: "1", subId: "true" })).toStrictEqual({ id: "1" });
    expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$getTypedParams({ id: "1", subId: "true" })).toStrictEqual({
        id: "1",
        subId: true,
    });
});

it("properly parses arrays in search params", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: number().array(),
            b: number().defined().array(),
            e: number().default(-1).array(),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a: number[];
                b: number[];
                e: number[];
            }
        >
    >(true);

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$getPlainSearchParams>[0],
            {
                a?: number[];
                b?: number[];
                e?: number[];
            }
        >
    >(true);

    const testArray = ["1", "f"];

    const testValue = createSearchParams({
        a: testArray,
        e: testArray,
    });

    const throwingTestValue = createSearchParams({
        b: testArray,
    });

    expect(TEST_ROUTE.$getTypedSearchParams(testValue)).toStrictEqual({
        a: [1],
        b: [],
        e: [1, -1],
    });

    expect(() => TEST_ROUTE.$getTypedSearchParams(throwingTestValue)).toThrow();
});

it("ensures that required path params stay required if a custom type allows undefined as an input", () => {
    const validateOptionalString = (value: unknown) => {
        if (value === undefined) return undefined;
        if (typeof value === "string") return value;
        throw new Error("Not a string");
    };

    const TEST_ROUTE = route({
        path: ":id",

        params: {
            id: type(validateOptionalString),
        },
    });

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$getPlainParams>[0],
            {
                id: string;
            }
        >
    >(true);
});

it("ensures that default/defined modifiers are applied if a custom type allows undefined as an input", () => {
    const validateOptionalNumber = (value: unknown) => {
        if (value === undefined) return undefined;
        if (typeof value === "number") return value;
        throw new Error("Not a number");
    };

    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: type(validateOptionalNumber),
            b: type(validateOptionalNumber).defined(),
            c: type(validateOptionalNumber).default(-1),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: number;
                b: number;
                c: number;
            }
        >
    >(true);

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ a: "1", b: "2", c: "3" }))).toStrictEqual({
        a: 1,
        b: 2,
        c: 3,
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ b: "2", c: "3" }))).toStrictEqual({
        b: 2,
        c: 3,
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ b: "2" }))).toStrictEqual({
        b: 2,
        c: -1,
    });

    expect(() => TEST_ROUTE.$getTypedSearchParams(createSearchParams({}))).toThrow();
});

it("ensures that arrays don't accept undefined items if a custom type allows undefined as an input", () => {
    const validateOptionalNumber = (value: unknown) => {
        if (value === undefined) return undefined;
        if (typeof value === "number") return value;
        throw new Error("Not a number");
    };

    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: type(validateOptionalNumber).array(),
            c: type(validateOptionalNumber).default(-1).array(),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a: number[];
                c: number[];
            }
        >
    >(true);

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$getPlainSearchParams>[0],
            {
                a?: number[];
                c?: number[];
            }
        >
    >(true);
});

it("allows to use zod", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: zod(z.string().optional()),
            b: zod(z.number()),
            c: zod(z.boolean()),
            d: zod(z.date()),
            e: zod(z.string().nullable()),
            f: zod(z.string().nullable()),
            g: zod(z.object({ d: z.coerce.date() })), // We have to coerce the result of JSON.parse
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: string;
                b?: number;
                c?: boolean;
                d?: Date;
                e?: string | null;
                f?: string | null;
                g?: { d: Date };
            }
        >
    >(true);

    const testDate = new Date();

    const plainSearchParams = TEST_ROUTE.$getPlainSearchParams({
        a: "test",
        b: 0,
        c: false,
        d: testDate,
        e: "null",
        f: null,
        g: { d: testDate },
    });

    expect(plainSearchParams).toStrictEqual({
        a: "test",
        b: "0",
        c: "false",
        d: testDate.toISOString(),
        e: '"null"',
        f: "null",
        g: JSON.stringify({ d: testDate }),
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams(plainSearchParams))).toStrictEqual({
        a: "test",
        b: 0,
        c: false,
        d: testDate,
        e: "null",
        f: null,
        g: { d: testDate },
    });
});

it("allows to use yup", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: yup(y.string().optional()),
            b: yup(y.number()),
            c: yup(y.boolean()),
            d: yup(y.date()),
            e: yup(y.string().nullable()),
            f: yup(y.string().nullable()),
            g: yup(y.object({ d: y.date().defined() })),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: string;
                b?: number;
                c?: boolean;
                d?: Date;
                e?: string | null;
                f?: string | null;
                g?: { d: Date };
            }
        >
    >(true);

    const testDate = new Date();

    const plainSearchParams = TEST_ROUTE.$getPlainSearchParams({
        a: "test",
        b: 0,
        c: false,
        d: testDate,
        e: "null",
        f: null,
        g: { d: testDate },
    });

    expect(plainSearchParams).toStrictEqual({
        a: "test",
        b: "0",
        c: "false",
        d: testDate.toISOString(),
        e: '"null"',
        f: "null",
        g: JSON.stringify({ d: testDate }),
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams(plainSearchParams))).toStrictEqual({
        a: "test",
        b: 0,
        c: false,
        d: testDate,
        e: "null",
        f: null,
        g: { d: testDate },
    });
});

it("allows to specify defaults within zod types", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: zod(z.number().default(-1)),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: number;
            }
        >
    >(true);

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams())).toStrictEqual({
        a: -1,
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ a: "f" }))).toStrictEqual({});
});

it("allows to specify defaults within yup schemas", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: yup(y.number().default(-1)),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: number;
            }
        >
    >(true);

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams())).toStrictEqual({
        a: -1,
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ a: "f" }))).toStrictEqual({});
});

it("allows to use unions", () => {
    const TEST_ROUTE = route({
        path: "",

        searchParams: {
            a: union(1, true, "test"),
            b: union([1, true, "test"] as const),
            c: union([1, true, "test"] as const).defined(),
        },
    });

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                a?: 1 | true | "test";
                b?: 1 | true | "test";
                c: 1 | true | "test";
            }
        >
    >(true);

    const plainSearchParams = TEST_ROUTE.$getPlainSearchParams({
        a: "test",
        b: 1,
        c: true,
    });

    expect(plainSearchParams).toStrictEqual({
        a: "test",
        b: "1",
        c: "true",
    });

    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams(plainSearchParams))).toStrictEqual({
        a: "test",
        b: 1,
        c: true,
    });
});

it("allows to define different types for different route parts", () => {
    const testType: ParamType<string, number> & SearchParamType<number, string> & StateParamType<boolean, Date> = {
        getPlainParam: (value) => "path plain",
        getTypedParam: (value) => "path typed",
        getPlainSearchParam: (value) => "search plain",
        getTypedSearchParam: (value) => -1,
        getPlainStateParam: (value) => "state",
        getTypedStateParam: (value) => false,
    };

    const TEST_ROUTE = route({
        path: ":id",
        params: { id: testType },
        searchParams: { id: testType },
        state: { id: testType },
    });

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$getPlainParams>[0],
            {
                id: number;
            }
        >
    >(true);

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$getPlainSearchParams>[0],
            {
                id?: string;
            }
        >
    >(true);

    assert<
        IsExact<
            Parameters<typeof TEST_ROUTE.$buildState>[0],
            {
                id?: Date;
            }
        >
    >(true);

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedParams>,
            {
                id: string;
            }
        >
    >(true);

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedSearchParams>,
            {
                id: number;
            }
        >
    >(true);

    assert<
        IsExact<
            ReturnType<typeof TEST_ROUTE.$getTypedState>,
            {
                id: boolean;
            }
        >
    >(true);

    expect(TEST_ROUTE.$getPlainParams({ id: 1 })).toStrictEqual({ id: "path plain" });
    expect(TEST_ROUTE.$getTypedParams({ id: "" })).toStrictEqual({ id: "path typed" });
    expect(TEST_ROUTE.$getPlainSearchParams({ id: "" })).toStrictEqual({ id: "search plain" });
    expect(TEST_ROUTE.$getTypedSearchParams(createSearchParams({ id: "" }))).toStrictEqual({ id: -1 });
    expect(TEST_ROUTE.$buildState({ id: new Date() })).toStrictEqual({ id: "state" });
    expect(TEST_ROUTE.$getTypedState({ id: false })).toStrictEqual({ id: false });
});

it("generates correct paths when the first segment is optional", () => {
    const TEST_ROUTE = route({
        path: ":optional?/:required",
    });

    expect(TEST_ROUTE.$buildPath({ required: "req" })).toStrictEqual("/req");
    expect(TEST_ROUTE.$buildPath({ optional: "opt", required: "req" })).toStrictEqual("/opt/req");

    expect(TEST_ROUTE.$buildRelativePath({ required: "req" })).toStrictEqual("req");
    expect(TEST_ROUTE.$buildRelativePath({ optional: "opt", required: "req" })).toStrictEqual("opt/req");
});

it("provides a base type that any route is assignable to", () => {
    const TEST_ROUTE = route({
        path: "test/:a/:b/:c?",
        params: { a: number() },
        searchParams: { q: string() },
        state: { s: boolean() },
        hash: ["hash1", "hash2"],

        children: {
            CHILD: route({
                path: ":d",
                params: { d: number() },
                searchParams: { s: string() },
                state: { f: number() },
                hash: boolean(),
            }),
        },
    });

    const EMPTY_ROUTE = route({
        path: "",
    });

    const test1: BaseRoute = TEST_ROUTE;
    const test2: BaseRoute = TEST_ROUTE.CHILD;
    const test3: BaseRoute = EMPTY_ROUTE;

    expect(test1).toBeTruthy();
    expect(test2).toBeTruthy();
    expect(test3).toBeTruthy();
});

it("checks that leading and trailing slashes are forbidden", () => {
    expect(
        route({
            // @ts-expect-error Checking leading slash error
            path: "/test",
        })
    ).toBeTruthy();

    expect(
        route({
            // @ts-expect-error Checking trailing slash error
            path: "test/",
        })
    ).toBeTruthy();

    expect(
        route({
            // @ts-expect-error Checking both
            path: "/test/",
        })
    ).toBeTruthy();
});

it("checks that route children start with an uppercase letter", () => {
    expect(
        route({
            path: "",
            // @ts-expect-error Checking single invalid child
            children: {
                child: route({
                    path: "",
                }),
            },
        })
    );

    expect(
        route({
            path: "",
            // @ts-expect-error Checking mix of valid and invalid children
            children: {
                VALID: route({
                    path: "",
                }),
                child: route({
                    path: "",
                }),
            },
        })
    );
});
