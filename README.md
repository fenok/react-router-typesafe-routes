# React Router Typesafe Routes 🍣

Comprehensive and extensible type-safe routes for React Router v6 with first-class support for nested routes and param validation.

[![npm](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

The library provides type safety for all route params (path params, search params, state, and hash) on building and parsing URL parts and state objects. There are no unsafe type casts whatsoever.

If you want, you can use a validation library. There is first-party support for [Zod](https://github.com/colinhacks/zod) and [Yup](https://github.com/jquense/yup), and other libraries are easily integratable. If not, you can use other built-in types and fine-tune their validation instead.

In built-in types, parsing and validation errors are caught and replaced with `undefined`. You can also return a default value or throw an error in case of an absent or invalid param. All these adjustments reflect in types, too!

Multiple identical keys in search strings are also supported. By default, wrapping quotes in serialized params are omitted when it's safe to do so, which leads to cleaner URLs.

If you need more control, you can build completely custom types, which means that parsing, serializing, and typing are fully customizable.

The library doesn't restrict or alter React Router API in any way, including nested routes and relative links. It's also gradually adoptable.

> ⚠ For React Router v5, see [v0.3.2](https://www.npmjs.com/package/react-router-typesafe-routes/v/0.3.2). It's drastically different and not supported anymore, though.

## Installation

```
yarn add react-router-typesafe-routes
```

You'll need to use one of platform-specific entry points, each of which requires `react` as a peer dependency:

-   `react-router-typesafe-routes/dom` for web, `react-router-dom` is a peer dependency;
-   `react-router-typesafe-routes/native` for React Native, `react-router-native` is a peer dependency.

Additionally, there are optional entry points for types based on third-party validation libraries:

-   `react-router-typesafe-routes/zod` exports `zod` type, `zod` is a peer dependency;
-   `react-router-typesafe-routes/yup` exports `yup` type, `yup` is a peer dependency;

The library is distributed as an ES module written in ES6.

> Note that I'm not opposed to adding CommonJS support, but I'm not an expert in dealing with the [dual package hazard](https://nodejs.org/api/packages.html#packages_dual_package_hazard). And, since some packages are [dropping CommonJS support](https://devclass.com/2021/06/15/d3-7-0-goes-all-in-on-ecmascript-modules/) anyway, I'm not sure that it worth spending resources on. I'll gladly accept a PR, but it shouldn't affect the ES module users in any way.

## Limitations & Caveats

-   To make params merging possible, the state has to be an object, and the hash has to be one of the known strings (or any string).
-   Since React Router only considers pathname on route matching, search parameters, state fields, and hash are considered optional upon URL or state building.
-   For simplicity, the hash is always considered optional upon URL parsing.
-   For convenience, absent and invalid params are considered virtually the same during parsing and validation in built-in types (but you have full control with custom types).
-   To prevent overlapping with route API, child routes have to start with an uppercase letter (this only affects code and not the resulting URL).
-   To emphasize that route relativity is governed by the library, leading slashes in path patterns are forbidden. Trailing slashes are also forbidden due to being purely cosmetic.

## How is it different from existing solutions?

| Feature                                                                          | react-router-typesafe-routes | [typesafe-routes](https://github.com/kruschid/typesafe-routes) | [typed-react-router](https://github.com/bram209/typed-react-router) |
| -------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| Type-safe path params                                                            | ✅                           | ✅                                                             | ✅                                                                  |
| Type-safe search params                                                          | ✅                           | ✅                                                             | 🚫                                                                  |
| Multiple identical keys in search params                                         | ✅                           | 🚫️                                                            | 🚫                                                                  |
| Type-safe state                                                                  | ✅                           | 🚫                                                             | 🚫                                                                  |
| Type-safe hash                                                                   | ✅                           | 🚫                                                             | 🚫                                                                  |
| Customizable serialization                                                       | ✅                           | ✅                                                             | 🚫                                                                  |
| Customizable parsing / validation                                                | ✅                           | ✅                                                             | 🚫                                                                  |
| Built-in types allow to customize validation and absent / invalid param handling | ✅                           | 🚫                                                             | 🚫                                                                  |
| Nested routes                                                                    | ✅                           | ✅                                                             | ✅                                                                  |
| Relative links                                                                   | ✅                           | ✅                                                             | 🚫                                                                  |
| Tailored specifically for React Router v6                                        | ✅                           | 🚫                                                             | ✅                                                                  |

Other libraries that I was able to find are outdated and not really suitable for React Router v6:

-   [typesafe-react-router](https://github.com/AveroLLC/typesafe-react-router)
-   [react-typesafe-routes](https://github.com/innFactory/react-typesafe-routes) (this one is currently being updated for React Router v6)

You might also want to use some other router with built-in type safety:

-   [TanStack Router](https://github.com/tanstack/router)
-   [Type Route](https://github.com/zilch/type-route)
-   [Chicane](https://github.com/swan-io/chicane)

## Quick usage example

Define routes:

```tsx
import { route, number, boolean, hashValues } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTES = {
    USER: route(
        // This is a normal path pattern, but without leading or trailing slashes.
        // By default, path params are inferred from the pattern.
        "user/:id",
        {
            // We can override some or all path params. Here, we override 'id'.
            // We specify that an error will be thrown in case of an absent/invalid param.
            // For demonstration purposes only, normally you shouldn't throw.
            params: { id: number().defined() },
            // These are search params.
            // We specify a default value to use in case of an absent/invalid param.
            searchParams: { infoVisible: boolean().default(false) },
            // These are state fields, which are similar to search params.
            // By default, 'undefined' is returned in case of an absent/invalid param.
            state: { fromUserList: boolean() },
            // These are allowed hash values.
            // We could also use hashValues() to indicate that any hash is allowed.
            hash: hashValues("info", "comments"),
        },
        // This is a child route, which inherits all parent params.
        // Note how it has to start with an uppercase letter.
        // As a reminder, its path params are inferred from the pattern.
        { DETAILS: route("details/:lang?") }
    ),
};
```

Use `Route` components as usual:

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native
import { ROUTES } from "./path/to/routes";

// Absolute paths
<Routes>
    {/* /user/:id */}
    <Route path={ROUTES.USER.path} element={<User />}>
        {/* /user/:id/details/:lang? */}
        <Route path={ROUTES.USER.DETAILS.path} element={<UserDetails />} />
    </Route>
</Routes>;

// Relative paths
<Routes>
    {/* user/:id */}
    <Route path={ROUTES.USER.relativePath} element={<User />}>
        {/* details/:lang? */}
        {/* $ effectively defines path pattern start. */}
        <Route path={ROUTES.USER.$.DETAILS.relativePath} element={<UserDetails />} />
    </Route>
</Routes>;
```

Use `Link` components as usual:

```tsx
import { Link } from "react-router-dom"; // Or -native
import { ROUTES } from "./path/to/routes";

// Absolute link
<Link
    // Path params: { id: number; lang?: string } -- optionality is governed by the path pattern.
    // Search params: { infoVisible?: boolean } -- all params are optional.
    // State fields: { fromUserList?: boolean } -- all fields are optional.
    // Hash: "info" | "comments" | undefined
    to={ROUTES.USER.DETAILS.buildPath({ id: 1, lang: "en" }, { infoVisible: false }, "comments")}
    state={ROUTES.USER.DETAILS.buildState({ fromUserList: true })}
>
    /user/1/details/en?infoVisible=false#comments
</Link>;

// Relative link
<Link
    // Path params: { lang?: string } -- optionality is governed by the path pattern.
    // Other params remain the same.
    // $ effectively defines path pattern start.
    to={ROUTES.USER.$.DETAILS.buildRelativePath({ lang: "en" }, { infoVisible: true }, "info")}
    state={ROUTES.USER.DETAILS.buildState({ fromUserList: false })}
>
    details/en?infoVisible=true#info
</Link>;
```

Get typed path params with `useTypedParams()`:

```tsx
import { useTypedParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { id: number; lang?: string }.
// Note how id can't be undefined because we throw an error in case of an absent/invalid param.
const { id, lang } = useTypedParams(ROUTES.USER.DETAILS);
```

Get typed search params with `useTypedSearchParams()`:

```tsx
import { useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { infoVisible: boolean }.
// Note how infoVisible can't be undefined because we specified a default value.
const [{ infoVisible }, setTypedSearchParams] = useTypedSearchParams(ROUTES.USER.DETAILS);
```

Get typed state with `useTypedState()`:

```tsx
import { useTypedState } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is { fromUserList: boolean | undefined }.
// Note how fromUserList can be undefined, which means that it's absent or invalid.
const { fromUserList } = useTypedState(ROUTES.USER.DETAILS);
```

Get typed hash with `useTypedHash()`:

```tsx
import { useTypedHash } from "react-router-typesafe-routes/dom"; // Or /native
import { ROUTES } from "./path/to/routes";

// The type here is "info" | "comments" | undefined.
const hash = useTypedHash(ROUTES.USER.DETAILS);
```

## Advanced examples

Define unions and arrays:

```tsx
import { route, union, number } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTE = route("", {
    searchParams: {
        // Unions can contain any string, number, and boolean values.
        tab: union("info", "comments").default("info"),
        // Every built-in type can be used to create an array type.
        // Arrays can only be used for search params and state fields.
        // As expected, we can use '.default' and '.defined' for items.
        // If items are '.defined', an absent/invalid param will fail the whole array.
        selectedIds: number().default(-1).array(),
    },
});
```

Reuse types across routes:

```tsx
import { route, types, number, string, useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native

const PAGINATION_FRAGMENT = route("", { searchParams: { page: number() } });

const ROUTES = {
    // This route uses pagination params and also has its own search params.
    USER: route("user", types({ searchParams: { q: string() } })(PAGINATION_FRAGMENT)),
    // This route only uses pagination params.
    POST: route("post", types(PAGINATION_FRAGMENT)),
    // This route doesn't use pagination params
    ABOUT: route("about"),
};

// We can use PAGINATION_FRAGMENT to get the page param anywhere:
const [{ page }] = useTypedSearchParams(PAGINATION_FRAGMENT);
```

Add custom validation:

```tsx
import { route, string, number } from "react-router-typesafe-routes/dom"; // Or /native

// Note that we don't need to check that value is a number.
// This is possible because number() helper has this check built-it.
const integer = (value: number) => {
    if (!Number.isInteger(value)) {
        throw new Error(`Expected ${value} to be integer.`);
    }

    return value;
};

// We can construct validators however we want.
const regExp = (regExp: RegExp) => (value: string) => {
    if (value.match(regExp)?.[0] !== value) {
        throw new Error(`"${value}" does not match ${String(regExp)}`);
    }

    return value;
};

const ROUTE = route(":id", {
    // string() only accepts validators that return strings.
    params: { id: string(regExp(/\d+/)) },
    // number() only accepts validators that return numbers.
    searchParams: { page: number(integer) },
});
```

Use Zod:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { zod } from "react-router-typesafe-routes/zod";
import { z } from "zod";

const ROUTE = route(":id", {
    // You should only describe a string, number, boolean, or date (possibly optional).
    // Otherwise, the value is stringified and parsed by JSON.
    params: { id: zod(z.string().uuid()) },
});
```

> ❗Zod doesn't do coercion by default, but you may need it for complex values returned from `JSON.parse` (for instance, a date wrapped in an object).

Use Yup:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { yup } from "react-router-typesafe-routes/yup";
import { string } from "yup";

const ROUTE = route(":id", {
    // You should only describe a string, number, boolean, or date (possibly optional).
    // Otherwise, the value is stringified and parsed by JSON.
    params: { id: yup(string().uuid()) },
});
```

Integrate third-party validation library:

```tsx
import { type, parser, UniversalType, ParserHint } from "react-router-typesafe-routes/dom"; // Or /native
// Schema is a library-specific interface.
import { v, Schema } from "third-party-library";

function getTypeHint(schema: Schema): ParserHint {
    // This is the most tricky part.
    // We determine if the schema type is assignable to 'string', 'number', 'boolean', or 'date'.
    // If so, we return the corresponding hint, and 'unknown' otherwise.
    // The type can also be optional, e.g. 'string | undefined' should use 'string' hint.
    return schema.type;
}

function valid<T>(schema: Schema<T>): UniversalType<T> {
    // We use library-specific validation logic.
    return type((value: unknown) => schema.validate(value), parser(getTypeHint(schema)));
}

const ROUTE = route(":id", {
    params: { id: valid(v.string().uuid()) },
});
```

Construct type objects manually to cover obscure use cases:

```tsx
import { route, ParamType } from "react-router-typesafe-routes/dom"; // Or /native

// This type accepts 'string | number | boolean' and returns 'string'.
// We only implement ParamType interface, so this type can only be used for path params.
// For other params, we would need to implement SearchParamType and StateParamType.
const looseString: ParamType<string, string | number | boolean> = {
    getPlainParam(value) {
        // It's always guaranteed that value is not 'undefined' here.
        return String(value);
    },
    getTypedParam(value) {
        // We could treat 'undefined' in a special way to distinguish absent and invalid params.
        if (typeof value !== "string") {
            throw new Error("Expected string");
        }

        return value;
    },
};

const ROUTE = route(":id", {
    params: { id: looseString },
});
```

## Concepts

### Nesting

#### Library routes

Any route can be a child of another route. Child routes inherit everything from their parent.

Most of the time, it's easier to simply inline child routes:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native

const USER = route("user/:id", {}, { DETAILS: route("details") });

console.log(USER.path); // "/user/:id"
console.log(USER.DETAILS.path); // "/user/:id/details"
```

They can also be uninlined, most likely for usage in multiple places:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native

const DETAILS = route("details");

const USER = route("user/:id", {}, { DETAILS });
const POST = route("post/:id", {}, { DETAILS });

console.log(USER.DETAILS.path); // "/user/:id/details"
console.log(POST.DETAILS.path); // "/post/:id/details"
console.log(DETAILS.path); // "/details"
```

To reiterate, `DETAILS` and `USER.DETAILS` are separate routes, which will usually behave differently. `DETAILS` doesn't know anything about `USER`, but `USER.DETAILS` does. `DETAILS` is a standalone route, but `USER.DETAILS` is a child of `USER`.

> ❗Child routes have to start with an uppercase letter to prevent overlapping with route API.

#### Using routes in React Router `<Route />` components

Routes structure _usually_ corresponds to the structure of `<Route />` components:

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native

<Routes>
    {/* '/user/:id' */}
    <Route path={USER.path} element={<User />}>
        {/* '/user/:id/details' */}
        <Route path={USER.DETAILS.path} element={<UserDetails />} />
    </Route>
</Routes>;
```

> ❗As a reminder, you have to render an `<Outlet />` in the parent component.

However, nothing stops you from specifying additional routes as you see fit.

Note that we're using the `path` field here, which returns an absolute path pattern. React Router allows absolute child route paths if they match the parent path.

You're encouraged to use absolute path patterns whenever possible because they are easier to reason about.

> ❗ At the time of writing, there are [quirks](https://github.com/remix-run/react-router/issues/9925) with optional path segments that may force the use of relative path patterns.

Relative paths can be used like this:

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native

<Routes>
    {/* 'user/:id' */}
    <Route path={USER.relativePath} element={<User />}>
        {/* 'details' */}
        <Route path={USER.$.DETAILS.relativePath} element={<UserDetails />} />
    </Route>
</Routes>;
```

That is, the `$` property of every route contains child routes that lack parent path pattern. The mental model here is that `$` defines the path pattern start.

The `path` property contains a combined path with a leading slash (`/`), and `relativePath` contains a combined path **without intermediate stars (`*`)** and without a leading slash (`/`).

#### Nested `<Routes />`

If your `<Route/>` is rendered in a nested `<Routes />`, you have to not only add a `*` to the parent path, but also exclude the parent path from the subsequent paths. This might change if [this proposal](https://github.com/remix-run/react-router/discussions/9841) goes through.

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native
import { route } from "react-router-typesafe-routes/dom"; // Or /native

const USER = route("user/:id/*", {}, { DETAILS: route("details") });

<Routes>
    {/* '/user/:id/*' */}
    <Route path={USER.path} element={<User />} />
</Routes>;

// Somewhere inside <User />
<Routes>
    {/* '/details' */}
    <Route path={USER.$.DETAILS.path} element={<UserDetails />} />
</Routes>;
```

> ❗ Star doesn't prevent subsequent routes from being rendered as direct children.

> ❗At the time of writing, there are [some issues](https://github.com/remix-run/react-router/issues/9929) with nested `<Routes />` if dynamic segments are used.

### Typing

#### Type objects

Path params, search params, and state fields serializing, parsing, validation, and typing are done via type objects. Validation is done during parsing.

```typescript
// Can be used for path params
interface ParamType<TOut, TIn = TOut> {
    getPlainParam: (originalValue: Exclude<TIn, undefined>) => string;
    getTypedParam: (plainValue: string | undefined) => TOut;
}

// Can be used for search params
interface SearchParamType<TOut, TIn = TOut> {
    getPlainSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
    getTypedSearchParam: (plainValue: string[]) => TOut;
}

// Can be used for state fields
interface StateParamType<TOut, TIn = TOut> {
    getPlainStateParam: (originalValue: Exclude<TIn, undefined>) => unknown;
    getTypedStateParam: (plainValue: unknown) => TOut;
}
```

> ❗ It's guaranteed that `undefined` will never be passed as `TIn`.

These interfaces allow to express pretty much anything, though normally you should use the built-in helpers for constructing these objects. Manual construction should only be used if you're hitting some limitations.

#### Type helpers

To make type objects construction and usage easier, we impose a set of reasonable restrictions / design choices:

-   `TIn` and `TOut` are the same, for all params.
-   Type objects for arrays are constructed based on helpers for individual values. Array params can never be parsed/validated into `undefined`.
-   By default, parsing/validation errors result in `undefined`. We can also opt in to returning a default value or throwing an error in case of an absent/invalid param.
-   State params are only validated and not transformed in any way.
-   Type objects for individual values can be used for any param. Type objects for arrays can only be used for search params and state fields.

With this in mind, we can think about type objects in terms of parsers and validators.

##### `Parser`

Parser is simply a group of functions for transforming a value to `string` and back:

```typescript
interface Parser<T> {
    stringify: (value: T) => string;
    // There are edge cases when this value can be different from T.
    // We always validate this value anyway.
    parse: (value: string) => unknown;
}
```

The library provides `parser()` helper for accessing built-in parsers. By default, it simply uses `JSON`. If you know that a parser will only be used for values of a specific type, you can hint this type to parser to get nicer stringification. For instance, `parser('string')` returns a parser that omits wrapping quotes in stringified values, which makes URLs cleaner.

##### `Validator`

Validator is simply a function for validating values:

```typescript
interface Validator<T, TPrev = unknown> {
    (value: TPrev): T;
}
```

It returns a valid value or throws if that's impossible. It can transform values to make them valid.

The important thing is that it has to handle both the original value and whatever the corresponding parser `parse()` returns.

##### Generic helper

The `type()` helper is used for creating all kinds of type objects. The resulting param type is inferred from the given validator.

```typescript
const positiveNumber: Validator<number> = (value: unknown): number => {
    if (typeof value !== "number" || value <= 0) {
        throw new Error("Expected positive number");
    }

    return value;
};

type(positiveNumber, parser("number"));

// We can also omit parser. The default parser is simply JSON.
type(positiveNumber);
```

The resulting type object will return undefined upon a parsing (or validation) error. We can change how absent/invalid params are treated:

```typescript
// This will throw an error.
type(positiveNumber).defined();
// This will return the given value.
type(positiveNumber).default(1);
```

The `.defined()`/`.default()` modifiers guarantee that the parsing result is not `undefined`, even if the given validator can return it. Default values passed to `.default()` are validated.

We can also construct type objects for arrays:

```typescript
// Upon parsing:

// This will give '(number | undefined)[]'.
// This should be the most common variant.
type(positiveNumber).array();

// This will give 'number[]'.
// Absent/invalid values will be replaced with '-1'.
type(positiveNumber).default(-1).array();

// This will give 'number[]'.
// Absent/invalid values will lead to an error.
type(positiveNumber).defined().array();
```

Arrays can only be used in search params and state fields, because there is no standard way to store arrays in path params. For state fields, if a value is not an array, it's parsed as an empty array.

##### Type-specific helpers

Most of the time, you should use type-specific helpers: `string()`, `number()`, `boolean()`, or `date()`. They are built on top of `type()`, but they have the corresponding parsers and `typeof` checks built-in.

For instance:

```typescript
const positive: Validator<number, number> = (value: number): number => {
    if (value <= 0) {
        throw new Error("Expected positive number");
    }

    return value;
};

number(positive);
```

##### Third-party validation libraries

You can use Zod and Yup out-of-box, and you should be able to integrate any third-party validation library via the `type()` helper. See [Advanced Examples](#advanced-examples).

Gotchas:

-   It doesn't matter if a validator can accept or return `undefined` or not - it will be normalized by `type()` anyway.
-   A validator can receive `undefined`, which means that it can define its own default value, for example.

#### Hash values

Hash is typed via the [`hashValues()`](#hashvalues) helper. You simply specify the allowed values. If none specified, anything is allowed.

#### Path params

Path params are inferred from the provided path pattern and can be overridden (partially or completely) with path type objects. Inferred params won't use any type object at all, and instead will simply be considered to be of type `string`.

Just as usual segments, dynamic segments (path params) can be made optional by adding a `?` to the end. This also applies to star (`*`) segments.

```tsx
import { route, number } from "react-router-typesafe-routes/dom"; // Or /native

// Here, id is overridden to be a number, and subId and optionalId are strings
const ROUTE = route("route/:id/:subId/:optionalId?", { params: { id: number() } });
```

Upon building, all path params except the optional ones are required. Star parameter (`*`) is always optional upon building.

Upon parsing, if some non-optional implicitly typed param is absent (even the star parameter, because React Router parses it as an empty string), the parsing fails with an error.

Explicitly typed params behave as usual.

> ❗ You most likely will never need it, but it's technically possible to provide a type object for the star parameter as well.

#### Search params

Search params are determined by the provided search type objects.

```tsx
import { route, string } from "react-router-typesafe-routes/dom"; // Or /native

// Here, we define a search parameter 'filter' of 'string' type
const ROUTE = route("route", { searchParams: { filter: string() } });
```

All search parameters are optional.

#### State fields

State fields are determined by the provided state type objects. To make state merging possible, the state is assumed to always be an object.

```tsx
import { route, boolean } from "react-router-typesafe-routes/dom"; // Or /native

// Here, we define a state parameter 'fromList' of 'boolean' type
const ROUTE = route("route", { state: { fromList: boolean() } });
```

All state fields are optional.

#### Hash

Hash doesn't use any type objects. Instead, you can specify the allowed values, or specify that any `string` is allowed (by calling the helper without parameters). By default, nothing is allowed as a hash value (otherwise, merging of hash values wouldn't work).

```tsx
import { route, hashValues } from "react-router-typesafe-routes/dom"; // Or /native

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

Child routes under `$` don't inherit parent type objects for path params.

#### Types composition

It's pretty common to have completely unrelated routes that share the same set of params. One such example is pagination params.

We can use nesting and put common types to a single common route:

```tsx
import { route, number, useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTE = route(
    "",
    { searchParams: { page: number() } },
    { USER: route("user"), POST: route("post"), ABOUT: route("about") }
);

// We can use this common ROUTE to get the page param anywhere:
const [{ page }] = useTypedSearchParams(ROUTE);
```

However, this approach has the following drawbacks:

-   All routes will have all common params, even if they don't need them.
-   All common params are defined in one place, which may get cluttered.
-   We can't share path params this way, because they require the corresponding path pattern.

To mitigate these issues, we can use type composition via the [`types()`](#types) helper:

```tsx
import { route, types, number, string, useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native

const PAGINATION_FRAGMENT = route("", { searchParams: { page: number() } });

const ROUTES = {
    // This route uses pagination params and also has its own search params.
    USER: route("user", types({ searchParams: { q: string() } })(PAGINATION_FRAGMENT)),
    // This route only uses pagination params.
    POST: route("post", types(PAGINATION_FRAGMENT)),
    // This route doesn't use pagination params
    ABOUT: route("about"),
};

// We can use PAGINATION_FRAGMENT to get the page param anywhere:
const [{ page }] = useTypedSearchParams(PAGINATION_FRAGMENT);
```

The `types()` helper accepts either a set of types (including hash values), or a route which types should be used, and returns a callable set of types, which can be called to add more types. We can compose any number of types, and they are merged in the same way as types in nested routes.

> ❗ Types for path params will only be used if the path pattern has the corresponding dynamic segments.

## API

### `route()`

A route is defined via the `route()` helper. It accepts required `path` and optional `types` and `children`. All `types` fields are optional.

```tsx
import { route, string, number, boolean, hashValues } from "react-router-typesafe-routes/dom"; // Or /native

const ROUTE = route(
    "my/path",
    {
        params: { pathParam: string() },
        searchParams: { searchParam: number() },
        state: { stateParam: boolean() },
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

The `types` argument specifies type objects and hash values of the route. See [Typing](#typing).

The `children` argument specifies child routes of the route. See [Nesting](#nesting).

The `route()` helper returns a route object, which has the following fields:

-   `path` and `relativePath`, where `path` contains a combined path pattern with a leading slash (`/`), and `relativePath` contains a combined path pattern **without intermediate stars (`*`)** and a leading slash (`/`). They can be passed to e.g. the `path` prop of React Router `<Route/>`.
    > ❗ At the time of writing, patterns with optional segments [can't](https://github.com/remix-run/react-router/discussions/9862) be used in `matchPath`/`useMatch`.
-   `buildPath()` and `buildRelativePath()` for building parametrized URL paths (pathname + search + hash) which can be passed to e.g. the `to` prop of React Router `<Link />`.
-   `buildState()` for building typed states, which can be passed to e.g. the `state` prop of React Router `<Link />`.
-   `buildSearch()` and `buildHash()` for building parametrized URL parts. They can be used (in conjunction with `buildState()` and `buildPath()`/`buildRelativePath()`) to e.g. build a parametrized `Location` object.
-   `getTypedParams()`, `getTypedSearchParams()`, `getTypedHash()`, and `getTypedState()` for retrieving typed params from React Router primitives. Untyped params are omitted.
-   `getUntypedParams()`, `getUntypedSearchParams()`, and `getUntypedState()` for retrieving untyped params from React Router primitives. Typed params are omitted. Note that the hash is always typed.
-   `getPlainParams()` and `getPlainSearchParams()` for building React Router primitives from typed params. Note how hash and state don't need these functions because `buildHash()` and `buildState()` can be used instead.
-   `types`, which contains type objects and hash values of the route. Can be used for sharing types with other routes, though normally you should use the [`types()`](#types) helper instead.
-   `$`, which contains child routes that lack the parent path pattern and the corresponding type objects.
-   Any number of child routes starting with an uppercase letter.

### `parser()`

The built-in parser is exposed as `parser()`. It should only be used for creating custom wrappers around `type()`.

It accepts the following type hints:

-   `'string'` - the value is not transformed in any way.
-   `'number'` - the value is processed by `JSON`.
-   `'boolean'` - the value is processed by `JSON`.
-   `'date'` - the value is transformed to an ISO string.
-   `'unknown'` - the value is processed by `JSON`.

When called without a hint, `'unknown'` is used.

### `type()`

All type helpers are wrappers around `type()`. It's primarily exposed for integrating third-party validation libraries, but it can also be used directly, if needed.

See [Typing: Type helpers](#type-helpers).

There are built-in helpers for common types:

-   `string()`, `number()`, `boolean()`, `date()` - simple wrappers around `type()`, embed the corresponding parsers and `typeof` checks. Can accept validators that expect the corresponding types as an input.
-   `union()` - a wrapper around `type()` that describes unions of `string`, `number`, or `boolean` values. Can accept a readonly array or individual values.

There are also built-in helpers for third-party validation libraries:

-   `zod()` - a wrapper around `type()` for creating type objects based on Zod Types. Uses a separate entry point: `react-router-typesafe-routes/zod`.
-   `yup()` - a wrapper around `type()` for creating type objects based on Yup Schemas. Uses a separate entry point: `react-router-typesafe-routes/yup`.

For types that are assignable to `string`, `number`, `boolean`, or `date` (ignoring `undefined`), the corresponding parser hint is used.

All built-in helpers catch parsing and validation errors and replace them with `undefined`. This behavior can be altered with the following modifiers:

-   `.default()` - accepts a default value that is used instead of an absent/invalid param;
-   `.defined()` - specifies that an error is thrown in case of an absent/invalid param. For invalid params, the original error is used.

### `hashValues()`

The `hashValues()` helper types the hash part of the URL. See [Typing: Hash](#hash).

### `types()`

The `types()` helper is used for types composition. See [Typing: Types composition](#types-composition).

### Hooks

All hooks are designed in such a way that they can be reimplemented in the userland. If something isn't working for you, you can get yourself unstuck by creating custom hooks.

Of course, you can still use React Router hooks as you see fit.

#### `useTypedParams()`

The `useTypedParams()` hook is a thin wrapper around React Router `useParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

#### `useTypedSearchParams()`

The `useTypedSearchParams()` hook is a (somewhat) thin wrapper around React Router `useSearchParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

The only notable difference is that `setTypedSearchParams()` has an additional `preserveUntyped` option. If `true`, existing untyped (by the given route) search parameters will remain intact. Note that this option does not affect the `state` option. That is, there is no way to preserve untyped state fields.

The reason for this is that `useTypedSearchParams()` is intended to be a simple wrapper around `useSearchParams()`, and the latter doesn't provide any access to the current state. If [this proposal](https://github.com/remix-run/react-router/discussions/9950) goes through, it would be very easy to implement, but for now, the only way to achieve this is to create a custom hook.

#### `useTypedState()`

The `useTypedState()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed state.

#### `useTypedHash()`

The `useTypedHash()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed hash.
