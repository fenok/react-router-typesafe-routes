# React-Router-Typesafe-Routes

Comprehensive type-safe routes for react-router v6 with first-class support for nested routes and param validation.

[![npm](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

> ⚠ For react-router v5, see [v0.3.2](https://www.npmjs.com/package/react-router-typesafe-routes/v/0.3.2).

The library provides extensible type safety via validation for path params, search params, state, and hash on building and parsing URLs and state objects, including nested routes.

## Installation

```
yarn add react-router-typesafe-routes
```

The library is distributed as an ES module written in ES6.

`react-router-typesafe-routes` contains core platform-independent functionality which is re-exported from platform-specific entry points: `react-router-typesafe-routes/dom` for web and `react-router-typesafe-routes/native` for React Native.

## Design principles

-   Mess with react-router API as little as possible.
-   No unsafe type casts.
-   Extensibility to allow better typing and/or validation.
-   Completeness: cover every aspect of the URL.

## Limitations

-   To make params merging possible, state has to be an object, and hash has to be one of the predefined strings (or any string).
-   Since react-router only considers path on routes matching, search parameters, state fields, and hash are considered optional upon URL or state building.
-   There are no fallbacks for hash, because they don't seem to be necessary.

## How is it different from existing solutions?

-   [typed-react-router](https://www.npmjs.com/package/typed-react-router) only handles path params. It also forces the use of [Route Objects](https://reactrouter.com/docs/en/v6/examples/route-objects) and doesn't allow relative links.

-   [typesafe-routes](https://www.npmjs.com/package/typesafe-routes) (as well as seemingly based on it [react-typesafe-routes](https://www.npmjs.com/package/react-typesafe-routes)) only handles path and search params. It wasn't developed with modern react-router in mind and therefore doesn't play well with it.

-   [typesafe-react-router](https://www.npmjs.com/package/typesafe-react-router) only handles path params and has no concept of nested routes.

-   The solution described at [Type-Safe Usage of React Router](https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44) only cares about path params and also has no concept of nested routes.

-   There is also [type-route](https://www.npmjs.com/package/type-route), but it's still in beta. It's also a separate routing library.

## Quick usage example

Route definition may look like this:

```typescript
import { numberType, booleanType, hashValues, route } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTES = {
    PRODUCT: route(
        "product/:id",
        {
            searchParams: { sectionsCount: numberType },
            hash: hashValues("about", "more"),
            state: { fromProductList: booleanType },
        },
        { DETAILS: route("details") }
    ),
};
```

Use `Route` components as usual:

```typescript jsx
import { Route } from "react-router";
import { ROUTES } from "./path/to/routes";

<Routes>
    <Route path={ROUTES.PRODUCT.path} element={<Product />}>
        <Route path={ROUTES.PRODUCT.DETAILS.path} element={<ProductDetails />} />
    </Route>
</Routes>;
```

Use `Link` components as usual:

```typescript jsx
import { Link } from "react-router-dom";
import { ROUTES } from "./path/to/routes";

// Everything is fully typed!
<Link
    to={ROUTES.PRODUCT.DETAILS.buildUrl({ id: "8592f5d5" }, { sectionsCount: 20 }, "about")}
    state={ROUTES.PRODUCT.DETAILS.buildState({ fromProductList: true })}
>
    /product/8592f5d5/details?sectionsCount=20#about
</Link>;
```

Get typed path params with `useTypedParams()`:

```typescript jsx
import { useTypedParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// Everything is fully typed!
const { id } = useTypedParams(ROUTES.PRODUCT.DETAILS);
```

Get typed search params with `useTypedSearchParams()`:

```typescript jsx
import { useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// Everything is fully typed!
const [{ sectionsCount }, setTypedSearchParams] = useTypedSearchParams(ROUTES.PRODUCT.DETAILS);
```

Get typed hash with `useTypedHash()`:

```typescript jsx
import { useTypedHash } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// Everything is fully typed!
const hash = useTypedHash(ROUTES.PRODUCT.DETAILS);
```

Get typed state with `useTypedState()`:

```typescript jsx
import { useTypedState } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// Everything is fully typed!
const { fromProductList } = useTypedState(ROUTES.PRODUCT.DETAILS);
```

## Concepts

### How nesting works

Any route can be a child of another route:

```typescript
const DETAILS = route("details");

const PRODUCT = route("product/:id", {}, { DETAILS });
```

Sure enough, you can also inline child routes:

```typescript
const PRODUCT = route("product/:id", {}, { DETAILS: route("details") });
```

And you can uninline them later:

```typescript
PRODUCT.$.DETAILS === DETAILS;
```

That is, the `$` property of every route contains original routes, specified as children of that route.

It's important to understand that `DETAILS` and `PRODUCT.DETAILS` are separate routes, which may behave differently during parsing or building URLs. `DETAILS` doesn't know anything about `PRODUCT`, but `PRODUCT.DETAILS` does. `DETAILS` is a standalone route, but `PRODUCT.DETAILS` is a child of `PRODUCT`.

> Child routes has to be in CONSTANT_CASE or PascalCase to prevent overlapping with other route fields.

These child routes correspond to child routes in react-router:

```typescript jsx
<Routes>
    {/* '/product/:id' */}
    <Route path={PRODUCT.path} element={<Product />}>
        {/* '/product/:id/details' */}
        <Route path={PRODUCT.DETAILS.path} element={<ProductDetails />} />
    </Route>
</Routes>
```

> React-router allows absolute paths in child routes, if they match the parent path.

Note that we're using the `path` field here, which returns an absolute path. This ensures that the path provided to react-router is actually defined by the library.

> You're encouraged to use the `path` field whenever possible.

As an escape hatch, you can use relative paths (note that you can use `PRODUCT.$.DETAILS.relativePath` instead of `DETAILS.relativePath`):

```typescript jsx
<Routes>
    {/* '/product/:id' */}
    <Route path={PRODUCT.path} element={<Product />}>
        {/* 'details' */}
        <Route path={DETAILS.relativePath} element={<ProductDetails />} />
    </Route>
</Routes>
```

> `path` contains a combined path with a leading slash (`/`), and `relativePath` contains a combined path **without intermediate stars (`*`)** and without a leading slash (`/`).

If your `<Route/>` is not a direct child of another `<Route />`, not only you have to add a `*` to the parent path, but also exclude it from subsequent paths. This is because each `<Routes/>` requires its own absolute paths.

```typescript jsx
const PRODUCT = route("product/:id/*", {}, { DETAILS: route("details") });

<Routes>
    {/* '/product/:id/*' */}
    <Route path={PRODUCT.path} element={<Product />} />
</Routes>;

// Somewhere inside <Product />
<Routes>
    {/* '/details' */}
    <Route path={PRODUCT.$.DETAILS.path} element={<ProductDetails />} />
</Routes>;
```

> Note that star doesn't necessarily mean that the subsequent routes can't be rendered as direct children.

### How typing works

Params typing and validation is done via _type_ objects. There are several [built-in types](#built-in-types), and there is [`createType()`](#createtype) helper for creating custom _types_. Hash is typed via the [`hashValues()`](#hashvalues) helper.

> You are encouraged to write your own _types_ as needed.

If parsing fails (including the case when the corresponding parameter is absent), `undefined` is returned instead. In case of _types_, you can specify a fallback to use instead of `undefined` (and TS is aware of that):

```typescript
const ROUTE = route("my/route", { searchParams: { param: numberType(100) } });
```

You can also specify `throwable` as a fallback, in which case, instead of returning `undefined`, the original error will be thrown (this is mostly suitable for path params):

```typescript
import { throwable } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTE = route("route/:id", { params: { id: numberType(throwable) } });
```

There are no fallbacks for hash, though.

#### Path params

Path params are inferred from the provided `path` and can be overridden (partially or completely) with path _types_. Inferred params won't use any _type_ at all, and instead will simply be considered to be of type `string`.

```typescript
// Here, 'id' is parsed with a number type, and 'subId' implicitly has a 'string' type
const ROUTE = route("route/:id/:subId", { params: { id: numberType } });
```

Upon building, all path params are required, except for the star (`*`) parameter.

Upon parsing, if some implicitly typed param is absent (even the star parameter, because react-router parses it as an empty string), the parsing fails with an error.

Explicitly typed params behave as usual.

> You shouldn't ever need to provide a _type_ for the star parameter, but it's technically possible.

#### Search params

Search params are determined by the provided search _types_.

```typescript
// Here, we define a search parameter 'filter' of 'string' type
const ROUTE = route("route", { searchParams: { filter: stringType } });
```

All search parameters are optional.

#### State fields

State fields are determined by the provided state _types_. To make state merging possible, the state is assumed to always be an object.

```typescript
// Here, we define a state parameter 'fromList' of 'boolean' type
const ROUTE = route("route", { state: { fromList: booleanType } });
```

All state fields are optional.

Note that built-in _types_ convert the given values to `string` (or `string[]`), which is not required in case of state, because it can contain any serializable value. In the future, the library may provide _types_ specifically for state, but in the meantime they can be implemented in the userland.

#### Hash

Hash doesn't use any _types_. Instead, you can specify the allowed values, or specify that any `string` is allowed (by calling the helper without parameters). By default, nothing is allowed as a hash value (otherwise, merging of hash values wouldn't work).

```typescript
const ROUTE_NO_HASH = route("route");

const ROUTE_DEFINED_HASH = route("route", { hash: hashValues("about", "more") });

const ROUTE_ANY_HASH = route("route", { hash: hashValues() });
```

Hash is always optional.

> Note that `hashValues()` is the equivalent of `[] as const` and is used only to make typing more convenient.

### How params work for nested routes

Child routes implicitly have all parameters of their parents. For parameters with the same name, child _types_ take precedence.

> Parameters with the same name are discouraged.

Note that an explicit parent path param will take precedence of an implicit child path param.

Hash values are combined. If a parent allows any `string` to be a hash value, its children can't override that.

## API

### `route()`

A route is defined via the `route()` helper. It accepts required `path` and `options`, and optional `children`. All `options` are optional.

```typescript
const ROUTE = route(
    "my/path",
    {
        params: { pathParam: stringType },
        searchParams: { searchParam: numberType },
        hash: hashValues("value"),
        state: { stateParam: booleanType },
    },
    { CHILD_ROUTE }
);
```

The `path` argument is what you would put to the `path` property of a `<Route/>`, but without leading or trailing slashes (`/`). More specifically, it can:

-   be a simple segment or a group of segments (`'product'`, `'product/details'`).
-   have any number of parameters anywhere (`':id/product'`, `'product/:id/more'`).
-   **end** with a star (`'product/:id/*'`, `'*'`)
-   be an empty string (`''`).

The `options` argument specifies types of the route. See ["How typing works"](#how-typing-works).

The `children` argument specifies child routes of the route. See ["How nesting works"](#how-nesting-works).

The `route()` helper returns a route object, which has the following fields:

-   `path` and `relativePath`, which can be passed to the `path` prop of react-router `<Route/>`.
-   `buildUrl()` and `buildRelativeUrl()` for building parametrized URLs which can be passed to e.g. the `to` prop of react-router `<Link />`.
-   `buildState()` for building typed states, which can be passed to e.g. the `state` prop of react-router `<Link />`.
-   `buildPath()`, `buildRelativePath()`, `buildSearch()`, and `buildHash()` for building parametrized URL parts. They can be used (in conjunction with `buildState()`) to e.g. build a parametrized `Location` object.
-   `getTypedParams()`, `getTypedSearchParams()`, `getTypedHash()`, and `getTypedState()` for retrieving typed params from react-router primitives. Untyped params are omitted.
-   `getUntypedSearchParams()` and `getUntypedState()` for retrieving untyped params from react-router primitives. Typed params are omitted. Note that all path params are inherently typed, as well as hash.
-   `getPlainParams()` and `getPlainSearchParams()` for building react-router primitives from typed params. Note how hash and state don't need these functions, because `buildHash()` and `buildState()` can be used instead.
-   `$`, which contains original routes, specified as child routes of that route. These routes are unaffected by the parent route.
-   Any number of child routes in CONSTANT_CASE or PascalCase.

There are also some internal fields prefixed with `__`.

### Built-in types

-   `stringType` - `string`, stringified as-is.
-   `numberType` - `number`, stringified by `JSON.stringify`.
-   `booleanType` - `boolean`, stringified by `JSON.stringify`.
-   `dateType` - `Date`, stringified as an ISO string.
-   `oneOfType` - one of the given `string`, `number`, or `boolean` values, internally uses the respective built-in _types_. E.g. `oneOfType('foo', 1, true)` means `'foo' | 1 | true`.
-   `arrayOfType` - array of any given _type_, e.g. `arrayOfType(oneOfType(1, 2))` means `(1 | 2)[]`. Stringified as `string[]`, so it can only be used for search params or state.

All built-in types can be called to specify a fallback.

### `createType()`

The `createType()` helper is used to create custom types. It accepts a _type_ object (strictly speaking, it simply decorates the given _type_, adding the fallback functionality):

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

### `hashValues()`

The `hashValues()` helper types the hash part of the URL. See ["How typing works - Hash"](#hash).

### `useTypedParams()`

The `useTypedParams()` hook is a thin wrapper around react-router `useParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

### `useTypedSearchParams()`

The `useTypedSearchParams()` hook is a (somewhat) thin wrapper around react-router `useSearchParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

Notable differences:

-   `setTypedSearchParams()` can also accept a callback, which will be called with the current typed search params.
-   `setTypedSearchParams()` has an additional `preserveUntyped` option. If `true`, existing untyped (by the given route) search parameters will remain intact. Note that this option has no effect on the `state` option. That is, there is no way to preserve untyped state fields.

> In the future, the library may provide the same improvements for state. For now, it can be implemented in the userland in the form of a custom hook.

### `useTypedHash()`

The `useTypedHash()` hook is a thin wrapper around react-router `useLocation()`. It accepts a route object as the first parameter and returns a typed hash.

### `useTypedState()`

The `useTypedState()` hook is a thin wrapper around react-router `useLocation()`. It accepts a route object as the first parameter and returns a typed state.
