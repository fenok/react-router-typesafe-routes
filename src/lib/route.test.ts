import { route } from "./route/index.js";
import { createSearchParams } from "react-router";
import {
  number,
  boolean,
  string,
  date,
  type,
  union,
  PathnameType,
  SearchType,
  StateType,
  Route,
  PathParam,
  configure,
  Parser,
  ParserHint,
  ParserType,
} from "./index.js";
import { assert, IsExact } from "conditional-type-checks";
import { zod, configure as configureZod } from "../zod/index.js";
import { z } from "zod";
import { yup, configure as configureYup } from "../yup/index.js";
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test/child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/child/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/child/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test/optional?">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test/optional?/child/optional-child?">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/optional?/child/optional-child?/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test/optional?");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test/optional?/child/optional-child?");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/optional?/child/optional-child?/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test/:optional?">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test/:optional?/child/:optional-child?">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/:optional?/child/:optional-child?/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test/:optional?");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test/:optional?/child/:optional-child?");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/:optional?/child/:optional-child?/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test/child/*">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/child/*/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test/child/*");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/child/*/grand");
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

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test/child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/child/grand">>(true);

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("test/child/grand");
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

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test/dynamic?">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test/dynamic?/child/:dynamic-param?">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/dynamic?/child/:dynamic-param?/grand">>(true);

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test/dynamic?");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test/dynamic?/child/:dynamic-param?");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual(
    "test/dynamic?/child/:dynamic-param?/grand",
  );
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

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test/child/*">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/child/grand">>(true);

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test/child/*");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("test/child/grand");
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

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test/*">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test/child/*">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/child/grand">>(true);

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test/*");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test/child/*");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("test/child/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/">>(true);
  assert<IsExact<typeof testRouteChildPath, "/child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/child/grand">>(true);

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "child/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/child/grand");

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("child/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/grand">>(true);

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/grand");

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("test/grand");
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

  const testRoutePath = TEST_ROUTE.$path();
  const testRouteChildPath = TEST_ROUTE.CHILD.$path();
  const testRouteChildGrandchildPath = TEST_ROUTE.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test">>(true);
  assert<IsExact<typeof testRouteChildPath, "/test/child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildPath, "/test/child">>(true);

  const testRouteRelativePath = TEST_ROUTE.$path({ relative: true });
  const testRouteChildRelativePath = TEST_ROUTE.CHILD.$path({ relative: true });
  const testRouteChildGrandchildRelativePath = TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true });

  assert<IsExact<typeof testRouteRelativePath, "test">>(true);
  assert<IsExact<typeof testRouteChildRelativePath, "test/child">>(true);
  assert<IsExact<typeof testRouteChildGrandchildRelativePath, "test/child">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$path()).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path()).toStrictEqual("/test/child");

  expect(TEST_ROUTE.$path({ relative: true })).toStrictEqual("test");
  expect(TEST_ROUTE.CHILD.$path({ relative: true })).toStrictEqual("test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$path({ relative: true })).toStrictEqual("test/child");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { id: string }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { id: string }>>(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: "42" } })).toStrictEqual("/test/child/42");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: "24" } })).toStrictEqual("/test/child/24/grand");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { id: number }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { id: number }>>(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: 42 } })).toStrictEqual("/test/child/42");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: 24 } })).toStrictEqual("/test/child/24/grand");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { id: number; value: string }>>(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { id: number; value: string }>
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: 42, value: "foo" } })).toStrictEqual("/test/child/42/foo");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: 24, value: "bar" } })).toStrictEqual(
    "/test/child/24/bar/grand",
  );
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"],
      { id?: number | undefined; value?: string | undefined }
    >
  >(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"],
      { id?: number | undefined; value?: string | undefined; name: string }
    >
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: 42 } })).toStrictEqual("/test/child/42");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: 24, value: "bar", name: "baz" } })).toStrictEqual(
    "/test/child/24/bar/grand/baz",
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { id: number; value: string }>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"],
      { id: number; value: string; name: string }
    >
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: 42, value: "foo" } })).toStrictEqual("/test/child/42/foo");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: 24, value: "bar", name: "baz" } })).toStrictEqual(
    "/test/child/24/bar/grand/baz",
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { id: number; value: string }>>(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { id: boolean; value: string }>
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { id: 42, value: "foo" } })).toStrictEqual("/test/child/42/foo");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { id: false, value: "bar" } })).toStrictEqual(
    "/test/child/false/bar/grand/false",
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { "*"?: string | undefined }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], Record<never, never>>>(
    true,
  );

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { "*": "star/param" } })).toStrictEqual("/test/child/star/param");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { "*": "star/param" } })).toStrictEqual(
    "/test/child/grand",
  );
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { "*"?: number | undefined }>
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: {} })).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { "*": 42 } })).toStrictEqual("/test/child/grand/42");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], { "*"?: number | undefined }>
  >(true);

  expect(TEST_ROUTE.$buildPathname({ params: {} })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: {} })).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: {} })).toStrictEqual("/test/child/grand");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildPathname>[0]["params"], { "*"?: string | undefined }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname>[0]["params"], Record<never, never>>>(
    true,
  );

  expect(TEST_ROUTE.$buildPathname({ params: { "*": "foo" } })).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPathname({ params: { "*": "foo" } })).toStrictEqual("/test/child/foo");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPathname({ params: { "*": "foo" } })).toStrictEqual("/test/child/grand");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildSearch>[0]["searchParams"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildSearch>[0]["searchParams"], Record<never, never>>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined }
    >
  >(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ searchParams: { foo: 1 } })).toStrictEqual("/test/child/grand?foo=1");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildSearch>[0]["searchParams"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildSearch>[0]["searchParams"], { bar?: number[] | undefined }>>(
    true,
  );
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined; bar?: number[] | undefined }
    >
  >(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({ searchParams: { bar: [1, 2] } })).toStrictEqual("/test/child?bar=1&bar=2");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ searchParams: { foo: 1, bar: [1, 2] } })).toStrictEqual(
    "/test/child/grand?foo=1&bar=1&bar=2",
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildSearch>[0]["searchParams"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildSearch>[0]["searchParams"], { foo?: number[] | undefined }>>(
    true,
  );
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined }
    >
  >(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({ searchParams: { foo: [1, 2] } })).toStrictEqual("/test/child?foo=1&foo=2");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ searchParams: { foo: 1 } })).toStrictEqual("/test/child/grand?foo=1");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildHash>[0]["hash"], string>>(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ hash: "my-id" })).toStrictEqual("/test/child/grand#my-id");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildHash>[0]["hash"], "foo" | "bar">>(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({})).toStrictEqual("/test/child");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ hash: "foo" })).toStrictEqual("/test/child/grand#foo");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildHash>[0]["hash"], "baz">>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildHash>[0]["hash"], "baz" | "foo" | "bar">>(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({ hash: "baz" })).toStrictEqual("/test/child#baz");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ hash: "baz" })).toStrictEqual("/test/child/grand#baz");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildHash>[0]["hash"], undefined>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildHash>[0]["hash"], "baz">>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildHash>[0]["hash"], string>>(true);

  expect(TEST_ROUTE.$buildPath({})).toStrictEqual("/test");
  expect(TEST_ROUTE.CHILD.$buildPath({ hash: "baz" })).toStrictEqual("/test/child#baz");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildPath({ hash: "anything" })).toStrictEqual("/test/child/grand#anything");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0]["state"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0]["state"], { foo?: string | undefined }>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0]["state"],
      { foo?: string | undefined; bar?: number | undefined }
    >
  >(true);

  expect(TEST_ROUTE.$buildState({ state: {} })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$buildState({ state: { foo: "test" } })).toStrictEqual({ foo: "test" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$buildState({ state: { foo: "test", bar: 1 } })).toStrictEqual({
    foo: "test",
    bar: 1,
  });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { id: string }>>(true);

  expect(TEST_ROUTE.$deserializeParams({})).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({})).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ id: "1" })).toStrictEqual({ id: "1" });
  expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({})).toThrow();
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { id?: string }>>(true);

  expect(TEST_ROUTE.$deserializeParams({})).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({})).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ id: "1" })).toStrictEqual({ id: "1" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({})).toStrictEqual({});
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { id?: number }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ id: "1" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ id: "1" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ id: "1" })).toStrictEqual({ id: 1 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId?: number }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId?: number; id?: number }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ id: "1", childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ id: "1", childId: "2" })).toStrictEqual({ childId: 2 });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ id: "1", childId: "2" })).toStrictEqual({
    id: 1,
    childId: 2,
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId: string }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId: string; id: string }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: "2" });
  expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ childId: "2" })).toThrow();
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId?: string }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId?: string; id?: string }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: "2" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: "2" });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId?: number }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId?: number; id?: number }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: 2 });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: 2 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId: number }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId: number; id: number }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: 2 });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: 2, id: -1 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { childId: number }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { childId: number; id: number }>>(
    true,
  );

  expect(TEST_ROUTE.$deserializeParams({ childId: "2" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ childId: "2" })).toStrictEqual({ childId: 2 });
  expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ childId: "2" })).toThrow();
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { "*": string }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { "*"?: number }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ "*": "1" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ "*": "1" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ "*": "1" })).toStrictEqual({ "*": 1 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { "*": number }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ "*": "" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ "*": "" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ "*": "" })).toStrictEqual({ "*": 42 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { "*"?: number }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ "*": "foo" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ "*": "foo" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ "*": "foo" })).toStrictEqual({});
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeParams>, { "*": string }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams>, { "*": string }>>(true);

  expect(TEST_ROUTE.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeParams({ "*": "foo/bar" })).toStrictEqual({ "*": "foo/bar" });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeSearchParams>, { foo?: string; arr: number[] }>>(true);
  assert<
    IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeSearchParams>, { foo: number; arr: number[] }>
  >(true);

  const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

  expect(TEST_ROUTE.$deserializeSearchParams(testSearchParams)).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: "foo" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: 0 });
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeSearchParams>, { foo?: string; arr: number[] }>>(true);
  assert<
    IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeSearchParams>, { foo: number; arr: number[] }>
  >(true);

  const testSearchParams = createSearchParams({ arr: ["1", "2"], foo: "foo", untyped: "untyped" });

  expect(TEST_ROUTE.$deserializeSearchParams(testSearchParams)).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({ arr: [1, 2], foo: "foo" });
  expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$deserializeSearchParams(testSearchParams)).toThrow();
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

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeHash>, undefined>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeHash>, "foo" | "bar" | undefined>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeHash>, string | undefined>>(true);

  expect(TEST_ROUTE.$deserializeHash(testHash)).toStrictEqual(undefined);
  expect(TEST_ROUTE.CHILD.$deserializeHash(testHash)).toStrictEqual("foo");
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeHash(testHash)).toStrictEqual("foo");
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

  expect(TEST_ROUTE.$deserializeHash(testHash)).toStrictEqual(undefined);
  expect(TEST_ROUTE.CHILD.$deserializeHash(testHash)).toStrictEqual(undefined);
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeHash(testHash)).toStrictEqual("baz");
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0]["state"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0]["state"], { foo?: string | undefined }>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0]["state"],
      { foo?: string | undefined; bar?: number | undefined }
    >
  >(true);

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeState>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeState>, { foo?: string }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeState>, { foo?: string; bar?: number }>>(
    true,
  );

  const state = { foo: "test", bar: 1, untyped: "untyped" };

  expect(TEST_ROUTE.$deserializeState(state)).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeState(state)).toStrictEqual({ foo: "test" });
  expect(TEST_ROUTE.CHILD.GRANDCHILD.$deserializeState(state)).toStrictEqual({ foo: "test", bar: 1 });
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0]["state"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0]["state"], { foo?: string | undefined }>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.GRANDCHILD.$buildState>[0]["state"],
      { foo?: string | undefined; bar?: number | undefined }
    >
  >(true);

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeState>, Record<never, never>>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeState>, { foo?: string }>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.GRANDCHILD.$deserializeState>, { foo?: string; bar: number }>>(
    true,
  );

  const state = { foo: "test", bar: "bar", untyped: "untyped" };

  expect(TEST_ROUTE.$deserializeState(state)).toStrictEqual({});
  expect(TEST_ROUTE.CHILD.$deserializeState(state)).toStrictEqual({ foo: "test" });
  expect(() => TEST_ROUTE.CHILD.GRANDCHILD.$deserializeState(state)).toThrow();
});

it("throws upon specifying an invalid default value", () => {
  expect(() =>
    route({
      path: "",
      searchParams: { id: date().default(new Date("foo")) },
    }),
  ).toThrow();
});

it("throws upon specifying a default value that validates to undefined", () => {
  expect(() =>
    route({
      path: "",
      searchParams: { id: type((value: unknown): string | undefined => undefined).default("test") },
    }),
  ).toThrow();
});

it("allows types composition", () => {
  const PATH = route({
    params: { id: number() },
  });
  const SEARCH = route({
    searchParams: { page: number() },
  });
  const STATE = route({
    state: { fromList: boolean() },
  });
  const HASH = route({
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

  assert<IsExact<Parameters<typeof ROUTE.$buildPathname>[0]["params"], { id: number; subId: number }>>(true);

  assert<
    IsExact<
      Parameters<typeof ROUTE.$buildSearch>[0]["searchParams"],
      { page?: boolean | undefined; ordered?: boolean | undefined }
    >
  >(true);

  assert<IsExact<Parameters<typeof ROUTE.$buildHash>[0]["hash"], "about" | "more" | "info">>(true);

  assert<
    IsExact<
      Parameters<typeof ROUTE.$buildState>[0]["state"],
      { fromList?: boolean | undefined; hidden?: boolean | undefined }
    >
  >(true);

  expect(
    ROUTE.$buildPath({ params: { id: 1, subId: 2 }, searchParams: { page: true, ordered: true }, hash: "info" }),
  ).toStrictEqual("/1/2?page=true&ordered=true#info");

  expect(ROUTE.$buildState({ state: { fromList: true, hidden: true } })).toStrictEqual({
    fromList: true,
    hidden: true,
  });
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

  const testRoutePath = TEST_ROUTE.$path();
  const childRoutePath = TEST_ROUTE.$.CHILD.$path();
  const grandchildRoutePath = TEST_ROUTE.CHILD.$.GRANDCHILD.$path();
  const childGrandchildRoutePath = TEST_ROUTE.$.CHILD.GRANDCHILD.$path();

  assert<IsExact<typeof testRoutePath, "/test">>(true);
  assert<IsExact<typeof childRoutePath, "/child">>(true);
  assert<IsExact<typeof grandchildRoutePath, "/grand">>(true);
  assert<IsExact<typeof childGrandchildRoutePath, "/child/grand">>(true);

  expect(TEST_ROUTE.$path()).toStrictEqual("/test");
  expect(TEST_ROUTE.$.CHILD.$path()).toStrictEqual("/child");
  expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$path()).toStrictEqual("/grand");
  expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$path()).toStrictEqual("/child/grand");
});

it("allows to inherit non-pathname params in trimmed children", () => {
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildSearch>[0]["searchParams"], { foo?: number | undefined }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildHash>[0]["hash"], "hashFoo">>(true);

  assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$.CHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined; bar?: string | undefined }
    >
  >(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildHash>[0]["hash"], "hashFoo" | "hashBar">>(true);

  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPathname>[0]["params"], Record<never, never>>>(
    true,
  );
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined; bar?: string | undefined; baz?: boolean | undefined }
    >
  >(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildHash>[0]["hash"], "hashFoo" | "hashBar" | "hashBaz">
  >(true);

  assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPathname>[0]["params"], Record<never, never>>>(
    true,
  );
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildSearch>[0]["searchParams"],
      { foo?: number | undefined; bar?: string | undefined; baz?: boolean | undefined }
    >
  >(true);
  assert<
    IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildHash>[0]["hash"], "hashFoo" | "hashBar" | "hashBaz">
  >(true);

  expect(TEST_ROUTE.$buildPath({ searchParams: { foo: 1 }, hash: "hashFoo" })).toStrictEqual("/test?foo=1#hashFoo");
  expect(TEST_ROUTE.$.CHILD.$buildPath({ searchParams: { foo: 1, bar: "test" }, hash: "hashBar" })).toStrictEqual(
    "/child?foo=1&bar=test#hashBar",
  );
  expect(
    TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath({ searchParams: { foo: 1, bar: "test", baz: false }, hash: "hashBaz" }),
  ).toStrictEqual("/grand?foo=1&bar=test&baz=false#hashBaz");
  expect(
    TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath({ searchParams: { foo: 1, bar: "test", baz: false }, hash: "hashBaz" }),
  ).toStrictEqual("/child/grand?foo=1&bar=test&baz=false#hashBaz");

  const testSearchParams = createSearchParams({ foo: "1", bar: "test", baz: "false" });

  expect(TEST_ROUTE.$deserializeSearchParams(testSearchParams)).toStrictEqual({ foo: 1 });
  expect(TEST_ROUTE.$.CHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({ foo: 1, bar: "test" });
  expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({
    foo: 1,
    bar: "test",
    baz: false,
  });
  expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$deserializeSearchParams(testSearchParams)).toStrictEqual({
    foo: 1,
    bar: "test",
    baz: false,
  });
});

it("allows to inherit pathname types in trimmed children", () => {
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

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildPathname>[0]["params"], { id: number }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.$.CHILD.$buildPathname>[0]["params"], { subId: boolean }>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPathname>[0]["params"], { id: number }>>(true);
  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPathname>[0]["params"],
      { id: number; subId: boolean }
    >
  >(true);

  expect(TEST_ROUTE.$buildPath({ params: { id: 1 } })).toStrictEqual("/test/1");
  expect(TEST_ROUTE.$.CHILD.$buildPath({ params: { subId: true } })).toStrictEqual("/child/true");
  expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$buildPath({ params: { id: 2 } })).toStrictEqual("/grand/2");
  expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$buildPath({ params: { subId: true, id: 3 } })).toStrictEqual(
    "/child/true/grand/3",
  );

  expect(TEST_ROUTE.$deserializeParams({ id: "1", subId: "true" })).toStrictEqual({ id: 1 });
  expect(TEST_ROUTE.$.CHILD.$deserializeParams({ id: "1", subId: "true" })).toStrictEqual({ subId: true });
  expect(TEST_ROUTE.CHILD.$.GRANDCHILD.$deserializeParams({ id: "1", subId: "true" })).toStrictEqual({ id: 1 });
  expect(TEST_ROUTE.$.CHILD.GRANDCHILD.$deserializeParams({ id: "1", subId: "true" })).toStrictEqual({
    id: 1,
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a: number[];
        b: number[];
        e: number[];
      }
    >
  >(true);

  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$serializeSearchParams>[0]["searchParams"],
      {
        a?: number[] | undefined;
        b?: number[] | undefined;
        e?: number[] | undefined;
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

  expect(TEST_ROUTE.$deserializeSearchParams(testValue)).toStrictEqual({
    a: [1],
    b: [],
    e: [1, -1],
  });

  expect(() => TEST_ROUTE.$deserializeSearchParams(throwingTestValue)).toThrow();
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
      Parameters<typeof TEST_ROUTE.$serializeParams>[0]["params"],
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a?: number;
        b: number;
        c: number;
      }
    >
  >(true);

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ a: "1", b: "2", c: "3" }))).toStrictEqual({
    a: 1,
    b: 2,
    c: 3,
  });

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ b: "2", c: "3" }))).toStrictEqual({
    b: 2,
    c: 3,
  });

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ b: "2" }))).toStrictEqual({
    b: 2,
    c: -1,
  });

  expect(() => TEST_ROUTE.$deserializeSearchParams(createSearchParams({}))).toThrow();
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a: number[];
        c: number[];
      }
    >
  >(true);

  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$serializeSearchParams>[0]["searchParams"],
      {
        a?: number[] | undefined;
        c?: number[] | undefined;
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
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

  const plainSearchParams = TEST_ROUTE.$serializeSearchParams({
    searchParams: {
      a: "test",
      b: 0,
      c: false,
      d: testDate,
      e: "null",
      f: null,
      g: { d: testDate },
    },
  });

  expect(urlSearchParamsToRecord(plainSearchParams)).toStrictEqual({
    a: "test",
    b: "0",
    c: "false",
    d: testDate.toISOString(),
    e: '"null"',
    f: "null",
    g: JSON.stringify({ d: testDate }),
  });

  expect(TEST_ROUTE.$deserializeSearchParams(plainSearchParams)).toStrictEqual({
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
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

  const plainSearchParams = TEST_ROUTE.$serializeSearchParams({
    searchParams: {
      a: "test",
      b: 0,
      c: false,
      d: testDate,
      e: "null",
      f: null,
      g: { d: testDate },
    },
  });

  expect(urlSearchParamsToRecord(plainSearchParams)).toStrictEqual({
    a: "test",
    b: "0",
    c: "false",
    d: testDate.toISOString(),
    e: '"null"',
    f: "null",
    g: JSON.stringify({ d: testDate }),
  });

  expect(TEST_ROUTE.$deserializeSearchParams(plainSearchParams)).toStrictEqual({
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a?: number;
      }
    >
  >(true);

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams())).toStrictEqual({
    a: -1,
  });

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ a: "f" }))).toStrictEqual({});
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
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a?: number;
      }
    >
  >(true);

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams())).toStrictEqual({
    a: -1,
  });

  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ a: "f" }))).toStrictEqual({});
});

it("allows to use unions", () => {
  const TEST_ROUTE = route({
    path: "",

    searchParams: {
      a: union([1, true, "test"]),
      b: union([1, true, "test"]),
      c: union([1, true, "test"]).defined(),
    },
  });

  assert<
    IsExact<
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        a?: 1 | true | "test";
        b?: 1 | true | "test";
        c: 1 | true | "test";
      }
    >
  >(true);

  const plainSearchParams = TEST_ROUTE.$serializeSearchParams({
    searchParams: {
      a: "test",
      b: 1,
      c: true,
    },
  });

  expect(urlSearchParamsToRecord(plainSearchParams)).toStrictEqual({
    a: "test",
    b: "1",
    c: "true",
  });

  expect(TEST_ROUTE.$deserializeSearchParams(plainSearchParams)).toStrictEqual({
    a: "test",
    b: 1,
    c: true,
  });
});

it("allows to define different types for different route parts", () => {
  const testType: PathnameType<string, number> & SearchType<number, string> & StateType<boolean, Date> = {
    serializeParam: (value) => "path plain",
    deserializeParam: (value) => "path typed",
    serializeSearchParam: (value) => "search plain",
    deserializeSearchParam: (value) => -1,
    serializeState: (value) => "state",
    deserializeState: (value) => false,
  };

  const TEST_ROUTE = route({
    path: ":id",
    params: { id: testType },
    searchParams: { id: testType },
    state: { id: testType },
  });

  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$serializeParams>[0]["params"],
      {
        id: number;
      }
    >
  >(true);

  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$serializeSearchParams>[0]["searchParams"],
      {
        id?: string | undefined;
      }
    >
  >(true);

  assert<
    IsExact<
      Parameters<typeof TEST_ROUTE.$buildState>[0]["state"],
      {
        id?: Date | undefined;
      }
    >
  >(true);

  assert<
    IsExact<
      ReturnType<typeof TEST_ROUTE.$deserializeParams>,
      {
        id: string;
      }
    >
  >(true);

  assert<
    IsExact<
      ReturnType<typeof TEST_ROUTE.$deserializeSearchParams>,
      {
        id: number;
      }
    >
  >(true);

  assert<
    IsExact<
      ReturnType<typeof TEST_ROUTE.$deserializeState>,
      {
        id: boolean;
      }
    >
  >(true);

  expect(TEST_ROUTE.$serializeParams({ params: { id: 1 } })).toStrictEqual({ id: "path plain" });
  expect(TEST_ROUTE.$deserializeParams({ id: "" })).toStrictEqual({ id: "path typed" });
  expect(urlSearchParamsToRecord(TEST_ROUTE.$serializeSearchParams({ searchParams: { id: "" } }))).toStrictEqual({
    id: "search plain",
  });
  expect(TEST_ROUTE.$deserializeSearchParams(createSearchParams({ id: "" }))).toStrictEqual({ id: -1 });
  expect(TEST_ROUTE.$buildState({ state: { id: new Date() } })).toStrictEqual({ id: "state" });
  expect(TEST_ROUTE.$deserializeState({ id: false })).toStrictEqual({ id: false });
});

it("generates correct paths when the first segment is optional", () => {
  const TEST_ROUTE = route({
    path: ":optional?/:required",
  });

  expect(TEST_ROUTE.$buildPath({ params: { required: "req" } })).toStrictEqual("/req");
  expect(TEST_ROUTE.$buildPath({ params: { optional: "opt", required: "req" } })).toStrictEqual("/opt/req");

  expect(TEST_ROUTE.$buildPath({ params: { required: "req" }, relative: true })).toStrictEqual("req");
  expect(TEST_ROUTE.$buildPath({ params: { optional: "opt", required: "req" }, relative: true })).toStrictEqual(
    "opt/req",
  );
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

  const PATHLESS_ROUTE = route({});

  const ROUTE_WITH_ATOMIC_STATE = route({
    path: "test",
    state: number(),
  });

  const test1: Route = TEST_ROUTE;
  const test2: Route = TEST_ROUTE.CHILD;
  const test3: Route = EMPTY_ROUTE;
  const test4: Route = PATHLESS_ROUTE;
  const test5: Route = ROUTE_WITH_ATOMIC_STATE;

  expect(test1).toBeTruthy();
  expect(test2).toBeTruthy();
  expect(test3).toBeTruthy();
  expect(test4).toBeTruthy();
  expect(test5).toBeTruthy();
});

it("checks that leading and trailing slashes are forbidden", () => {
  expect(
    route({
      // @ts-expect-error Checking leading slash error
      path: "/test",
    }),
  ).toBeTruthy();

  expect(
    route({
      // @ts-expect-error Checking trailing slash error
      path: "test/",
    }),
  ).toBeTruthy();

  expect(
    route({
      // @ts-expect-error Checking both
      path: "/test/",
    }),
  ).toBeTruthy();
});

it("checks that route children are valid", () => {
  expect(
    route({
      path: "",
      children: {
        // @ts-expect-error Checking single invalid child name
        $child: route({
          path: "",
        }),
      },
    }),
  ).toBeTruthy();

  expect(
    route({
      path: "",
      children: {
        valid: route({
          path: "",
        }),
        // @ts-expect-error Checking mix of valid and invalid children names
        $child: route({
          path: "",
        }),
      },
    }),
  ).toBeTruthy();

  expect(
    route({
      path: "",
      children: {
        // @ts-expect-error Checking single invalid child value
        child: 1,
      },
    }),
  ).toBeTruthy();

  expect(
    route({
      path: "",
      children: {
        valid: route({
          path: "",
        }),
        // @ts-expect-error Checking mix of valid and invalid children values
        child: 1,
      },
    }),
  ).toBeTruthy();
});

it("allows to type state as a whole", () => {
  const TEST_ROUTE = route({ state: string(), children: { CHILD: route({ state: number() }) } });

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$deserializeState>, string | undefined>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$deserializeState>, number | undefined>>(true);

  assert<IsExact<ReturnType<typeof TEST_ROUTE.$buildState>, unknown>>(true);
  assert<IsExact<ReturnType<typeof TEST_ROUTE.CHILD.$buildState>, unknown>>(true);

  assert<IsExact<Parameters<typeof TEST_ROUTE.$buildState>[0]["state"], string>>(true);
  assert<IsExact<Parameters<typeof TEST_ROUTE.CHILD.$buildState>[0]["state"], number>>(true);

  expect(TEST_ROUTE.$deserializeState("foo")).toStrictEqual("foo");
  expect(TEST_ROUTE.CHILD.$deserializeState(1)).toStrictEqual(1);

  expect(TEST_ROUTE.$deserializeState(1)).toStrictEqual(undefined);
  expect(TEST_ROUTE.CHILD.$deserializeState("foo")).toStrictEqual(undefined);

  expect(TEST_ROUTE.$buildState({ state: "foo" })).toStrictEqual("foo");
  expect(TEST_ROUTE.CHILD.$buildState({ state: 1 })).toStrictEqual(1);
});

it("allows to preserve untyped search params on path/query building", () => {
  const TEST_ROUTE = route({ path: "test", searchParams: { typed: number(), typedUnused: boolean() } });

  const testSearchParams = createSearchParams({ typed: "1", typedUnused: "true", untyped: "foo" });

  expect(TEST_ROUTE.$buildPath({ searchParams: { typed: 42 }, untypedSearchParams: testSearchParams })).toStrictEqual(
    "/test?typed=42&untyped=foo",
  );

  expect(TEST_ROUTE.$buildSearch({ searchParams: { typed: 42 }, untypedSearchParams: testSearchParams })).toStrictEqual(
    "?typed=42&untyped=foo",
  );
});

it("allows to preserve untyped state on state building", () => {
  const TEST_ROUTE = route({ path: "test", state: { typed: number(), typedUnused: boolean() } });

  const testState = { typed: "1", typedUnused: "true", untyped: "foo" };

  expect(TEST_ROUTE.$buildState({ state: { typed: 42 }, untypedState: testState })).toStrictEqual({
    typed: 42,
    untyped: "foo",
  });
});

it("ignores preserveUntyped option when state is typed as a whole", () => {
  const TEST_ROUTE = route({ path: "test", state: number() });

  const testState = { untyped: "foo" };

  expect(TEST_ROUTE.$buildState({ state: 42, untypedState: testState })).toStrictEqual(42);
});

it("ties pathname params to path pattern", () => {
  // If path is empty, nothing is allowed
  // @ts-expect-error No params allowed
  expect(route({ path: "", params: { "": string() } })).toBeTruthy();

  // If path has params, non-existent params are forbidden
  // @ts-expect-error Unknown param
  expect(route({ path: ":id/:test", params: { something: string() } })).toBeTruthy();

  // If path has params, it's possible to override only some of them
  expect(route({ path: ":id/:test", params: { id: string() } })).toBeTruthy();

  // Undefined is always forbidden
  // @ts-expect-error Undefined is forbidden
  expect(route({ path: ":id/:test", params: { id: undefined } })).toBeTruthy();
  // @ts-expect-error Undefined is forbidden
  expect(route({ params: { something: undefined } })).toBeTruthy();
});

it("allows pathless routes", () => {
  const grandchild = route({ path: "grandchild" });
  const child = route({ children: { grandchild } });
  const testRoute = route({ path: "test", children: { child } });

  expect(child.$path()).toBe(undefined);
  expect(testRoute.$.child.$path()).toBe(undefined);
  expect(testRoute.child.$path()).toBe("/test");
  expect(testRoute.child.grandchild.$path()).toBe("/test/grandchild");
  expect(testRoute.$.child.grandchild.$path()).toBe("/grandchild");
});

it("preserves pathless routes in chains", () => {
  const grandchild = route({});
  const child = route({ children: { grandchild } });
  const test = route({ children: { child } });

  expect(test.child.grandchild.$path()).toBe(undefined);
  expect(test.$.child.grandchild.$path()).toBe(undefined);
});

it("allows to parse params with pathless routes", () => {
  const pathlessRoute = route({ params: { id: number() } });

  expect(pathlessRoute.$deserializeParams({ id: "1" })).toStrictEqual({ id: 1 });
});

it("builds empty pathnames with pathless routes", () => {
  const pathlessRoute = route({ params: { id: number() } });

  expect(pathlessRoute.$buildPathname({ params: { id: 1 } })).toStrictEqual("/");
  expect(pathlessRoute.$serializeParams({ params: { id: 1 } })).toStrictEqual({});
});

it("prevents excessive plain pathname params for routes without dynamic segments", () => {
  const pathlessRoute = route({ params: { id: number(), sid: string() } });

  const emptyRoute = route({ path: "", compose: [pathlessRoute] });

  expect(pathlessRoute.$buildPathname({ params: { id: 1, sid: "1", nid: "2" } })).toStrictEqual("/");
  expect(pathlessRoute.$serializeParams({ params: { id: 1, sid: "1", nid: "2" } })).toStrictEqual({});

  expect(emptyRoute.$buildPathname({ params: { id: 1, sid: "1", nid: "2" } })).toStrictEqual("/");
  expect(emptyRoute.$serializeParams({ params: { id: 1, sid: "1", nid: "2" } })).toStrictEqual({});
});

it("ensures that types of non-existent pathname params are ignored", () => {
  const excessParams = route({ params: { id: number(), fake: number() } });

  const testRoute = route({ path: ":id", compose: [excessParams] });

  assert<IsExact<Parameters<typeof testRoute.$buildPathname>[0]["params"], { id: number }>>(true);
  assert<IsExact<ReturnType<typeof testRoute.$deserializeParams>, { id?: number }>>(true);

  expect(testRoute.$deserializeParams({ id: "1", fake: "2", unknown: "3" })).toStrictEqual({ id: 1 });
});

it("allows to inherit pathname types", () => {
  const routes = route({
    params: {
      id: number(),
    },
    children: {
      main: route({ path: ":id" }),
      other: route({
        path: "other",
        children: {
          entity: route({ path: ":id" }),
        },
      }),
    },
  });

  assert<IsExact<Parameters<typeof routes.main.$buildPathname>[0]["params"], { id: number }>>(true);
  assert<IsExact<Parameters<typeof routes.other.$buildPathname>[0]["params"], Record<never, never>>>(true);
  assert<IsExact<Parameters<typeof routes.other.entity.$buildPathname>[0]["params"], { id: number }>>(true);

  expect(routes.main.$deserializeParams({ id: "1" })).toStrictEqual({ id: 1 });
  expect(routes.other.$deserializeParams({ id: "1" })).toStrictEqual({});
  expect(routes.other.entity.$deserializeParams({ id: "1" })).toStrictEqual({ id: 1 });
});

it("allows to inherit composed pathname types", () => {
  const idFragment = route({ params: { id: number() } });

  const routes = route({
    path: "test",
    compose: [idFragment],
    children: {
      main: route({ path: ":id" }),
    },
  });

  assert<IsExact<Parameters<typeof routes.main.$buildPathname>[0]["params"], { id: number }>>(true);

  expect(routes.main.$deserializeParams({ id: "1" })).toStrictEqual({ id: 1 });
});

it("handles complex nested inlined routes", () => {
  const routes = route({
    searchParams: { utm_campaign: string().default("default_campaign") },
    children: {
      user: route({
        path: "user/:id",
        params: { id: number().defined() },
        state: { fromUserList: boolean() },
        hash: union(["info", "comments"]),
        children: {
          details: route({ path: "details/:lang?" }),
        },
      }),
    },
  });

  const userDetailsPath = routes.user.details.$path();

  assert<IsExact<typeof userDetailsPath, "/user/:id/details/:lang?">>(true);
});

it("provides a helper for extracting pathname params", () => {
  assert<IsExact<PathParam<"">, never>>(true);
  assert<IsExact<PathParam<"test">, never>>(true);

  assert<IsExact<PathParam<"test/:id">, "id">>(true);
  assert<IsExact<PathParam<"test/:id/:subId">, "id" | "subId">>(true);
  assert<IsExact<PathParam<"test/:id?">, "id">>(true);
  assert<IsExact<PathParam<"test/:id?/:subId?">, "id" | "subId">>(true);

  assert<IsExact<PathParam<"test/*">, "*">>(true);
  assert<IsExact<PathParam<"test/:id/*">, "id" | "*">>(true);
  assert<IsExact<PathParam<"test/:id?/*">, "id" | "*">>(true);

  assert<IsExact<PathParam<"test/:id/*", "all", "out">, "id" | "*">>(true);
  assert<IsExact<PathParam<"test/:id/*", "all", "in">, "id" | "*">>(true);
  assert<IsExact<PathParam<"test/:id/*", "optional", "out">, never>>(true);
  assert<IsExact<PathParam<"test/:id/*", "optional", "in">, "*">>(true);

  assert<IsExact<PathParam<"test/:id/test/*/:subId?/test", "all", "out">, "id" | "subId" | "*">>(true);
  assert<IsExact<PathParam<"test/:id/test/*/:subId?/test", "all", "in">, "id" | "subId">>(true);
  assert<IsExact<PathParam<"test/:id/test/*/:subId?/test", "optional", "out">, "subId">>(true);
  assert<IsExact<PathParam<"test/:id/test/*/:subId?/test", "optional", "in">, "subId">>(true);
});

