# React router: typesafe routes

Provides type safety for path params, query params and hash on building and parsing URLs.

## Design principles

-   Mess with react-router API as little as possible
-   No unsafe type casts
-   Extensibility to allow better typing and/or validation
-   Completeness: cover every aspect of the URL

## Usage

Define routes:

```typescript
import { route, path, query, hash } from "react-router-typesafe-routes";

const routes = {
    MAIN: route(
        // Any string that react-router can work with
        // Path params type for build is inferred as {}
        path("/main"),
        // No query on this route
        null,
        // Hash values for build
        hash<"" | "about" | "subscribe">()
    ),
    PRODUCT: route(
        // Path params type for build is inferred as { id: number | string | boolean }
        // Optional params are also recognized
        path("/product/:id(\\d+)"),
        // Query params for build and options for query-string
        query<{ search: string }>({ stringify: { skipEmptyString: true } })
    ),
};
```

Use `Route` components as usual:

```typescript jsx
import { Route } from "react-router";
import { routes } from "./path/to/routes";
import { Main } from "./path/to/main";
import { Product } from "./path/to/product";

const App = () => {
    return (
        <>
            <Route path={routes.MAIN.path}>
                <Main />
            </Route>
            <Route path={routes.PRODUCT.path}>
                <Product />
            </Route>
        </>
    );
};
```

Use `Link` components as usual:

```typescript jsx
import { Link } from "react-router";
import { routes } from "./path/to/routes";

const Nav = () => {
    return (
        <div>
            {/* Note how 'path' and 'query' fields are optional, but 'hash' is required */}
            <Link to={routes.MAIN.build({ hash: "about" })} />
            {/* Note how 'path' and 'query' fields are required, but 'hash' is optional */}
            <Link to={routes.PRODUCT.build({ path: { id: 2 }, query: { search: "" } })} />
        </div>
    );
};
```

Parse params with usual hooks:

```typescript jsx
import { routes } from "./path/to/routes";
import { useParams, useLocation, useRouteMatch } from "react-router";

const Component = () => {
    // Parse all params
    // 'path' is typed as { id: string } | undefined
    // 'path' is undefined if we are not on expected route
    // 'query' is typed as { search?: AnyParsedValue }, where AnyParsedValue is anything that can come from query-string
    // 'hash' is typed as unknown since we didn't specify it for that route
    const { path, query, hash } = routes.PRODUCT.parse(useRouteMatch(), useLocation());

    // Parse all params, slightly less reliable
    const paramsResult = routes.PRODUCT.parse(useParams(), useLocation());

    // Parse only path
    // 'query' and 'hash' are undefined since we didn't provide location
    const onlyMatchResult = routes.PRODUCT.parse(useRouteMatch());

    // Parse only location (query and hash)
    const onlyLocationResult = routes.PRODUCT.parse(null, useLocation());

    return (
        <div>
            Search: {query.search}; id: {path?.id}
        </div>
    );
};
```

## How is it different from existing solutions?

-   [typesafe-react-router](https://www.npmjs.com/package/typesafe-react-router) only handles path params and doesn't allow regexp-based path.

-   [react-typesafe-routes](https://www.npmjs.com/package/react-typesafe-routes) is quite complex and may be an overkill. It also doesn't handle hash.

-   Solution described at [Type-Safe Usage of React Router](https://dev.to/0916dhkim/type-safe-usage-of-react-router-5c44) only cares about path params.

-   There is also [type-route](https://www.npmjs.com/package/type-route), but it's still in beta.
