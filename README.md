# React Router Typesafe Routes 🍣

Comprehensive and extensible type-safe routes for React Router v6 with first-class support for nested routes and param validation.

[![npm](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

> ⚠ You're viewing the documentation for the upcoming version 2.0.0, which is currently unstable. If you're looking for the documentation for the current version, please refer to the [main branch](https://github.com/fenok/react-router-typesafe-routes/tree/main).

The library provides type safety for all route params (path params, search params (including multiple keys), state, and hash) on building and parsing URL parts and state. There are no unsafe type casts whatsoever.

If you want, you can use a validation library. There is first-party support for [Zod](https://github.com/colinhacks/zod) and [Yup](https://github.com/jquense/yup), and other libraries are easily integratable. If not, you can use other built-in types and fine-tune their validation instead.

In built-in types, parsing and validation errors are caught and replaced with `undefined`. You can also return a default value or throw an error in case of an absent or invalid param. All these adjustments reflect in types, too!

If you need more control, you can build completely custom types, which means that parsing, serializing, and typing are fully customizable.

The library doesn't restrict or alter React Router API in any way, including nested routes and relative links. It's also gradually adoptable.

## Installation

```
yarn add react-router-typesafe-routes@next
```

You'll need to use one of platform-specific entry points, each of which requires `react` as a peer dependency:

- `react-router-typesafe-routes/dom` for web, `react-router-dom` is a peer dependency;
- `react-router-typesafe-routes/native` for React Native, `react-router-native` is a peer dependency.

Additionally, there are optional entry points for types based on third-party validation libraries:

- `react-router-typesafe-routes/zod` exports `zod` type, `zod` is a peer dependency;
- `react-router-typesafe-routes/yup` exports `yup` type, `yup` is a peer dependency;

The library is targeting ES6 (ES2015). ESM is used by default, and CommonJS is only usable in environments that support the `exports` field in `package.json`.

The minimal required version of TypeScript is `5.0` and `strict` mode must be enabled.

## Limitations & Caveats

- Since React Router only considers pathname on route matching, search parameters, hash, and state are considered optional upon URL or state building.
- For convenience, absent and invalid params are considered virtually the same by built-in types (but you have full control with custom types).
- To emphasize that route relativity is governed by the library, leading slashes in path patterns are forbidden. Trailing slashes are also forbidden due to being purely cosmetic.

## How is it different from existing solutions?

| Feature                                                                          | react-router-typesafe-routes | [typesafe-routes](https://github.com/kruschid/typesafe-routes) | [typed-react-router](https://github.com/bram209/typed-react-router) | [typesafe-router](https://github.com/jamesopstad/typesafe-router) |
| -------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Type-safe path params                                                            | ✅                           | ✅                                                             | ✅                                                                  | ⏳                                                                |
| Type-safe search params                                                          | ✅                           | ✅                                                             | 🚫                                                                  | ⏳                                                                |
| Multiple identical keys in search params                                         | ✅                           | 🚫️                                                            | 🚫                                                                  | ⏳                                                                |
| Type-safe state                                                                  | ✅                           | 🚫                                                             | 🚫                                                                  | ⏳                                                                |
| Type-safe hash                                                                   | ✅                           | 🚫                                                             | 🚫                                                                  | ⏳                                                                |
| Customizable serialization                                                       | ✅                           | ✅                                                             | 🚫                                                                  | ⏳                                                                |
| Customizable parsing / validation                                                | ✅                           | ✅                                                             | 🚫                                                                  | ⏳                                                                |
| Built-in types allow to customize validation and absent / invalid param handling | ✅                           | 🚫                                                             | 🚫                                                                  | ⏳                                                                |
| Nested routes                                                                    | ✅                           | ✅                                                             | ✅                                                                  | ⏳                                                                |
| Relative links                                                                   | ✅                           | ✅                                                             | 🚫                                                                  | ⏳                                                                |
| Tailored specifically for React Router v6                                        | ✅                           | 🚫                                                             | ✅                                                                  | ⏳                                                                |
| Type-safe actions/loaders                                                        | 🚫                           | 🚫                                                             | 🚫                                                                  | ✅                                                                |

Other libraries that I was able to find are outdated and not really suitable for React Router v6:

- [typesafe-react-router](https://github.com/AveroLLC/typesafe-react-router)
- [react-typesafe-routes](https://github.com/innFactory/react-typesafe-routes)

You might also want to use some other router with built-in type safety:

- [TanStack Router](https://github.com/tanstack/router)
- [Type Route](https://github.com/zilch/type-route)
- [Chicane](https://github.com/swan-io/chicane)

## Quick usage example

Define routes:

```tsx
import { route, number, boolean, union } from "react-router-typesafe-routes/dom"; // Or /native

// Types specify how params are serialized and parsed.
// All params are optional, except for required pathname params.
// You can optionally start with a pathless route to specify params for all routes.
const root = route({
  // E.g. this search param is global and also non-undefined, since it has a default value.
  searchParams: { utm_campaign: string().default("default_campaign") },
  // Child routes inherit all parent params.
  children: {
    user: route({
      // Pattern can't start or end with a slash. Pathname params are inferred from it.
      // Implicit required params use 'string().defined()', so they can throw upon parsing.
      path: "user/:userId",
      // You can e.g. change implicit 'string().defined()' to explicit 'number().defined()'.
      params: { userId: number().defined() },
      // You can specify hash. To allow any hash, define it as 'string()'.
      hash: union("info", "comments"),
      // You can specify state parts. Without modifiers, types can return 'undefined' upon parsing.
      state: { fromUserList: boolean() },
      // Child routes inherit all parent params.
      children: {
        // Optional pathname params are also supported and implicitly use 'string()' type.
        post: route({ path: "post/:postId?" }),
      },
    }),
  },
});
```

Use `Route` components as usual:

> ❗Routes can (and probably should!) be defined as objects that are passed to e.g. [`createBrowserRouter`](https://reactrouter.com/en/main/routers/create-browser-router). However, we will use the JSX style throughout the doc because it's not deprecated and also more nuanced.

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native
import { root } from "./path/to/routes";

// Absolute paths
<Routes>
  {/* /user/:userId */}
  <Route path={root.user.$path} element={<User />}>
    {/* /user/:userId/post/:postId? */}
    <Route path={root.user.post.$path} element={<Post />} />
  </Route>
</Routes>;

// Relative paths
<Routes>
  {/* user/:userId */}
  <Route path={root.user.$relativePath} element={<User />}>
    {/* post/:postId? */}
    {/* $ effectively defines path pattern start. */}
    <Route path={root.user.$.post.$relativePath} element={<Post />} />
  </Route>
</Routes>;
```

Use `Link` components as usual:

```tsx
import { Link } from "react-router-dom"; // Or -native
import { root } from "./path/to/routes";

// Absolute link
<Link
  // Everything is optional except for required pathname param (params.userId).
  to={root.user.post.$buildPath({
    params: { userId: 1, postId: "abc" },
    searchParams: { utm_campaign: "campaign" },
    hash: "comments",
  })}
  state={root.user.post.$buildState({ fromUserList: true })}
>
  /user/1/post/abc?utm_campaign=campaign#comments
</Link>;

// Relative link
<Link
  // Everything is optional, because there are no required pathname params.
  // $ effectively defines path pattern start.
  to={root.user.$.post.$buildPath({
    relative: true,
    params: { postId: "abc" },
    searchParams: { utm_campaign: "campaign" },
    hash: "info",
  })}
  state={root.user.post.$buildState({ fromUserList: false })}
>
  post/abc?utm_campaign=campaign#info
</Link>;
```

Get typed path params with `useTypedParams()`:

```tsx
import { useTypedParams } from "react-router-typesafe-routes/dom"; // Or /native
import { root } from "./path/to/routes";

// The type here is { userId: number; postId?: string | undefined; }.
// If userId is absent/invalid, an error will be thrown.
const { userId, postId } = useTypedParams(root.user.post);
```

Get typed search params with `useTypedSearchParams()`:

```tsx
import { useTypedSearchParams } from "react-router-typesafe-routes/dom"; // Or /native
import { root } from "./path/to/routes";

// The type here is { utm_campaign: string }.
// If utm_campaign is absent/invalid, the default value will be used ("default_campaign").
const [{ utm_campaign }, setTypedSearchParams] = useTypedSearchParams(root.user.post);
```

Get typed hash with `useTypedHash()`:

```tsx
import { useTypedHash } from "react-router-typesafe-routes/dom"; // Or /native
import { root } from "./path/to/routes";

// The type here is "info" | "comments" | undefined.
// If hash is absent/invalid, 'undefined' is used instead.
const hash = useTypedHash(root.user.post);
```

Get typed state with `useTypedState()`:

```tsx
import { useTypedState } from "react-router-typesafe-routes/dom"; // Or /native
import { root } from "./path/to/routes";

// The type here is { fromUserList: boolean | undefined }.
// If fromUserList is absent/invalid, 'undefined' is used instead.
const { fromUserList } = useTypedState(root.user.post);
```

## Advanced examples

### Define arrays

<details>
  <summary>Click to expand</summary>

```tsx
import { route, union, number } from "react-router-typesafe-routes/dom"; // Or /native

const myRoute = route({
  searchParams: {
    // Every built-in type can be made an array. Arrays can only be used in search and state.
    // Upon parsing, 'undefined' values are omitted, and absent/invalid array is normalized to [].
    selectedIds: number().array(),
    // In niche cases we might want to use '.default()' or '.defined()' for items.
    // '.defined()' means that an invalid item makes the whole array invalid.
    selectedItems: number().default(-1).array(),
  },
});
```

</details>

### Share types between routes

<details>
  <summary>Click to expand</summary>

```tsx
// Pathless routes can be used for type sharing.
const fragments = {
  id: route({
    params: { id: number() },
  }),
  query: route({
    searchParams: { query: string() },
  }),
};

// Pathless routes can also be used anywhere in the route tree.
const root = route({
  // You can specify types directly.
  searchParams: { utm_campaign: string() },
  // Or reuse existing pathless routes.
  compose: [fragments.id],
  children: {
    user: route({ path: "user/:id", compose: [fragments.query] }),
    post: route({ path: "post/:id" }),
    // Pathname types are ignored if there are no corresponding params in the pattern.
    about: route({ path: "about" }),
  },
});

// You can then build helpers that are reusable between routes:
const { id } = useTypedParams(fragments.id);
const [{ query }] = useTypedSearchParams(fragments.query);
const [{ utm_campaign }] = useTypedSearchParams(root);
```

</details>

### Inherit hash values

<details>
  <summary>Click to expand</summary>

```tsx
import { route, string } from "react-router-typesafe-routes/dom"; // Or /native

// Child types for params with the same name take precedence. Since hash, unlike other route parts,
// is a param itself, it can't normally inherit parent types. To solve this, there is a
// hash-specific way of specifying values as an array of strings instead of a type.
const myRoute = route({
  path: "user",
  // This route hash is just "info"
  hash: ["info"],
  children: {
    details: route({
      path: "details",
      // This route hash is "info" | "address"
      hash: ["address"],
      children: {
        misc: route({
          path: "misc",
          // This route hash is simply string. Hash arrays in its children will be ignored, and
          // types should be used with caution, because they will override the parent one.
          // Generally, every route chain should only have one type for hash which is terminating.
          hash: string(),
        }),
      },
    }),
  },
});
```

</details>

### Type non-object states

<details>
  <summary>Click to expand</summary>

```tsx
import { route, string } from "react-router-typesafe-routes/dom"; // Or /native

// State can be typed as a whole, in which case it becomes a single param like hash.
// Similar to hash, child routes can't type separate state fields, and types for the whole state
// will override the parent one.
const myRoute = route({
  path: "user",
  state: string(),
});
```

> ❗If you're building from scratch, it's almost certainly a bad idea to use this API. However, it might come in handy if you're typing an existing system where it's not easy to get rid of non-object states.

</details>

### Add custom validation

<details>
  <summary>Click to expand</summary>

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

const myRoute = route({
  path: ":id",
  // string() only accepts validators that return strings.
  params: { id: string(regExp(/\d+/)) },
  // number() only accepts validators that return numbers.
  searchParams: { page: number(integer) },
});
```

</details>

### Use Zod

<details>
  <summary>Click to expand</summary>

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { zod } from "react-router-typesafe-routes/zod";
import { z } from "zod";

const myRoute = route({
  path: ":id",
  // Wrapping quotes in serialized values are omitted where possible.
  params: { id: zod(z.string().uuid()) },
});
```

> ❗Zod doesn't do coercion by default, but you may need it for complex values returned from `JSON.parse` (for instance, a date wrapped in an object).

</details>

### Use Yup

<details>
  <summary>Click to expand</summary>

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { yup } from "react-router-typesafe-routes/yup";
import { string } from "yup";

const ROUTE = route({
  path: ":id",
  // Wrapping quotes in serialized values are omitted where possible.
  params: { id: yup(string().uuid()) },
});
```

</details>

### Integrate third-party validation library

<details>
  <summary>Click to expand</summary>

```tsx
import { type, parser, Type, ParserHint } from "react-router-typesafe-routes/dom"; // Or /native
// Schema is a library-specific interface.
import { v, Schema } from "third-party-library";

function valid<T>(schema: Schema<T>): Type<T> {
  return type(
    // We use library-specific validation logic.
    (value: unknown) => schema.validate(value),
    // We can optionally provide a parser.
    // Built-in parser is used to remove wrapping quotes where possible.
    // We could also supply a custom parser.
    parser(getTypeHint(schema)),
  );
}

function getTypeHint(schema: Schema): ParserHint {
  // We determine if the schema type is assignable to 'string' or 'date'.
  // If so, we return the corresponding hint, and 'unknown' otherwise.
  // The type can also be optional, e.g. 'string | undefined' should use 'string' hint.
  return schema.type;
}

const myRoute = route({
  path: ":id",
  params: { id: valid(v.string().uuid()) },
});
```

</details>

### Construct type objects manually to cover obscure use cases

<details>
  <summary>Click to expand</summary>

```tsx
import { route, PathnameType } from "react-router-typesafe-routes/dom"; // Or /native

// This type accepts 'string | number | boolean' and returns 'string'.
// We only implement ParamType interface, so this type can only be used for path params.
// For other params, we would need to implement SearchParamType and StateParamType.
const looseString: PathnameType<string, string | number | boolean> = {
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

const myRoute = route({
  path: ":id",
  params: { id: looseString },
});
```

</details>

## Concepts

### Nesting

#### Library routes

Any route can be a child of another route. Child routes inherit everything from their parent.

Most of the time, it's easier to simply inline child routes:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native

const user = route({ path: "user/:id", children: { details: route("details") } });

console.log(user.path); // "/user/:id"
console.log(user.details.path); // "/user/:id/details"
```

They can also be uninlined, most likely for usage in multiple places:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native

const details = route("details");

const user = route("user/:id", {}, { details });
const post = route("post/:id", {}, { details });

console.log(user.details.path); // "/user/:id/details"
console.log(post.details.path); // "/post/:id/details"
console.log(details.path); // "/details"
```

To reiterate, `details` and `user.details` are separate routes, which will usually behave differently. `details` doesn't know anything about `user`, but `user.details` does. `details` is a standalone route, but `user.details` is a child of `user`.

> ❗Child routes can't start with `$` to prevent overlapping with route API.

#### Using library routes in React Router `<Route />` components

Routes structure _usually_ corresponds to the structure of `<Route />` components:

```tsx
import { Route, Routes } from "react-router-dom"; // Or -native

<Routes>
  {/* '/user/:id' */}
  <Route path={user.path} element={<User />}>
    {/* '/user/:id/details' */}
    <Route path={user.details.path} element={<UserDetails />} />
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
  <Route path={user.relativePath} element={<User />}>
    {/* 'details' */}
    <Route path={user.$.details.relativePath} element={<UserDetails />} />
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

const user = route({ path: "user/:id/*", children: { details: route("details") } });

<Routes>
  {/* '/user/:id/*' */}
  <Route path={user.path} element={<User />} />
</Routes>;

// Somewhere inside <User />
<Routes>
  {/* '/details' */}
  <Route path={user.$.details.path} element={<UserDetails />} />
</Routes>;
```

> ❗ Star doesn't prevent subsequent routes from being rendered as direct children.

> ❗At the time of writing, there are [some issues](https://github.com/remix-run/react-router/issues/9929) with nested `<Routes />` if dynamic segments are used.

### Typing

#### Type objects

Path params, search params, hash, and state (separate fields or state as a whole) serializing, parsing, validation, and typing are done via type objects. Validation is done during parsing.

```typescript
// Can be used for pathname params
interface PathnameType<TOut, TIn = TOut> {
  getPlainParam: (originalValue: Exclude<TIn, undefined>) => string;
  getTypedParam: (plainValue: string | undefined) => TOut;
}

// Can be used for search params
interface SearchType<TOut, TIn = TOut> {
  getPlainSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
  getTypedSearchParam: (plainValue: string[]) => TOut;
}

// Can be used for state fields or the whole state
interface StateType<TOut, TIn = TOut> {
  getPlainState: (originalValue: Exclude<TIn, undefined>) => unknown;
  getTypedState: (plainValue: unknown) => TOut;
}

// Can be used for hash
interface HashType<TOut, TIn = TOut> {
  getPlainHash: (originalValue: Exclude<TIn, undefined>) => string;
  getTypedHash: (plainValue: string) => TOut;
}
```

> ❗ It's guaranteed that `undefined` will never be passed as `originalValue`.

These interfaces allow to express pretty much anything, though normally you should use the built-in helpers for constructing these objects. Manual construction should only be used if you're hitting some limitations.

#### Type helpers

To make type objects construction and usage easier, we impose a set of reasonable restrictions / design choices:

- `TIn` and `TOut` are the same, for all params.
- Type objects for arrays are constructed based on helpers for individual values. Array params can never be parsed/validated into `undefined`.
- By default, parsing/validation errors result in `undefined`. We can also opt in to returning a default value or throwing an error in case of an absent/invalid param.
- State is only validated and not transformed in any way.
- Type objects for individual values can be used for any param. Type objects for arrays can only be used for search params and state fields.

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

The library provides `parser()` helper for accessing the built-in parser. It can accept an optional type hint. By default, it simply behaves as `JSON`. It also has a special behavior for strings and dates, where it omits wrapping quotes in such serialized values.

##### `Validator`

Validator is simply a function for validating values:

```typescript
interface Validator<T, TPrev = unknown> {
  (value: TPrev): T | undefined;
}
```

It returns a valid value or throws (or returns `undefined`) if that's impossible. It can transform values to make them valid.

The important thing is that it has to handle both the original value and whatever the corresponding parser returns.

##### Generic helper

The `type()` helper is used for creating all kinds of type objects. The resulting param type is inferred from the given validator.

```typescript
import { type, parser, Validator } from "react-router-typesafe-routes/dom"; // Or /native

const positiveNumber: Validator<number> = (value: unknown): number => {
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Expected positive number");
  }

  return value;
};

// The following types are equivalent (we use JSON as a parser).
// We could also supply a custom parser.
type(positiveNumber, parser("unknown"));
type(positiveNumber, parser());
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
// Upon parsing all variants will give 'number[]'.

// Absent/invalid values will be omitted.
type(positiveNumber).array();

// Absent/invalid values will be replaced with '-1'.
type(positiveNumber).default(-1).array();

// Absent/invalid values will lead to an error.
type(positiveNumber).defined().array();
```

Arrays can only be used in search params and state fields, because there is no standard way to store arrays in path params or hash. For state, if a value is not an array, it's parsed as an empty array.

##### Type-specific helpers

Most of the time, you should use type-specific helpers: `string()`, `number()`, `boolean()`, or `date()`. They are built on top of `type()` and have the corresponding parsers and type checks built-in.

For instance:

```typescript
import { number, Validator } from "react-router-typesafe-routes/dom"; // Or /native

const positive: Validator<number, number> = (value: number): number => {
  if (value <= 0) {
    throw new Error("Expected positive number");
  }

  return value;
};

number(positive);
```

##### Third-party validation libraries

You can use Zod and Yup out-of-box, and you should be able to integrate any third-party validation library via the `type()` helper. See [Advanced examples](#advanced-examples).

Gotchas:

- It doesn't matter if a validator can accept or return `undefined` or not - it will be normalized by `type()` anyway.
- A validator can receive `undefined`, which means that it can define its own default value, for example.

#### Pathname params

Pathname params are inferred from the provided path pattern and can be overridden (partially or completely) with pathname type objects.

Just as usual segments, dynamic segments (pathname params) can be made optional by adding a `?` to the end. This also applies to star (`*`) segments.

Inferred params will implicitly use `string().defined()` and `string()` for required and optional params respectively.

```tsx
import { route, number } from "react-router-typesafe-routes/dom"; // Or /native

// Here, id is overridden to be a number, and subId and optionalId are strings
const myRoute = route({
  path: "route/:id/:subId/:optionalId?",
  params: { id: number() },
});
```

Upon building, pathname params are required or optional based on the `?` modifier, except for the star parameter (`*`), which is always optional upon building.

Parsing behavior is determined by the type objects. Note that React Router parses star parameter (`*`) as an empty string if there are no segments to match.

> ❗ You most likely will never need it, but it's technically possible to provide a type object for the star parameter as well.

#### Search params

Search params are determined by the provided search type objects.

```tsx
import { route, string } from "react-router-typesafe-routes/dom"; // Or /native

// Here, we define a search parameter 'filter' of 'string' type
const myRoute = route({ path: "route", searchParams: { filter: string() } });
```

Upon building, all search parameters are optional. Parsing behavior is determined by the type objects.

#### Hash

Hash is determined by the provided hash type object. It's also possible to provide an array of possible `string` values if you want to inherit parent values.

```tsx
import { route, string, union } from "react-router-typesafe-routes/dom"; // Or /native

const routeWithAnyHash = route({ path: "route", hash: string() });

const routeWithRestrictedHash = route({ path: "route", hash: union("about", "more") });

const routeWithInheritableValues = route({
  path: "route",
  hash: ["about", "more"],
});
```

Upon building, hash is optional. Parsing behavior is determined by the type object. In the case of an array of possible values, an absent/invalid value will result in `undefined`.

#### State fields

State fields are determined by the provided state type objects. It's also possible to use a type object to define the whole state.

```tsx
import { route, boolean, string } from "react-router-typesafe-routes/dom"; // Or /native

// Here, we define a state field 'fromList' of 'boolean' type
const myRoute = route({ path: "route", state: { fromList: boolean() } });

// Here, we define the whole state as 'string'
const myOtherRoute = route({ path: "route", state: string() });
```

Upon building, all state fields (and the whole state) are optional. Parsing behavior is determined by the type objects.

#### Types inheritance

Child routes inherit all type objects from their parent. For parameters with the same name, child type objects take precedence.

Hash values can be inherited only if they are defined as an array of strings.

Child routes under `$` don't inherit parent type objects for path params.

#### Types composition

Pathless routes can be composed to other routes to share types. Please refer to [Advanced examples: Share types between routes](#share-types-between-routes).

Multiple routes can be composed. For parameters with the same name, the rightmost route takes precedence.

#### Types priority

When there are multiple types for the same param, they are resolved as follows, from the lowest priority to the highest:

- Implicit pathname types
- Inherited types
- Composed types
- Explicit types

If hash type is defined as an array of strings and a hash type at the same time, the hash type always wins regardless of the rules above.

If state type is defined as a set of its fields' types and a whole state type at the same time, the whole state type always wins regardless of the rules above.

> ❗ Parameters with the same name are discouraged.

## API

### `route()`

A route is defined via the `route()` helper. All its options are optional.

```tsx
import { route, string, number, boolean } from "react-router-typesafe-routes/dom"; // Or /native

const myFragment = route({ searchParams: { myFragmentParam: string() } });

const myRoute = route({
  path: "my/path",
  compose: [myFragment],
  params: { myPathnameParam: string() },
  searchParams: { mySearchParam: number() },
  hash: union("my-hash", "my-other-hash"),
  state: { myStateParam: boolean() },
  children: { myChildRoute: route({ path: "child" }) },
});
```

The `path` option is a path pattern that you would put to the `path` property of a `<Route/>`, but without leading or trailing slashes (`/`). More specifically, it can:

- be a simple segment or a group of segments (`'user'`, `'user/details'`).
- have any number of dynamic segments (params) anywhere (`':id/user'`, `'user/:id/more'`).
- **end** with a star segment (`'user/:id/*'`, `'*'`)
- have any number of optional segments (`user?/:id?/*?`)
- be an empty string (`''`).

Unspecified (or `undefined`) `path` means that the route is pathless. Pathless routes are intended for types sharing.

The `compose` option is an array of pathless routes whose types are composed into the route. See [Typing: Types composition](#types-composition).

The `params`, `searchParams`, `hash`, and `state` options specify type objects (and possibly hash values) of the route. See [Typing](#typing).

The `children` option specifies child routes of the route. See [Nesting](#nesting).

The `route()` helper returns a route object, which has the following fields:

- `$path` and `$relativePath`, where `$path` contains a combined path pattern with a leading slash (`/`), and `$relativePath` contains a combined path pattern **without intermediate stars (`*`)** and a leading slash (`/`). They can be passed to e.g. the `path` prop of React Router `<Route/>`.
  > ❗ At the time of writing, patterns with optional segments [can't](https://github.com/remix-run/react-router/discussions/9862) be used in `matchPath`/`useMatch`.
- `$buildPath()` for building parametrized URL paths (pathname + search + hash) which can be passed to e.g. the `to` prop of React Router `<Link />`.
- `$buildState()` for building typed states, which can be passed to e.g. the `state` prop of React Router `<Link />`.
- `$buildPathname()`, `$buildSearch()`, and `$buildHash()` for building parametrized URL parts. They can be used (in conjunction with `$buildState()`) to e.g. build a parametrized `Location` object.
- `$getTypedParams()`, `$getTypedSearchParams()`, `$getTypedHash()`, and `$getTypedState()` for retrieving typed params from React Router primitives. Untyped params are omitted.
- `$getUntypedParams()`, `$getUntypedSearchParams()`, and `$getUntypedState()` for retrieving untyped params from React Router primitives. Typed params are omitted. Note that the hash is always typed, as well as the state when it's typed as a whole.
- `$getPlainParams()` and `$getPlainSearchParams()` for building React Router primitives from typed params. Note how hash and state don't need these functions because `$buildHash()` and `$buildState()` can be used instead.
- `$options`, which contains resolved type objects (and possibly hash values) of the route, as well as its `path` option.
- `$`, which contains child routes that lack the parent path pattern and the corresponding type objects.
- Any number of child routes (that can't start with a `$`).

### `parser()`

The built-in parser is exposed as `parser()`. It should only be used for creating custom wrappers around `type()`.

It accepts the following type hints:

- `'unknown'` - the value is processed by `JSON`. This is the default.
- `'string'` - the value is not transformed in any way.
- `'date'` - the value is transformed to an ISO string.

### `type()`

All type helpers are wrappers around `type()`. It's primarily exposed for integrating third-party validation libraries, but it can also be used directly, if needed.

See [Typing: Type helpers](#type-helpers).

There are built-in helpers for common types:

- `string()`, `number()`, `boolean()`, `date()` - simple wrappers around `type()`, embed the corresponding parsers and type checks. Can accept validators that expect the corresponding types as an input.
- `union()` - a wrapper around `type()` that describes unions of `string`, `number`, or `boolean` values. Can accept a readonly array or individual values.

There are also built-in helpers for third-party validation libraries:

- `zod()` - a wrapper around `type()` for creating type objects based on Zod Types. Uses a separate entry point: `react-router-typesafe-routes/zod`.
- `yup()` - a wrapper around `type()` for creating type objects based on Yup Schemas. Uses a separate entry point: `react-router-typesafe-routes/yup`.

All of them use the built-in parser with auto-detected hint.

All built-in helpers catch parsing and validation errors and replace them with `undefined`. This behavior can be altered with the following modifiers:

- `.default()` - accepts a default value that is used instead of an absent/invalid param;
- `.defined()` - specifies that an error is thrown in case of an absent/invalid param. For invalid params, the original error is used.

### Hooks

All hooks are designed in such a way that they can be reimplemented in the userland. If something isn't working for you, you can get yourself unstuck by creating custom hooks.

Of course, you can still use React Router hooks as you see fit.

#### `useTypedParams()`

The `useTypedParams()` hook is a thin wrapper around React Router `useParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

#### `useTypedSearchParams()`

The `useTypedSearchParams()` hook is a (somewhat) thin wrapper around React Router `useSearchParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

The only notable difference is that `setTypedSearchParams()` has an additional `untypedSearchParams` option. If `true`, existing untyped (by the given route) search parameters will remain intact. Note that this option does not affect the `state` option. That is, there is no way to preserve untyped state fields.

The reason for this is that `useTypedSearchParams()` is intended to be a simple wrapper around `useSearchParams()`, and the latter doesn't provide any access to the current state. If [this proposal](https://github.com/remix-run/react-router/discussions/9950) goes through, it would be very easy to implement, but for now, the only way to achieve this is to create a custom hook.

#### `useTypedHash()`

The `useTypedHash()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed hash.

#### `useTypedState()`

The `useTypedState()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed state.