it("supports enums in union()", () => {
  enum Value {
    A = "a",
    B = "b",
  }

  enum ValueNum {
    A,
    B,
  }

  const ValueObj = {
    A: 1,
    B: 2,
  } as const;

  const testRoute = route({
    searchParams: {
      testEnum: union(Value),
      testNum: union(ValueNum),
      testNumInvalid: union(ValueNum),
      testObj: union(ValueObj),
    },
  });

  assert<
    IsExact<
      ReturnType<typeof testRoute.$deserializeSearchParams>,
      { testEnum?: Value; testNum?: ValueNum; testNumInvalid?: ValueNum; testObj?: 1 | 2 }
    >
  >(true);

  const testSearchParams = createSearchParams({ testEnum: "a", testNum: "1", testNumInvalid: "B", testObj: "2" });

  expect(testRoute.$deserializeSearchParams(testSearchParams)).toStrictEqual({
    testEnum: Value.A,
    testNum: ValueNum.B,
    testObj: ValueObj.B,
  });
});

it("allows to configure parser globally", () => {
  const { string, number, boolean, date, union, type } = configure({ parserFactory: customParser });

  const validator = (val: unknown) => Number(val);

  const mRoute = route({
    path: ":s/:n/:b/:d/:u/:t",
    params: {
      s: string(),
      n: number(),
      b: boolean(),
      d: date(),
      u: union([1, "test", true]),
      t: type(validator),
    },
  });

  const dateValue = new Date();

  expect(mRoute.$serializeParams({ params: { s: "test", n: 1, b: true, d: dateValue, u: 1, t: 1 } })).toStrictEqual({
    s: "s:test",
    n: "n:1",
    b: "b:true",
    d: "d:" + dateValue.toISOString(),
    u: "n:1",
    t: "1",
  });
});

