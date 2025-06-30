# React Router Typesafe Routes 🍣

Enhanced type safety via validation for all route params in React Router v7.

[![NPM Version](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)
[![NPM Downloads](https://img.shields.io/npm/dw/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

The library provides type safety for all route params (pathname params, search params (including multiple keys), state, and hash) on building and parsing/validating URL parts and state. There are no unsafe type casts whatsoever.

If you want, you can use a validation library. There is first-party support for [Standard Schema](https://github.com/standard-schema/standard-schema), [Zod (v3)](https://github.com/colinhacks/zod), and [Yup](https://github.com/jquense/yup), and other libraries can be integrated with ease. Otherwise, you can use other built-in types and fine-tune their validation instead.

In built-in types, parsing and validation errors are caught and replaced with `undefined`. You can also return a default value or throw an error in case of an absent or invalid param. All these adjustments reflect in types, too!

Built-in types allow to customize stringification and parsing as well. If you need more control, you can build completely custom types, which means that params serialization and deserialization are fully customizable.

The library doesn't restrict or alter React Router API in any way, including nested routes and relative links. It can also be gradually adopted.

## Installation

```
yarn add react-router-typesafe-routes
```

Note that `react-router` and `react` are peer dependencies.

There are optional entry points for types based on third-party validation libraries:

- `react-router-typesafe-routes/standard-schema` exports `schema` type that accepts any Standard Schema;
- `react-router-typesafe-routes/zod` exports `zod` type (for Zod v3 only), `zod` is a peer dependency;
- `react-router-typesafe-routes/yup` exports `yup` type, `yup` is a peer dependency;

The library is targeting ES6 (ES2015).

The minimal required version of TypeScript is `5.0`, and `strict` mode must be enabled.

## Limitations & Caveats

- React Router only considers pathnames during route matching, so search params, hash, and state are always optional upon URL or state building.
- For convenience, absent and invalid params are considered virtually the same by built-in types. However, you retain full control with custom types.
- To emphasize that route relativity is governed by the library, leading slashes in path patterns are forbidden. Trailing slashes are also forbidden due to being purely cosmetic.

## How is it different from existing solutions?

| Feature                                           | react-router-typesafe-routes | [typesafe-routes](https://github.com/kruschid/typesafe-routes) | [typed-react-router](https://github.com/bram209/typed-react-router) | [typesafe-router](https://github.com/jamesopstad/typesafe-router) |
| ------------------------------------------------- | ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Type-safe pathname params                         | ✅                           | ✅                                                             | ✅                                                                  | ✅                                                                |
| Type-safe search params                           | ✅                           | ✅                                                             | 🚫                                                                  | 🚫                                                                |
| Multiple identical keys in search params          | ✅                           | 🚫️                                                            | 🚫                                                                  | ✅                                                                |
| Type-safe hash                                    | ✅                           | 🚫                                                             | 🚫                                                                  | 🚫                                                                |
| Type-safe state                                   | ✅                           | 🚫                                                             | 🚫                                                                  | 🚫                                                                |
| Customizable serialization / parsing / validation | ✅                           | ✅                                                             | 🚫                                                                  | 🚫                                                                |
| Customizable built-in types                       | ✅                           | 🚫                                                             | 🚫                                                                  | 🚫                                                                |
| Nested routes                                     | ✅                           | ✅                                                             | ✅                                                                  | ✅                                                                |
| Relative links                                    | ✅                           | ✅                                                             | 🚫                                                                  | ✅                                                                |
| Type-safe actions/loaders                         | 🚫                           | 🚫                                                             | 🚫                                                                  | ✅                                                                |

> Type-safe actions/loaders should be fairly easy to implement, but it's a low-priority task. Please open an issue if you need them.

Other libraries that I was able to find are outdated and not really suitable for React Router v7:

- [typesafe-react-router](https://github.com/AveroLLC/typesafe-react-router)
- [react-typesafe-routes](https://github.com/innFactory/react-typesafe-routes)

You might also want to use some other router with built-in type safety:

- [TanStack Router](https://github.com/tanstack/router)
- [Type Route](https://github.com/zilch/type-route)
- [Chicane](https://github.com/swan-io/chicane)

## Quick usage example

Define library routes:

```tsx
import { route, string, number, boolean, union } from "react-router-typesafe-routes";

// Start with a pathless route to specify global params.
const root = route({
  // This global search param has a default value that is used as a fallback upon parsing.
  searchParams: { utm_campaign: string().default("default_campaign") },
  // Child routes inherit all parent params.
  children: {
    user: route({
      // Pathname params are inferred and can be overridden partially or completely.
      // Required params implicitly use 'string().defined()' that can throw upon parsing.
      path: "user/:userId",
      // Without modifiers, 'undefined' can be returned upon parsing.
      params: { userId: number() },
      // Specify hash. To allow any hash, define it as 'string()'.
      hash: union(["info", "comments"]),
      // Specify state parts.
      state: { fromUserList: boolean() },
      // Child routes inherit all parent params.
      children: {
        // Optional pathname params implicitly use 'string()'.
        post: route({ path: "post/:postId?" }),
      },
    }),
  },
});
```

Define React Router routes:

> [!NOTE]  
> We will use the JSX style of defining routes throughout the documentation, but you can easily define them in any way that React Router enables. See [Framework Routing](https://reactrouter.com/start/framework/routing) and [Library Routing](https://reactrouter.com/start/library/routing) for more information. Note that at the time of writing there are [some issues](https://github.com/remix-run/react-router/issues/12359) with types generation when absolute paths are used.

```tsx
import { Route, Routes } from "react-router";
import { root } from "./path/to/routes";

// Absolute paths
<Routes>
  {/* /user/:userId */}
  <Route path={root.user.$path()} element={<User />}>
    {/* /user/:userId/post/:postId? */}
    <Route path={root.user.post.$path()} element={<Post />} />
  </Route>
</Routes>;

// Relative paths
<Routes>
  {/* user/:userId */}
  <Route path={root.user.$path({ relative: true })} element={<User />}>
    {/* post/:postId? */}
    {/* $ effectively defines path pattern start. */}
    <Route path={root.user.$.post.$path({ relative: true })} element={<Post />} />
  </Route>
</Routes>;
```

Use `Link` components as usual:

```tsx
import { Link } from "react-router";
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

Get typed params:

```tsx
import {
  useTypedParams,
  useTypedSearchParams,
  useTypedHash,
  useTypedState,
} from "react-router-typesafe-routes";
import { root } from "./path/to/routes";

// { userId?: number; postId?: string; }
// Uses root.user.post.$deserializeParams internally.
const { userId, postId } = useTypedParams(root.user.post);

// { utm_campaign: string }.
// Uses root.user.post.$deserializeSearchParams internally.
const [{ utm_campaign }, setTypedSearchParams] = useTypedSearchParams(root.user.post);

// "info" | "comments" | undefined.
// Uses root.user.post.$deserializeHash internally.
const hash = useTypedHash(root.user.post);

// { fromUserList?: boolean }.
// Uses root.user.post.$deserializeState internally.
const { fromUserList } = useTypedState(root.user.post);
```

## Advanced examples

### Preserve unrelated search params

<details>
<summary>Click to expand</summary>

```tsx
import { route, string, number, useTypedSearchParams } from "react-router-typesafe-routes";
import { useSearchParams } from "react-router";

// Pathless route is used for simplicity, this works with any route
export const searchParamsFragment = route({
  searchParams: {
    search: string(),
    page: number(),
  },
});

// In a component body
const [typedSearchParams, setTypedSearchParams] = useTypedSearchParams(searchParamsFragment);
const rawSearchParams = useSearchParams();

// In JSX
<Link
  to={searchParamsFragment.$buildSearch({
    searchParams: {
      // Destructure existing params to preserve params typed by the route
      ...typedSearchParams,
      page: 1,
    },
    // Pass raw search params to preserve params NOT typed by the route
    untypedSearchParams: rawSearchParams,
  })}
>
  Click
</Link>;

// In an event handler
setTypedSearchParams(
  (prevParams) => ({
    // Destructure existing params to preserve params typed by the route
    ...prevParams,
    page: 1,
  }),
  {
    // Set this flag to preserve params NOT typed by the route
    untypedSearchParams: true,
  },
);
```

</details>

### Define arrays

<details>
  <summary>Click to expand</summary>

```tsx
import { route, number } from "react-router-typesafe-routes";

const myRoute = route({
  searchParams: {
    // Every built-in type can be made an array. Arrays can only be used in search and state.
    // Upon parsing, 'undefined' values are omitted. Absent/invalid array is normalized to [].
    selectedIds: number().array(),
    // In niche cases you might want to use '.default()' or '.defined()' for items.
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
import { route, useTypedParams, useTypedSearchParams } from "react-router-typesafe-routes";

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

### Extend hash values

<details>
  <summary>Click to expand</summary>

```tsx
import { route, string } from "react-router-typesafe-routes";

// Hash can only be extended by child routes if it's specified as an array of strings.
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
          // A type overwrites parent hash completely, and subsequent arrays are ignored.
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
import { route, string } from "react-router-typesafe-routes";

// A type overwrites parent state completely, and subsequest state objects are ignored.
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
import { route, string, number } from "react-router-typesafe-routes";

// You don't need to check that this value is a number.
const integer = (value: number) => {
  if (!Number.isInteger(value)) {
    throw new Error(`Expected ${value} to be integer.`);
  }

  return value;
};

// You can construct validators via factories.
const regExp = (regExp: RegExp) => (value: string) => {
  if (value.match(regExp)?.[0] !== value) {
    throw new Error(`"${value}" does not match ${String(regExp)}`);
  }

  return value;
};

const myRoute = route({
  path: ":id",
  // 'string()' only accepts validators that return strings.
  params: { id: string(regExp(/\d+/)) },
  // 'number()' only accepts validators that return numbers.
  searchParams: { page: number(integer) },
});
```

</details>

### Use Standard Schema

<details>
  <summary>Click to expand</summary>

```tsx
import { route, parser } from "react-router-typesafe-routes";
import { schema } from "react-router-typesafe-routes/standard-schema";
import { z } from "zod/v4"; // Zod v4 implements Standard Schema

const myRoute = route({
  path: ":id",
  // There is no way to get the type hint from a Standard Schema in runtime, so we need to specify it explicitly.
  // For the built-in parser, this is only necessary for strings and dates. It's also type-safe!
  // It's needed for omitting wrapping quotes in serialized values.
  params: { id: schema(z.string().uuid(), parser("string")) },
});
```

> ❗Zod doesn't do coercion by default, but you may need it for complex values returned from `JSON.parse` (for instance, a date wrapped in an object).

</details>

### Use Zod v3

<details>
  <summary>Click to expand</summary>

```tsx
import { route } from "react-router-typesafe-routes";
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
import { route } from "react-router-typesafe-routes";
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
import { type, parser, Type, ParserHint } from "react-router-typesafe-routes";
// Some abstract third-party library.
import { v, Schema } from "third-party-library";

function valid<T>(schema: Schema<T>): Type<T> {
  return type(
    // Library-specific validation logic.
    (value: unknown) => schema.validate(value),
    // You could also supply a custom parser.
    parser(getTypeHint(schema)),
  );
}

function getTypeHint(schema: Schema): ParserHint {
  // Type hint is determined based on the schema type, excluding 'undefined'.
  return schema.type;
}

const myRoute = route({
  path: ":id",
  params: { id: valid(v.string().uuid()) },
});
```

</details>

### Create a custom parser

<details>
  <summary>Click to expand</summary>

```tsx
import { Parser, ParserHint, ParserType } from "react-router-typesafe-routes";

// Extend built-in 'ParserHint' if needed.
type CustomParserHint = ParserHint | "entity";

// If 'ParserHint' is extended, you need to extend 'ParserType' as well.
type CustomParserType<T extends CustomParserHint> = T extends "entity"
  ? { id: number }
  : ParserType<Exclude<T, "entity">>;

// This factory can be used in place of built-in 'parser()'
function customParser<T extends CustomParserHint>(
  defaultHint?: T,
): Parser<CustomParserType<T>, CustomParserHint> {
  return {
    stringify(value, { hint, kind }) {
      const resolvedHint = hint ?? defaultHint;

      // Customize serialization based on 'resolvedHint' and 'kind'.

      return JSON.stringify(value);
    },
    parse(value, { hint, kind }) {
      const resolvedHint = hint ?? defaultHint;

      // Customize parsing based on 'resolvedHint' and 'kind'.

      return JSON.parse(value) as unknown;
    },
  };
}
```

</details>

### Construct type objects manually to cover obscure use cases

<details>
  <summary>Click to expand</summary>

```tsx
import { route, PathnameType } from "react-router-typesafe-routes";

// This type accepts 'string | number | boolean' and returns 'string'.
// It only implements 'PathnameType', so it can only be used for pathname params.
// Implement 'SearchType', 'HashType', and 'StateType' to cover other cases.
const looseString: PathnameType<string, string | number | boolean> = {
  serializeParam(value) {
    // It's always guaranteed that value is not 'undefined' here.
    return String(value);
  },
  deserializeParam(value) {
    // You could treat 'undefined' in a special way to distinguish absent and invalid params.
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
import { route } from "react-router-typesafe-routes";

const user = route({ path: "user/:id", children: { details: route({ path: "details" }) } });

console.log(user.$path()); // "/user/:id"
console.log(user.details.$path()); // "/user/:id/details"
```

They can also be uninlined, most likely for usage in multiple places:

```tsx
import { route } from "react-router-typesafe-routes";

const details = route({ path: "details" });

const user = route({ path: "user/:id", children: { details } });
const post = route({ path: "post/:id", children: { details } });

console.log(user.details.$path()); // "/user/:id/details"
console.log(post.details.$path()); // "/post/:id/details"
console.log(details.$path()); // "/details"
```

To reiterate, `details` and `user.details` are separate routes, which will usually behave differently. `details` doesn't know anything about `user`, but `user.details` does. `details` is a standalone route, but `user.details` is a child of `user`.

> [!WARNING]  
> Child routes can't start with `$` to prevent overlapping with route API.

#### Using library routes in React Router routes

Routes structure _usually_ corresponds to the structure of `<Route />` components:

```tsx
import { Route, Routes } from "react-router-dom";

<Routes>
  {/* '/user/:id' */}
  <Route path={user.$path()} element={<User />}>
    {/* '/user/:id/details' */}
    <Route path={user.details.$path()} element={<UserDetails />} />
  </Route>
</Routes>;
```

> [!NOTE]  
> As a reminder, you have to render an `<Outlet />` in the parent component.

However, nothing stops you from specifying additional routes as you see fit.

Note that we're using `path()` here, which returns an absolute path pattern by default. React Router allows absolute child route paths if they match the parent path.

You're encouraged to use absolute path patterns whenever possible because they are easier to reason about.

> [!WARNING]  
> At the time of writing, there are [quirks](https://github.com/remix-run/react-router/issues/9925) with optional path segments that may force the use of relative path patterns.

Relative paths can be used like this:

```tsx
import { Route, Routes } from "react-router-dom";

<Routes>
  {/* 'user/:id' */}
  <Route path={user.$path({ relative: true })} element={<User />}>
    {/* 'details' */}
    <Route path={user.$.details.$path({ relative: true })} element={<UserDetails />} />
  </Route>
</Routes>;
```

That is, the `$` property of every route contains child routes that lack parent path pattern. The mental model here is that `$` defines the path pattern start.

`$path()` is a combined path with a leading slash (`/`), and `$path({ relative: true })` is a combined path **without intermediate stars (`*`)** and without a leading slash (`/`).

#### Nested `<Routes />`

If your `<Route/>` is rendered in a nested `<Routes />`, you have to not only add a `*` to the parent path, but also exclude the parent path from the subsequent paths. This might change if [this proposal](https://github.com/remix-run/react-router/discussions/9841) goes through.

```tsx
import { Route, Routes } from "react-router-dom";
import { route } from "react-router-typesafe-routes";

const user = route({ path: "user/:id/*", children: { details: route({ path: "details" }) } });

<Routes>
  {/* '/user/:id/*' */}
  <Route path={user.$path()} element={<User />} />
</Routes>;

// Somewhere inside <User />
<Routes>
  {/* '/details' */}
  <Route path={user.$.details.$path()} element={<UserDetails />} />
</Routes>;
```

> [!NOTE]  
> Star doesn't prevent subsequent routes from being rendered as direct children.

> [!WARNING]  
> At the time of writing, there are [some issues](https://github.com/remix-run/react-router/issues/9929) with nested `<Routes />` if dynamic segments are used.

### Typing

#### Terminology

Params can undergo the following transformations:

- _Serialization_ - a process of converting a JS value into a string (for URL params) or a serializable format (for state).
- _Deserialization_ - a process of transforming a string (for URL params) or a serializable value (for state) into a more structured format and checking its type and restrictions. For flexibility, this value may be different from the value that was serialized (e.g. `number` can be converted into `string`).

For serializable params, these transformations can be split into the following:

- _Stringification_ - a process of converting a serializable value into a string, the final step of _Serialization_ (for URL params).
- _Parsing_ - the opposite of _Stringification_ and the first step of _Deserialization_ (for URL params). For convenience, it's not required to return exactly the same value that was stringified, because the result of parsing is always validated.
- _Validation_ - a process of checking a value type and restrictions, the final step of _Deserialization_. For convenience, it can change the value to make it valid.

#### Built-in types

Built-in types are only concerned about _stringification_, _parsing_, and _validation_. They use `Parser` and `Validator` for that.

##### `Parser`

Parser is simply a group of functions for transforming a value to `string` and back:

```typescript
interface Parser<T, THint extends string = never> {
  stringify: (value: T, context: ParserContext<THint>) => string;
  // Return value can be different from T in some edge cases. It's always validated anyway.
  parse: (value: string, context: ParserContext<THint>) => unknown;
}

interface ParserContext<THint extends string = never> {
  // This field is used to change the behavior of the parser dynamically.
  hint?: THint;
  // This field isn't used by the library, but you can use it in custom parsers.
  kind: "pathname" | "search" | "hash";
}
```

The library provides the `parser()` helper for accessing the built-in parser. It can accept an optional type hint. By default, it simply behaves as `JSON`. It also has a special behavior for strings and dates, where it omits wrapping quotes in such serialized values.

##### `Validator`

Validator is simply a function for validating values:

```typescript
interface Validator<T, TPrev = unknown> {
  (value: TPrev): T | undefined;
}
```

It returns a valid value or throws (or returns `undefined`) if that's impossible. It can transform values to make them valid.

The important thing is that it has to handle both the original value and whatever the corresponding parser returns.

##### Base helper

The `type()` helper is a built-in type that all other built-in types are based on. The resulting param type is inferred from the given validator.

```typescript
import { type, parser, Validator } from "react-router-typesafe-routes";

const positiveNumber: Validator<number> = (value: unknown): number => {
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Expected positive number");
  }

  return value;
};

// The following types are equivalent (JSON is used as a parser).
// You could also supply a custom parser.
type(positiveNumber, parser("unknown"));
type(positiveNumber, parser());
type(positiveNumber);
```

By default, if deserialization results in `undefined` or throws, `undefined` is returned. This can be changed by the following modifiers:

```typescript
// This will throw an error.
type(positiveNumber).defined();
// This will return the given value.
type(positiveNumber).default(1);
```

The `.defined()`/`.default()` modifiers guarantee that the parsing result is not `undefined`. Default values passed to `.default()` are validated.

You can also make an array:

```typescript
// Deserialization will always return 'number[]'.

// Absent/invalid values will be omitted.
type(positiveNumber).array();

// Absent/invalid values will be replaced with '-1'.
type(positiveNumber).default(-1).array();

// Absent/invalid values will lead to an error.
type(positiveNumber).defined().array();
```

Arrays can only be used in search params and state, because there is no standard way to store arrays in pathname params or hash. For state, if a value is not an array, it's parsed as an empty array.

##### Type-specific helpers

For simple cases, you can use type-specific helpers: `string()`, `number()`, `boolean()`, and `date()`. They are built on top of `type()` and have the corresponding parsers and type checks built-in, at the same time allowing to customize both of them.

There is also somewhat specific `union()` helper that accepts an enum (or an enum-like object) or an array instead of a validator.

##### Third-party validation libraries

If you can, you should use a validation library for all types. You can use Standard Schema, Zod v3, and Yup out of the box via the `schema()`, `zod()`, and `yup()` helpers, and you should be able to integrate any third-party validation library via the `type()` helper. See [Advanced examples](#advanced-examples).

#### Type objects

Under the hood, built-in types create type objects that describe how to serialize and deserialize params:

```typescript
// Can be used for pathname params
interface PathnameType<TOut, TIn = TOut> {
  serializeParam: (originalValue: Exclude<TIn, undefined>) => string;
  deserializeParam: (plainValue: string | undefined) => TOut;
}

// Can be used for search params
interface SearchType<TOut, TIn = TOut> {
  serializeSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
  deserializeSearchParam: (plainValue: string[]) => TOut;
}

// Can be used for hash
interface HashType<TOut, TIn = TOut> {
  serializeHash: (originalValue: Exclude<TIn, undefined>) => string;
  deserializeHash: (plainValue: string) => TOut;
}

// Can be used for state fields or the whole state
interface StateType<TOut, TIn = TOut> {
  serializeState: (originalValue: Exclude<TIn, undefined>) => unknown;
  deserializeState: (plainValue: unknown) => TOut;
}
```

> [!NOTE]  
> It's guaranteed that `undefined` will never be passed as `originalValue`.

There are some limitations in type objects that can be produced by built-in types, for instance:

- `TOut` is basically the same as `TIn` (the only difference is that `undefined` is added to `TOut` as needed).
- Arrays are somewhat limited.
- Errors and `undefined` values can't be distinguished during deserialization.
- Input values must be serializable.

Normally these limitations shouldn't get in your way, but if they do, you can get yourself unstuck by creating type objects manually.

#### Pathname params

Pathname params are inferred from the provided path pattern and can be overridden (partially or completely) with pathname type objects.

Just as usual segments, dynamic segments (pathname params) can be made optional by adding a `?` to the end. This doesn't apply to star (`*`) segments though.

Inferred params will implicitly use `string().defined()` and `string()` for required and optional params respectively.

```tsx
import { route, number } from "react-router-typesafe-routes";

// Here, id is overridden to be a number, and subId and optionalId are strings
const myRoute = route({
  path: "route/:id/:subId/:optionalId?",
  params: { id: number() },
});
```

Upon building, pathname params are required or optional based on the `?` modifier, except for the star parameter (`*`), which is always optional upon building.

Parsing behavior is determined by the type objects. Note that React Router parses star parameter (`*`) as an empty string if there are no segments to match.

> [!NOTE]  
> You most likely will never need it, but it's technically possible to provide a type object for the star parameter as well.

#### Search params

Search params are determined by the provided search type objects.

```tsx
import { route, string } from "react-router-typesafe-routes";

// Here, we define a search parameter 'filter' of 'string' type
const myRoute = route({ path: "route", searchParams: { filter: string() } });
```

Upon building, all search params are optional. Parsing behavior is determined by the type objects.

#### Hash

Hash is determined by the provided hash type object. It's also possible to provide an array of possible `string` values if you want to inherit parent values.

```tsx
import { route, string, union } from "react-router-typesafe-routes";

const routeWithAnyHash = route({ path: "route", hash: string() });

const routeWithRestrictedHash = route({ path: "route", hash: union(["about", "more"]) });

const routeWithInheritableValues = route({
  path: "route",
  hash: ["about", "more"],
});
```

Upon building, hash is optional. Parsing behavior is determined by the type object. In the case of an array of possible values, an absent/invalid value will result in `undefined`.

#### State fields

State fields are determined by the provided state type objects. It's also possible to use a type object to define the whole state.

```tsx
import { route, boolean, string } from "react-router-typesafe-routes";

// Here, we define a state field 'fromList' of 'boolean' type
const myRoute = route({ path: "route", state: { fromList: boolean() } });

// Here, we define the whole state as 'string'
const myOtherRoute = route({ path: "route", state: string() });
```

Upon building, all state fields (and the whole state) are optional. Parsing behavior is determined by the type objects.

#### Types inheritance

Child routes inherit all type objects from their parent. For params with the same name, child type objects take precedence.

Separate hash values can be inherited only if they are defined as an array of strings.

#### Types composition

Pathless routes can be composed to other routes to share types. Please refer to [Advanced examples: Share types between routes](#share-types-between-routes).

Multiple routes can be composed. For params with the same name, the rightmost route takes precedence.

#### Types priority

When there are multiple types for the same param, they are resolved as follows, from the lowest priority to the highest:

- Implicit pathname types
- Inherited types
- Composed types
- Explicit types

If hash type is defined as an array of strings and a hash type at the same time, the hash type always wins regardless of the rules above.

If state type is defined as a set of its fields' types and a whole state type at the same time, the whole state type always wins regardless of the rules above.

> [!WARNING]  
> Params with the same name are discouraged.

## API

### `route()`

A route is defined via the `route()` helper. All its options are optional.

```tsx
import { route, string, number, boolean } from "react-router-typesafe-routes";

const myFragment = route({ searchParams: { myFragmentParam: string() } });

const myRoute = route({
  path: "my/path",
  compose: [myFragment],
  params: { myPathnameParam: string() },
  searchParams: { mySearchParam: number() },
  hash: union(["my-hash", "my-other-hash"]),
  state: { myStateParam: boolean() },
  children: { myChildRoute: route({ path: "child" }) },
});
```

The `path` option is a path pattern that you would put to the `path` property of a `<Route/>`, but without leading or trailing slashes (`/`). More specifically, it can:

- be a simple segment or a group of segments (`'user'`, `'user/details'`).
- have any number of dynamic segments (params) anywhere (`':id/user'`, `'user/:id/more'`).
- **end** with a star segment (`'user/:id/*'`, `'*'`)
- have any number of optional segments (`user?/:id?`)
- be an empty string (`''`).

Unspecified (or `undefined`) `path` means that the route is pathless. Pathless routes are intended for types sharing.

The `compose` option is an array of pathless routes whose types are composed into the route. See [Typing: Types composition](#types-composition).

The `params`, `searchParams`, `hash`, and `state` options specify type objects (and possibly hash values) of the route. See [Typing](#typing).

The `children` option specifies child routes of the route. See [Nesting](#nesting).

The `route()` helper returns a route object, which has the following fields:

- `$path()` that returns an absolute path pattern (by default) or a relative path pattern (if the `relative` option is set to `true`). Absolute path pattern is a combined pattern with a leading slash (`/`), and relative path pattern is a combined pattern **without intermediate stars (`*`)** and a leading slash (`/`). They can be passed to e.g. the `path` prop of React Router `<Route/>`.
- `$buildPath()` for building parametrized URL paths (pathname + search + hash) which can be passed to e.g. the `to` prop of React Router `<Link />`.
- `$buildState()` for building typed states, which can be passed to e.g. the `state` prop of React Router `<Link />`.
- `$buildPathname()`, `$buildSearch()`, and `$buildHash()` for building parametrized URL parts. They can be used (in conjunction with `$buildState()`) to e.g. build a parametrized `Location` object.
- `$deserializeParams()`, `$deserializeSearchParams()`, `$deserializeHash()`, and `$deserializeState()` for retrieving typed params from React Router primitives. Untyped params are omitted.
- `$serializeParams()` and `$serializeSearchParams()` for building React Router primitives from typed params. Note how hash and state don't need these functions because `$buildHash()` and `$buildState()` can be used instead.
- `$spec`, which contains resolved type objects (and possibly hash values) of the route, as well as its `path` option.
- `$`, which contains child routes that lack the parent path pattern.
- Any number of child routes (that can't start with a `$`).

`$buildPath()` and `$buildPathname()` accept the `relative` option for building relative paths.

`$buildPath()`, `$buildSearch()`, and `$serializeSearchParams()` accept a `URLSearchParams` object in the `untypedSearchParams` option for mixing in its untyped params.

`$buildState()` accepts a state object in the `untypedState` option for mixing in its untyped fields.

### `parser()`

The built-in parser is exposed as `parser()`. It should only be used for creating custom wrappers around `type()`.

It accepts the following type hints:

- `'unknown'` - the value is processed by `JSON`. This is the default.
- `'string'` - the value is not transformed in any way.
- `'date'` - the value is transformed to an ISO string.
- `'number'` and `'boolean'`, which behave identically to `'unknown'` and exist only for technical reasons.

### `type()`

All type helpers are wrappers around `type()`. It's primarily exposed for integrating third-party validation libraries, but it can also be used directly, if needed.

See [Typing: Base helper](#base-helper).

There are built-in helpers for common types:

- `string()`, `number()`, `boolean()`, `date()` - simple wrappers around `type()`, embed the corresponding parsers and type checks. Can accept validators that expect the corresponding types as an input and/or custom parsers.
- `union()` - a wrapper around `type()` that describes unions of `string`, `number`, or `boolean` values. Accepts a readonly array or an enum (or an enum-like readonly (`as const`) object). Can accept a custom parser as well.

There are also built-in helpers for third-party validation libraries:

- `schema()` - a wrapper around `type()` for creating type objects based on Standard Schemas. Uses a separate entry point: `react-router-typesafe-routes/standard-schema`.
- `zod()` - a wrapper around `type()` for creating type objects based on Zod v3 Types. Uses a separate entry point: `react-router-typesafe-routes/zod`.
- `yup()` - a wrapper around `type()` for creating type objects based on Yup Schemas. Uses a separate entry point: `react-router-typesafe-routes/yup`.

All of them use the built-in parser with auto-detected hint by default, and all of them allow to supply a custom parser.

All built-in helpers catch parsing and validation errors and replace them with `undefined`. This behavior can be altered with the following modifiers:

- `.default()` - accepts a default value that is used instead of an absent/invalid param;
- `.defined()` - specifies that an error is thrown in case of an absent/invalid param. For invalid params, the original error is used.

### `configure()`

All entry points expose the `configure()` helper that sets a parser for the corresponding type helpers globally. It accepts a parser factory like the built-in `parser()`.

### Useful types

- `Route` is a base type that any route object is assignable to.
- `PathParam` is similar to `PathParam` from React Router, but it allows a slightly more nuanced params extraction.
- `InPathnameParams`, `OutPathnameParams`, `InSearchParams`, `OutSearchParams`, `InState`, `OutState`, `InHash`, and `OutHash` can be used to extract the corresponding params from the route spec (`$spec`).

### Hooks

All hooks are designed in such a way that they can be reimplemented in the userland. If something isn't working for you, you can get yourself unstuck by creating custom hooks.

Of course, you can still use React Router hooks as you see fit.

#### `useTypedParams()`

The `useTypedParams()` hook is a thin wrapper around React Router `useParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

#### `useTypedSearchParams()`

The `useTypedSearchParams()` hook is a (somewhat) thin wrapper around React Router `useSearchParams()`. It accepts a route object as the first parameter, and the rest of the API is basically the same, but everything is properly typed.

The only notable difference is that `setTypedSearchParams()` has an additional `untypedSearchParams` option. If `true`, existing untyped (by the given route) search params will remain intact. Note that this option does not affect the `state` option. That is, there is no way to preserve untyped state fields.

The reason for this is that `useTypedSearchParams()` is intended to be a simple wrapper around `useSearchParams()`, and the latter doesn't provide any access to the current state. If [this proposal](https://github.com/remix-run/react-router/discussions/9950) goes through, it would be very easy to implement, but for now, the only way to achieve this is to create a custom hook.

#### `useTypedHash()`

The `useTypedHash()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed hash.

#### `useTypedState()`

The `useTypedState()` hook is a thin wrapper around React Router `useLocation()`. It accepts a route object as the first parameter and returns a typed state.
