# React router: typesafe routes

Provides type safety for path params, query params and hash on building and parsing URLs.

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
    PRODUCT: route(path("/product/:id"), query({ age: param.number }, hash("about", "subscribe"))),
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
import { Link } from "react-router";
import { routes } from "./path/to/routes";

<Link to={routes.PRODUCT.build({ id: 1 }, { age: 12 }, "about")} />;
```

Parse params with usual hooks:

```typescript jsx
import { useParams, useLocation, useRouteMatch } from "react-router";
import { routes } from "./path/to/routes";

// Whatever suits you best, the result is the same
const fromMatch = routes.PRODUCT.parse(useRouteMatch(), useLocation());
const fromParams = routes.PRODUCT.parse(useParams(), useLocation());

const { path, query, hash } = fromParams;
```

## In-depth explanation

### `route`

A route is defined via the `route` helper, that accepts processors of different URL parts. These processors are created via the `path`, `query` and `hash` helpers. The path processor is required, and the other processors are optional.

If some processor is omitted, the corresponding part of the URL won't be processed at all. Pass `null` or `undefined` to omit the query processor and specify a hash processor.

```typescript
const pathRoute = route(path("/path"));
const queryRoute = route(path("/path"), query());
const hashRoute = route(path("/path"), null, hash("value"));
const fullRoute = route(path("/path"), query(), hash());
```

The `route` helper returns an object with `path` property, containing the original URL path, and `build` and `parse` functions. There are also `buildPath`, `buildQuery`, `buildHash`, `parsePath`, `parseQuery` and `parseHash` functions provided for convenience. Note that `parsePath` somewhat unexpectedly accepts `match` or `match.params` from react-router instead of string, like `parseQuery` and `parseHash` do.

#### `route.build`

The `build` function accepts three arguments that are params for corresponding processors and returns a URL string with given parameters. Only the first argument (params for path processor) is required (even if it's just `{}`).

Pass `null` or `undefined` to skip query building and specify hash. If the query processor is provided, you can also pass `{}`. That will technically invoke the query processor, yielding an empty query string.

```typescript
const pathUrl = fullRoute.build({});
const queryUrl = fullRoute.build({}, { queryParam: "foo" });

// No query processor on this route
const hashUrlNoQuery = hashRoute.build({}, null, "value");

// There is a query processor on this route, so we can pass {} to it
const hashUrl = fullRoute.build({}, {}, "value");
```

#### `route.parse`

The `parse` function accepts two arguments that are `match` or `match.params` and `location` object from react-router. It returns an object with `path`, `query` and `hash` fields, containing corresponding parameters from the URL. Again, all actual work is performed by processors. The `path` field will be `undefined` if the given `match` or `match.params` object doesn't belong to the given route. The `query` and `hash` fields will be `undefined` if no `location` or corresponding processors were provided.

You can omit any of the arguments if you don't need the corresponding parameters:

```typescript
const fullResult = fullRoute.parse(useParams(), useLocation());
const pathResult = fullRoute.parse(useParams());
const locationResult = fullRoute.parse(null, useLocation());
```

### `param`

The `param` helper is used to define types for path and query params. Internally it transforms values to desired types and throws if it's not possible.

The possible values are:

-   `param.string` - single string
-   `param.number` - single number
-   `param.boolean` - single boolean
-   `params.null` - single null
-   `param.oneOf()` - one of the given single values, for instance `param.oneOf(1, 'a', true)`
-   `param.arrayOf()` - array of the given params, for instance `param.arrayOf(param.number)`

While you most likely won't need this, for the sake of completeness you can combine them into arrays like this: `[param.number, param.boolean]`. That means `number | boolean` in terms of TS.

In fact, you can combine them in any way that processors allow, for instance `[param.arrayOf(param.oneOf('a', 'b'), param.number), param.boolean]` means `('a' | 'b' | number)[] | boolean`. Use with caution.

It's important to understand that URL doesn't store type information. It means that when there are multiple transformers specified for a single value, their order matters. The first successful transformation wins.

In practice, it means that you should always specify the string transformer last, otherwise you may get a string value that is technically correct, but likely not what you expected.

It's also important to avoid overlapping transformers. For instance, `param.oneOf(1, '1')` is useless, because `'1'` will never be reached.

## How is it different from existing solutions?

-   [typesafe-react-router](https://www.npmjs.com/package/typesafe-react-router) only handles path params and doesn't allow regexp-based path.

-   [react-typesafe-routes](https://www.npmjs.com/package/react-typesafe-routes) is quite complex and may be an overkill. It also doesn't handle hash.

-   Solution described at [Type-Safe Usage of React Router](https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44) only cares about path params.

-   There is also [type-route](https://www.npmjs.com/package/type-route), but it's still in beta.