it("allows to configure parser globally for zod", () => {
  const { zod } = configureZod({ parserFactory: customParser });

  const testRoute = route({
    path: ":id",
    params: {
      id: zod(z.number()),
    },
  });

  expect(testRoute.$serializeParams({ params: { id: 1 } })).toStrictEqual({ id: "n:1" });
});

it("allows to configure parser globally for yup", () => {
  const { yup } = configureYup({ parserFactory: customParser });

  const testRoute = route({
    path: ":id",
    params: {
      id: yup(y.number()),
    },
  });

  expect(testRoute.$serializeParams({ params: { id: 1 } })).toStrictEqual({ id: "n:1" });
});

it("allows to configure parser locally", () => {
  const stringValidator = (value: string) => {
    if (!value.length) throw new Error("Must be non-empty");

    return value;
  };

  const numberValidator = (value: number) => {
    if (value < 0) throw new Error("Must be non-negative");

    return value;
  };

  const booleanValidator = (value: boolean) => {
    if (!value) throw new Error("Must be true");

    return value;
  };

  const dateValidator = (value: Date) => {
    if (value.getTime() < 0) throw new Error("Must be non-negative");

    return value;
  };

  const testRoute = route({
    path: ":s/:sv/:n/:nv/:b/:bv/:d/:dv/:u",
    params: {
      s: string(customParser("string")),
      sv: string(stringValidator, customParser("string")),
      n: number(customParser("number")),
      nv: number(numberValidator, customParser("number")),
      b: boolean(customParser("boolean")),
      bv: boolean(booleanValidator, customParser("boolean")),
      d: date(customParser("date")),
      dv: date(dateValidator, customParser("date")),
      u: union([1, "test", true], customParser()),
    },
  });

  const dateValue = new Date();

  expect(
    testRoute.$serializeParams({
      params: {
        s: "test",
        sv: "test",
        n: 1,
        nv: 1,
        b: true,
        bv: true,
        d: dateValue,
        dv: dateValue,
        u: 1,
      },
    }),
  ).toStrictEqual({
    s: "s:test",
    sv: "s:test",
    n: "n:1",
    nv: "n:1",
    b: "b:true",
    bv: "b:true",
    d: "d:" + dateValue.toISOString(),
    dv: "d:" + dateValue.toISOString(),
    u: "n:1",
  });
});

