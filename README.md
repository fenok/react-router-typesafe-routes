# React Router Typesafe Routes

Comprehensive and extensible type-safe routes for React Router v6 with first-class support for nested routes and param validation.

[![npm](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

> ⚠ For React Router v5, see [v0.3.2](https://www.npmjs.com/package/react-router-typesafe-routes/v/0.3.2).

The library provides type safety for all route params (path params, search params, state, and hash) on building and parsing URL parts and state objects. There are no unsafe type casts whatsoever.

Param validation is done as part of the param parsing process, and failed param parsing can be fine-tuned to result in returning `undefined` or a fallback value, or throwing an error - and these adjustments reflect in types, too!

Parsing, serializing, and typing are fully customizable. Native arrays in search string are also supported.

The library doesn't restrict or alter React Router API in any way, including nested routes and relative links. It's also gradually adoptable.

## Installation

```
yarn add react-router-typesafe-routes
```

Depending on the platform, either `react-router-dom` or `react-router-native` is a peer dependency.

`react-router-typesafe-routes` contains core platform-independent functionality which is re-exported from platform-specific entry points: `react-router-typesafe-routes/dom` for web and `react-router-typesafe-routes/native` for React Native.

The library is distributed as an ES module written in ES6.

> Note that I'm not opposed to adding CommonJS support, but I'm not an expert in dealing with [dual package hazard](https://nodejs.org/api/packages.html#packages_dual_package_hazard). And, since some packages are [dropping CommonJS support](https://devclass.com/2021/06/15/d3-7-0-goes-all-in-on-ecmascript-modules/) anyway, I'm not sure that it worth spending resources on. I'll gladly accept a PR, but it shouldn't affect the ES module users in any way.

## Limitations & Caveats

-   To make params merging possible, state has to be an object, and hash has to be one of the predefined strings (or any string).
-   Since React Router only considers pathname on route matching, search parameters, state fields, and hash are considered optional upon URL or state building.
-   For simplicity, hash is always considered optional upon URL parsing.
-   To prevent overlapping with route API, child routes have to start with an uppercase letter (this only affects code and not resulting URL).
-   To emphasize that routes relativity is governed by the library, leading slashes in path patterns are forbidden. Trailing slashes are also forbidden due to being purely cosmetic.

## How is it different from existing solutions?

-   [typed-react-router](https://www.npmjs.com/package/typed-react-router) only handles path params. It also forces the use of [Route Objects](https://reactrouter.com/docs/en/v6/examples/route-objects) and doesn't allow relative links.

-   [typesafe-routes](https://www.npmjs.com/package/typesafe-routes) only handles path and search params. Though pretty good overall, it's not specifically tailored for React Router v6.

    -   [react-typesafe-routes](https://www.npmjs.com/package/react-typesafe-routes), which is seemingly based on it, also alters React Router API way too much and relies on React Router below v6.

-   [typesafe-react-router](https://www.npmjs.com/package/typesafe-react-router) only handles path params and has no concept of nested routes, because it was developed for React Router below v6.

    -   There is a bunch of articles like [Type-Safe Usage of React Router](https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44) that propose similar solutions (i.e. only path params and no nesting). Again, they were written for React Router below v6.

-   There is also [type-route](https://www.npmjs.com/package/type-route), but it's a separate routing library.

## Quick usage example

Route definition may look like this:

```typescript
import { route, numberType, booleanType, hashValues, throwable } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTES = {
    USER: route(
        // This is a normal path pattern, but without leading or trailing slashes.
        // By default, path params are inferred from the pattern.
        "user/:id",
        {
            // We can override some or all path params.
            // We override id and specify that a parsing error will be thrown.
            params: { id: numberType(throwable) },
            // These are search params.
            // We specify a fallback to use in case of a parsing error.
            searchParams: { infoVisible: booleanType(false) },
            // These are state fields, which are similar to search params.
            // We use default parsing behavior, so a parsing error will result in undefined.
            state: { fromUserList: booleanType },
            // These are allowed hash values.
            // We could also use hashValues() to indicate that any hash is allowed.
            hash: hashValues("info", "comments"),
        },
        // This is a child route, which inherits all parent params.
        // Note how it has to start with an uppercase letter.
        { DETAILS: route("details/:lang?") }
    ),
};
```

Use `Route` components as usual:

```typescript jsx
import { Route } from "react-router";
import { ROUTES } from "./path/to/routes";

<Routes>
    {/* /user/:id */}
    <Route path={ROUTES.USER.path} element={<Product />}>
        {/* /user/:id/details/:lang? */}
        <Route path={ROUTES.USER.DETAILS.path} element={<ProductDetails />} />
    </Route>
</Routes>;

// OR

<Routes>
    {/* user/:id */}
    <Route path={ROUTES.USER.relativePath} element={<Product />}>
        {/* details/:lang? */}
        {/* $ effectively cuts everything to the left. */}
        <Route path={ROUTES.USER.$.DETAILS.relativePath} element={<ProductDetails />} />
    </Route>
</Routes>;
```

Use `Link` components as usual:

```typescript jsx
import { Link } from "react-router-dom";
import { ROUTES } from "./path/to/routes";

// Absolute link
<Link
    // Path params: { id: number; lang?: string } -- optionality is governed by the path pattern.
    // Search params: { infoVisible?: boolean }.
    // State fields: { fromUserList?: boolean }.
    // Hash: "info" | "comments" | undefined
    to={ROUTES.USER.DETAILS.buildPath({ id: 1, lang: "en" }, { infoVisible: true }, "info")}
    state={ROUTES.USER.DETAILS.buildState({ fromUserList: true })}
>
    /user/1/details/en?infoVisible=true#info
</Link>;

// Relative link
<Link
    // Path params: { lang?: string } -- optionality is governed by the path pattern.
    // $ effectively cuts everything to the left.
    to={ROUTES.USER.$.DETAILS.buildRelativePath({ lang: "en" })}
>
    details/en
</Link>;
```

Get typed path params with `useTypedParams()`:

```typescript jsx
import { useTypedParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { id: number; lang?: string }.
// Note how id can't be undefined, because a parsing error will be thrown.
const { id, lang } = useTypedParams(ROUTES.USER.DETAILS);
```

Get typed search params with `useTypedSearchParams()`:

```typescript jsx
import { useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { infoVisible: boolean }.
// Note how infoVisible can't be undefined, because a fallback will be used upon a parsing error.
const [{ infoVisible }, setTypedSearchParams] = useTypedSearchParams(ROUTES.USER.DETAILS);
```

Get typed state with `useTypedState()`:

```typescript jsx
import { useTypedState } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { fromUserList: boolean | undefined }.
// Note how fromUserList can be undefined due to returning undefined upon error.
const { fromUserList } = useTypedState(ROUTES.USER.DETAILS);
```

Get typed hash with `useTypedHash()`:

```typescript jsx
import { useTypedHash } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is "info" | "comments" | undefined.
const hash = useTypedHash(ROUTES.USER.DETAILS);
```

## Concepts

### Nesting

#### Library routes

Any route can be a child of another route. Child routes inherit everything from their parent.

Most of the time, it's easier to simply inline child routes:

```typescript
const USER = route("user/:id", {}, { DETAILS: route("details") });

console.log(USER.path); // "/user/:id"
console.log(USER.DETAILS.path); // "/user/:id/details"
```

They can also be uninlined beforehand or after the fact:

```typescript
const DETAILS = route("details");
const USER = route("user/:id", {}, { DETAILS });

console.log(USER.$.DETAILS === DETAILS); // true
console.log(USER.DETAILS.path); // "/user/:id/details"
console.log(DETAILS.path); // "/details"
```

That is, the `$` property of every route contains original routes, specified as children of that route. The mental model here is that `$` cuts everything to the left. The entire API works as if there is nothing there.

Again, `DETAILS`/`USER.$.DETAILS` and `USER.DETAILS` are separate routes, which will usually behave differently. `DETAILS` doesn't know anything about `USER`, but `USER.DETAILS` does. `DETAILS` is a standalone route, but `USER.DETAILS` is a child of `USER`.

> ❗Child routes have to start with an uppercase letter to prevent overlapping with route API.

#### Using routes in React Router `<Route />` components

Routes structure _usually_ corresponds to the structure of `<Route />` components:

```typescript jsx
<Routes>
    {/* '/user/:id' */}
    <Route path={USER.path} element={<User />}>
        {/* '/user/:id/details' */}
        <Route path={USER.DETAILS.path} element={<UserDetails />} />
    </Route>
</Routes>
```

However, nothing stops you from specifying additional routes as you see fit.

Note that we're using the `path` field here, which returns an absolute path pattern. React Router allows absolute child route paths, if they match the parent path.

You're encouraged to use absolute path patterns whenever possible, because they are easier to reason about.

> ❗ At the time of writing, there are [quirks](https://github.com/remix-run/react-router/issues/9925) with optional path segments that may force the use of relative path patterns.

Relative paths can be used like this:

```typescript jsx
<Routes>
    {/* 'user/:id' */}
    <Route path={USER.relativePath} element={<Product />}>
        {/* 'details' */}
        <Route path={USER.$.DETAILS.relativePath} element={<ProductDetails />} />
    </Route>
</Routes>
```

That is, `path` contains a combined path with a leading slash (`/`), and `relativePath` contains a combined path **without intermediate stars (`*`)** and without a leading slash (`/`).

#### Nested `<Routes />`

If your `<Route/>` is not a direct child of another `<Route />`, not only you have to add a `*` to the parent path, but also exclude it from subsequent paths. This is because each `<Routes/>` requires its own absolute paths.

```typescript jsx
const PRODUCT = route("product/:id/*", {}, { DETAILS: route("details") });

<Routes>
    {/* '/user/:id/*' */}
    <Route path={USER.path} element={<Product />} />
</Routes>;

// Somewhere inside <Product />
<Routes>
    {/* '/details' */}
    <Route path={USER.$.DETAILS.path} element={<ProductDetails />} />
</Routes>;
```

> ❗ Star doesn't prevent subsequent routes from being rendered as direct children.

> ❗At the time of writing, there are [some issues](https://github.com/remix-run/react-router/issues/9929) with nested `<Routes />` if dynamic segments are used.

### Typing

#### Type objects and hash values

Path params, search params, and state fields serializing, parsing, validation, and typing are done via type objects. Validation is done during parsing. There are several [built-in types](#built-in-types), and there is [`createType()`](#createtype) helper for creating custom type objects.

> ❗ You are encouraged to write your own type objects as needed.

Hash is typed via the [`hashValues()`](#hashvalues) helper.

If parsing fails (including the case when the corresponding parameter is absent), `undefined` is returned instead. In case of type objects, you can specify a fallback to use instead of `undefined` (which will be reflected in types):

```typescript
const ROUTE = route("my/route", { searchParams: { param: numberType(100) } });
```

This fallback is not returned directly. Instead, it is run through the type object to ensure its validity, so the resulting type object is guaranteed to have a valid fallback. If the fallback is invalid, the corresponsing error will be thrown.

You can also specify `throwable` as a fallback, in which case, instead of returning `undefined`, the original error will be thrown (this is mostly suitable for path params):

```typescript
import { throwable } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTE = route("route/:id", { params: { id: numberType(throwable) } });
```

There are no fallbacks for hash, though.

#### Path params

Path params are inferred from the provided path pattern and can be overridden (partially or completely) with path type objects. Inferred params won't use any type object at all, and instead will simply be considered to be of type `string`.

Just as usual segments, dynamic segments (path params) can be made optional by adding a `?` to the end. This also applies to star (`*`) segments.

```typescript
// Here, id is overridden to be a number, and subId and optionalId are strings
const ROUTE = route("route/:id/:subId/:optionalId?", { params: { id: numberType } });
```

Upon building, all path params except the optional ones are required. Star parameter (`*`) is always optional upon building.

Upon parsing, if some non-optional implicitly typed param is absent (even the star parameter, because React Router parses it as an empty string), the parsing fails with an error.

Explicitly typed params behave as usual.

> ❗ You most likely will never need it, but it's technically possible to provide a type object for the star parameter as well.

#### Search params

Search params are determined by the provided search type objects.

```typescript
// Here, we define a search parameter 'filter' of 'string' type
const ROUTE = route("route", { searchParams: { filter: stringType } });
```

All search parameters are optional.

#### State fields

State fields are determined by the provided state type objects. To make state merging possible, the state is assumed to always be an object.

```typescript
// Here, we define a state parameter 'fromList' of 'boolean' type
const ROUTE = route("route", { state: { fromList: booleanType } });
```

All state fields are optional.

> ❗Note that built-in types convert the given values to `string` (or `string[]`), which is not required in case of state, because it can contain any serializable value. In the future, the library may provide types specifically for state, but in the meantime they can be implemented in the userland.

#### Hash

Hash doesn't use any type objects. Instead, you can specify the allowed values, or specify that any `string` is allowed (by calling the helper without parameters). By default, nothing is allowed as a hash value (otherwise, merging of hash values wouldn't work).

```typescript
const ROUTE_NO_HASH = route("route");

const ROUTE_DEFINED_HASH = route("route", { hash: hashValues("about", "more") });

const ROUTE_ANY_HASH = route("route", { hash: hashValues() });
```

Hash is always optional.

> ❗ Note that `hashValues()` is the equivalent of `[] as const` and is used only to make typing more convenient.

#### Nested routes

Child routes inherit all type objects from their parent. For parameters with the same name, child type objects take precedence. It also means that if a path parameter has no type object specified, it will use the parent type object for a parameter with the same name, if there is one.

> ❗ Parameters with the same name are discouraged.

Hash values are combined. If a parent allows any `string` to be a hash value, its children can't override that.

## API

### `route()`

A route is defined via the `route()` helper. It accepts required `path` and optional `types` and `children`. All `types` fields are optional.

```typescript
const ROUTE = route(
    "my/path",
    {
        params: { pathParam: stringType },
        searchParams: { searchParam: numberType },
        state: { stateParam: booleanType },
        hash: hashValues("value"),
    },
    { CHILD_ROUTE: route("child") }
);
```

The `path` argument is a path pattern that you would put to the `path` property of a `<Route/>`, but without leading or trailing slashes (`/`). More specifically, it can:

-   be a simple segment or a group of segments (`'user'`, `'user/details'`).
-   have any number of dynamic segments (params) anywhere (`':id/user'`, `'user/:id/more'`).
-   **end** with a star segment (`'user/:id/*'`, `'*'`)
-   have any number of optional segments (`user?/:id?/*?`)
-   be an empty string (`''`).

The `types` argument specifies type objects of the route. See [Typing](#typing).

The `children` argument specifies child routes of the route. See [Nesting](#nesting).

The `route()` helper returns a route object, which has the following fields:

-   `path` and `relativePath`, where `path` contains a combined path pattern with a leading slash (`/`), and `relativePath` contains a combined path pattern **without intermediate stars (`*`)** and without a leading slash (`/`). They can be passed to e.g. the `path` prop of React Router `<Route/>`.
    > ❗ At the time of writing, patterns with optional segments [can't](https://github.com/remix-run/react-router/discussions/9862) be used in `matchPath`/`useMatch`.
-   `buildPath()` and `buildRelativePath()` for building parametrized URL paths (pathname + search + hash) which can be passed to e.g. the `to` prop of React Router `<Link />`.
-   `buildState()` for building typed states, which can be passed to e.g. the `state` prop of React Router `<Link />`.
-   `buildSearch()` and `buildHash()` for building parametrized URL parts. They can be used (in conjunction with `buildState()` and `buildPath()`/`buildRelativePath()`) to e.g. build a parametrized `Location` object.
-   `getTypedParams()`, `getTypedSearchParams()`, `getTypedHash()`, and `getTypedState()` for retrieving typed params from React Router primitives. Untyped params are omitted.
-   `getUntypedParams()`, `getUntypedSearchParams()`, and `getUntypedState()` for retrieving untyped params from React Router primitives. Typed params are omitted. Note that hash is always typed.
-   `getPlainParams()` and `getPlainSearchParams()` for building React Router primitives from typed params. Note how hash and state don't need these functions, because `buildHash()` and `buildState()` can be used instead.
-   `types`, which contains type objects of the route, including parent types, if any. Can be used for sharing type objects with other routes.
-   `$`, which contains original child routes. These routes are unaffected by the parent route.
-   Any number of child routes starting with an uppercase letter.

### Built-in types

-   `stringType` - `string`, stringified as-is.
-   `numberType` - `number`, stringified by `JSON.stringify`.
-   `booleanType` - `boolean`, stringified by `JSON.stringify`.
-   `dateType` - `Date`, stringified as an ISO string.
-   `oneOfType` - one of the given `string`, `number`, or `boolean` values, internally uses the respective built-in type objects. E.g. `oneOfType('foo', 1, true)` means `'foo' | 1 | true`.
-   `arrayOfType` - array of any given type, e.g. `arrayOfType(oneOfType(1, 2))` means `(1 | 2)[]`. Stringified as `string[]`, so it can only be used for search params or state.

All built-in types can be called to specify a fallback.

### `createType()`

The `createType()` helper is used to create custom types. It accepts a type object (strictly speaking, it simply decorates the given type, adding the fallback functionality):

```typescript
interface Type<TOriginal, TPlain = string, TRetrieved = TOriginal> {
    getPlain: (originalValue: TOriginal) => TPlain;
    getTyped: (plainValue: unknown) => TRetrieved;
    isArray?: boolean;
}
```

-   `TOriginal` is what you want to store (in a URL or state) and `TRetrieved` is what you will get back. They are different to support cases such as "number in - string out".

-   `TPlain` is how your value is stored. It's typically `string`, but can also be `string[]` for arrays in search string. You can also store anything that can be serialized in state.

-   `getPlain()` transforms the given value from `TOriginal` into `TPlain`.

-   `getTyped()` tries to get `TRetrieved` from the given value and throws if that's impossible. The given `plainValue` is typed as `unknown` to emphasize that it may differ from what was returned by `getPlain()` (it may be absent or invalid). Note that, by default, the library catches this error and returns `undefined` instead.

-   `isArray` is a helper flag specific for `URLSearchParams`, so we know when to `.get()` and when to `.getAll()`.

All built-in types are created via this helper.

#### `createType()` helpers

There are several built-in helpers which can be used for creating custom types. They are pretty self-explanatory:

-   `assertIsString`
-   `assertIsNumber`
-   `assertIsBoolean`
-   `assertIsArray`
-   `assertIsValidDate`

### `hashValues()`

The `hashValues()` helper types the hash part of the URL. See [Typing: Hash](#hash).

### Hooks

All hooks are designed in such a way that they can be reimplemented in the userland. If something isn't working for you, you can get yourself unstuck by creating your own hooks.

And it goes without saying that you still can use native React Router hooks as you see fit.

#### `useTypedParams()`

The `useTypedParams()` hook is a thin wrapper around React Router `useParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

#### `useTypedSearchParams()`

The `useTypedSearchParams()` hook is a (somewhat) thin wrapper around React Router `useSearchParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

The only notable difference is that `setTypedSearchParams()` has an additional `preserveUntyped` option. If `true`, existing untyped (by the given route) search parameters will remain intact. Note that this option has no effect on the `state` option. That is, there is no way to preserve untyped state fields.

> ❗ In the future, the library may provide the same improvements for state. For now, this can be implemented in the userland in the form of a custom hook.

#### `useTypedState()`

The `useTypedState()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed state.

#### `useTypedHash()`

The `useTypedHash()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed hash.

## Recipes

### Creating custom types

In this example, we will create a type that allows to pass `number` or `string` upon URL path building, stores this value as `string` and parses this value as `number`.

```typescript jsx
// We use createType helper, which adds the fallback functionality.
// It's a generic, and we specify the necessary types there.
export const looseNumberType = createType<string | number, string, number>({
    // Here, the value is string | number, and we need to return a string.
    // This function shouldn't throw.
    getPlain(value) {
        return String(value);
    },
    // Here, the value is unknown, and we try to convert it to number.
    // If we can't, we should throw.
    getTyped(value) {
        // We expect the result from getPlain here, which is string.
        // We use a built-in helper.
        assertIsString(value);

        // Then we try to parse it.
        const parsedValue: unknown = JSON.parse(value);

        // And we assert that it's a number.
        // We use a built-in helper.
        assertIsNumber(parsedValue);

        return parsedValue;
    },
});
```

### Sharing types between routes

It's pretty common to have completely unrelated routes that share the same set of params. One such example is pagination.

#### Inheritance

The easiest way to share types between unrelated routes is to put them to single common route:

```typescript jsx
const ROUTE = route(
    "",
    { searchParams: { page: numberType } },
    { USER: route("user"), POST: route("post"), ABOUT: route("about") }
);

// We can use this common ROUTE to get the page param anywhere:
const [{ page }] = useTypedSearchParams(ROUTE);
```

However, this approach have the following drawbacks:

-   All routes will have all common params, even if they don't actually need them.
-   Common params are lost upon child uninlining.
-   All common params are defined in one place, which may get cluttered.
-   We can't share path params this way, because they require the corresponding path pattern.

```typescript jsx
// This is allowed, but makes no sense, since there is no pagination on About page.
ROUTE.ABOUT.buildPath({}, { page: 1 });

// This won't work, but we actually need this param.
ROUTE.$.POST.buildPath({}, { page: 1 });
```

#### Composition

This drawbacks can be solved by route composition:

```typescript jsx
// We could also make such fragment for path params
const PAGINATION_FRAGMENT = route("", { searchParams: { page: numberType } });

const ROUTES = {
    USER: route("user", { searchParams: { ...PAGINATION_FRAGMENT.types.searchParams } }),
    POST: route("post", { searchParams: { ...PAGINATION_FRAGMENT.types.searchParams } }),
    ABOUT: route("about"),
};

// We can use PAGINATION_FRAGMENT to get the page param anywhere:
const [{ page }] = useTypedSearchParams(PAGINATION_FRAGMENT);
```

This API is far from prefect, but I'm not sure how to implement a proper [Composition API](https://github.com/fenok/react-router-typesafe-routes/issues/13).
