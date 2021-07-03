# React-Router-Typesafe-Routes

Comprehensive type-safe routes for react-router.

[![npm](https://img.shields.io/npm/v/react-router-typesafe-routes)](https://www.npmjs.com/package/react-router-typesafe-routes)

The library provides extensible type safety for path params, query params, and hash on building and parsing URLs.

## Installation

```
yarn add react-router-typesafe-routes
```

Note that the library is using ES6, including ES6 modules.

## Design principles

-   Mess with react-router API as little as possible
-   No unsafe type casts
-   Extensibility to allow better typing and/or validation
-   Completeness: cover every aspect of the URL

## Quick usage example

Route definition may look like this:

```typescript
import { route, path, query, hash, param } from "react-router-typesafe-routes";

const routes = {
    PRODUCT: route(path("/product/:id"), query({ age: param.number.optional }, hash("about", "more"))),
};
```

Use `Route` components as usual:

```typescript jsx
import { Route } from "react-router";
import { routes } from "./path/to/routes";

<Route path={routes.PRODUCT.path} />;
```

Use `Link` components as usual:

```typescript jsx
import { Link } from "react-router-dom";
import { routes } from "./path/to/routes";

// Everything is fully typed!
<Link to={routes.PRODUCT.build({ id: 1 }, { age: 12 }, "about")} />;
```

Parse params with usual hooks:

```typescript jsx
import { useParams, useLocation } from "react-router";
import { routes } from "./path/to/routes";

// You can use useRouteMatch() instead of useParams()
const { path, query, hash } = routes.PRODUCT.parse(useParams(), useLocation());
```

You can also parse only what you need:

```typescript jsx
import { useParams, useLocation } from "react-router";
import { routes } from "./path/to/routes";

// Again, you can also use useRouteMatch()
const path = routes.PRODUCT.parsePath(useParams());
const query = routes.PRODUCT.parseQuery(useLocation());
const hash = routes.PRODUCT.parseHash(useLocation());
```

## In-depth explanation

### `route`

A route is defined via the `route` helper, which accepts processors of different URL parts. These processors are created via the `path`, `query`, and `hash` helpers. The path processor is required, and the other processors are optional.

If some processor is omitted, the corresponding part of the URL won't be processed at all. Pass `null` or `undefined` to omit the query processor and specify a hash processor.

```typescript
const pathRoute = route(path("/path"));
const queryRoute = route(path("/path"), query());
const hashRoute = route(path("/path"), null, hash());
const fullRoute = route(path("/path"), query(), hash());
```

The `route` helper returns an object with `path` property, containing the original URL path, and `build` and `parse` functions. There are also `buildPath`, `buildQuery`, `buildHash`, `parsePath`, `parseQuery`, and `parseHash` functions provided for convenience.

#### `route.build`

The `build` function accepts three arguments that are params for corresponding processors and returns the URL string with the given parameters. Only the first argument (params for the path processor) is required, even if it's just an empty object.

Pass `null` or `undefined` to skip query building and specify hash.

```typescript
const pathUrl = fullRoute.build({});
const queryUrl = fullRoute.build({}, { queryParam: "foo" });
const hashUrl = fullRoute.build({}, null, "value");
```

Remember that you can also build individual URL parts via the `buildPath`, `buildQuery`, and `buildHash` functions.

#### `route.parse`

The `parse` function accepts two arguments that are `match` (including `null`) or `match.params` and `location` objects from react-router and returns an object with `path`, `query`, and `hash` fields, containing the corresponding parameters from the URL. Only the first argument is required. The `query` and `hash` fields will be `undefined` if no `location` or corresponding processors were provided.

```typescript
const fullResult = fullRoute.parse(useParams(), useLocation());
const pathResult = fullRoute.parse(useParams());
const locationResult = fullRoute.parse(null, useLocation());
```

Remember that you can also parse individual URL parts via the `parsePath`, `parseQuery`, and `parseHash` functions.

### `param`

The `param` helper is used to define types for path and query params. It provides a set of transformers, which transform values to something that can be stored in a URL (usually `string | undefined`) and back. If the reverse transformation is impossible, it throws an error. This usually means that the value in the URL was changed unexpectedly.

The predefined transformers are:

-   `param.string` - single string
-   `param.number` - single number
-   `param.boolean` - single boolean
-   `param.null` - single null
-   `param.date` - single Date (stored in the URL as an ISO string)
-   `param.oneOf()` - one of the given single values, for instance `param.oneOf(1, 'a', true)`
-   `param.arrayOf()` - array of the given transformer, for instance `param.arrayOf(param.number)`

All the above transformers also have an `.optional` modifier, which means that the corresponding value may be `undefined`.

You can write custom transformers using the existing ones as an example.

#### Caveats

-   URL processors determine which transformers can be used in them.

-   Avoid specifying values that have the same string representation in `param.oneOf()`. For instance, in `param.oneOf(1, '1')` the `'1'` value will never be reached.

-   Fields marked as `param.string` will also accept `number` and `boolean` values on build, since they are trivially convertible to string. On parse, though, such fields will always be `string`. If that's not what you want, you can write a custom `strictString`, using the `param.string` as an example.

### `path`

A path processor is created via the `path` helper. In a simple scenario, you can just pass a URL path to it and have some typing out of the box. That's exactly how [`generatePath`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/7331700ce1159c78190d5e880e7301bc28221551/types/react-router/index.d.ts#L166) from react-router works.

```typescript
const myRoute = route(path("/test/:id"));

// { id: string | number | boolean }
const url = myRoute.build({ id: 1 });

// { id: string }
const { path } = myRoute.parse({ id: "1" });
```

In a lot of cases, you can get away with it. However, at the time of writing, it breaks on complex scenarios like `/test/:id(\\d+)?`. It likely will improve, but what if we want to fix it right now? What if we want more precise typing on parsed params?

In that case, we can completely override the inferred type with our own. Note that it's your responsibility to sync this type with the actual path string.

You can use transformers that store values as `string | undefined`.

```typescript
const myRoute = route(path("/test/:id(\\d+)?", { id: param.number.optional }));

// { id?: number }
const url = myRoute.build({ id: 1 });

// { id?: number }
const { path } = myRoute.parse({ id: "1" });
```

#### Parsing details

We're parsing the `match` or `match.params` object from react-router to get valid params of the given route.

If we didn't specify a custom type, and we're parsing the `match` object, we simply compare the `match.path` with the path of the given route. If they match, the `match.params` are considered valid. If we're parsing the `match.params`, we check that they have all the required fields of the path of the given route. If they do, the `match.params` are considered valid.

If we specified a custom type, we simply try to transform the given `match.params`. If we could transform every parameter, the transformed `match.params` are considered valid. Additionally, if we're parsing the `match` object, we check the `match.path` field as well.

If we couldn't get valid params, the result of the parsing is `undefined`.

### `query`

A query processor is created via the `query` helper. It's built upon [`query-string`](https://www.npmjs.com/package/query-string), and you can use its options.

If you want, you can create a processor without custom type and have the `query-string` types with a minor improvement: the ability to store `null` values inside arrays is now checked and depends on the `arrayFormat` option.

```typescript
const myRoute = route(path("/test"), query());
const myCommaRoute = route(path("/test"), query(null, { arrayFormat: "comma", parseNumbers: true }));

// Record<string, any> due to https://github.com/sindresorhus/query-string/issues/298
const url = myRoute.build({}, { foo: "foo" });
const commaUrl = myCommaRoute.build({}, { foo: "foo" });

// Record<string, string | null | (string | null)[]>
const { query } = myRoute.parse(null, useLocation());
// Record<string, string | number | null | (string | number)[]>
const { query: commaQuery } = myCommaRoute.parse(null, useLocation());
```

You can make types more specific by providing a custom type. Note that, in this case, you can't set the `parseNumbers` and `parseBooleans` options to `true`, because the parsing is now done by the specified transformers.

You can use transformers that store values as `string | null | (string | null)[] | undefined`. Again, the ability to store nulls inside arrays depends on the `arrayFormat` option.

```typescript
const myRoute = route(path("/test"), query({ foo: param.number }));
const myCommaRoute = route(path("/test"), query({ foo: param.string.optional }, { arrayFormat: "comma" }));

// { foo: number }
const url = myRoute.build({}, { foo: 1 });
// { foo?: string | number | boolean }
const commaUrl = myCommaRoute.build({}, { foo: "abc" });

// { foo: number }
const { query } = myRoute.parse(null, useLocation());
// { foo?: string }
const { query: commaQuery } = myCommaRoute.parse(null, useLocation());
```

On parse, if some value can't be transformed, the result of the parsing is `undefined`.

#### Caveats

-   `query-string` technically always lets you store nulls inside arrays, but they get converted to empty strings with certain array formats. It's quite tedious to type, and I doubt that anyone needs this.
-   `query-string` lets you stringify arrays with undefined values, omitting them. If you need this behavior, you can write a custom transformer.

### `hash`

A hash processor is created via the `hash` helper. It's the simplest of all. You can call it without parameters:

```typescript
const myRoute = route(path("/test"), null, hash());

// string
const url = myRoute.build({}, null, "foo");

// string
const { hash } = myRoute.parse(null, useLocation());
```

Or you can specify the allowed values:

```typescript
const myRoute = route(path("/test"), null, hash("foo", "bar"));

// 'foo' | 'bar'
const url = myRoute.build({}, null, "foo");

// '' | 'foo' | 'bar'
const { hash } = myRoute.parse(null, useLocation());
```

## What can be improved

-   It would be nice to have type-checking for route state. It requires deep object validation and can be added without breaking changes.

-   It may be a good idea to convert path params like `'one/two/three'` into arrays. Right now it can be done with a custom transformer.

-   There should be some built-in API for default values. Right now it can be done with a custom transformer.

## How is it different from existing solutions?

-   [typesafe-react-router](https://www.npmjs.com/package/typesafe-react-router) only handles path params and doesn't allow regexp-based path.

-   [react-typesafe-routes](https://www.npmjs.com/package/react-typesafe-routes) is quite complex and may be an overkill. It also doesn't handle hash.

-   The solution described at [Type-Safe Usage of React Router](https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44) only cares about path params.

-   There is also [type-route](https://www.npmjs.com/package/type-route), but it's still in beta.