it("allows to configure parser locally for zod", () => {
  const testRoute = route({
    path: ":id",
    params: {
      id: zod(z.number(), customParser("number")),
    },
  });

  expect(testRoute.$serializeParams({ params: { id: 1 } })).toStrictEqual({ id: "n:1" });
});

it("allows to configure parser locally for yup", () => {
  const testRoute = route({
    path: ":id",
    params: {
      id: yup(y.number(), customParser("number")),
    },
  });

  expect(testRoute.$serializeParams({ params: { id: 1 } })).toStrictEqual({ id: "n:1" });
});

function urlSearchParamsToRecord(params: URLSearchParams): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of params.entries()) {
    if (result[key] === undefined) {
      result[key] = value;
    } else {
      if (typeof result[key] === "string") {
        result[key] = [result[key] as string];
      }

      (result[key] as string[]).push(value);
    }
  }

  return result;
}

type CustomParserHint = ParserHint | "entity";

type CustomParserType<T extends CustomParserHint> = T extends "entity"
  ? { id: number }
  : ParserType<Exclude<T, "entity">>;

function customParser<T extends CustomParserHint>(defaultHint?: T): Parser<CustomParserType<T>, CustomParserHint> {
  return {
    stringify(value, { hint }) {
      const resolvedHint = hint ?? defaultHint;

      if (resolvedHint === "string" && typeof value === "string") {
        return "s:" + value;
      }

      if (resolvedHint === "number" && typeof value === "number") {
        return "n:" + JSON.stringify(value);
      }

      if (resolvedHint === "boolean" && typeof value === "boolean") {
        return "b:" + JSON.stringify(value);
      }

      if (resolvedHint === "date" && value instanceof Date) {
        return "d:" + value.toISOString();
      }

      return JSON.stringify(value);
    },
    parse(value, { hint }) {
      const resolvedHint = hint ?? defaultHint;

      if (resolvedHint === "string") {
        return value.replace(/^s:/, "");
      }

      if (resolvedHint === "number") {
        return JSON.parse(value.replace(/^n:/, "")) as unknown;
      }

      if (resolvedHint === "boolean") {
        return JSON.parse(value.replace(/^b:/, "")) as unknown;
      }

      if (resolvedHint === "date") {
        return new Date(value.replace(/^d:/, ""));
      }

      return JSON.parse(value) as unknown;
    },
  };
}
