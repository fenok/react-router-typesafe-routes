# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add `configure()` for configuring types parser globally.
- Allow to pass a custom parser as a second argument to all built-in types.
- Expose params kind (`"pathname" | "search" | "hash"`) for custom parsers to use.
- Add pathless routes and route composition API.

```typescript
// Instead of route(':id', { params: { id: number() }, searchParams: { page: number() } })
const fragment = route({ params: { id: number() }, searchParams: { page: number() } });

// Instead of types(FRAGMENT)({searchParams: { query: string() }})
const myRoute = route({
  path: "my-path/:id",
  compose: [fragment],
  searchParams: { query: string() },
});

const { id } = useTypedParams(fragment);
const [{ page }] = useTypedSearchParams(fragment);
```

### Changed

- `union()` now accepts enums and readonly (`as const`) objects.
- `union()` now properly infers values from an inline array without `as const`.
- Pathname params without explicit types now use `string()` and `string().defined()` for optional and required params respectively instead of custom code.
- State can now optionally be typed as a whole, so non-object states can now be typed.
- **Breaking**: `union()` no longer accepts its values as multiple arguments.
- **Breaking**: Types for pathname `params` are now stricter and don't allow params which are not specified in the path pattern. This also fixes autocomplete for such params.
- **Breaking**: A `$` is added to all fields of a route object, so now child routes can start with a lowercase character and use basically any naming scheme (unless they start with a `$`, which is forbidden).
- **Breaking**: The `types` field is renamed to `$spec`, and it now also contains an unmodified `path` option of the route.
- **Breaking**: Naming scheme was changed from `getPlain`/`getTyped` to `serialize`/`deserialize` for clarity.
- **Breaking**: Path and state generation API is changed.
  - `$buildPath` (formerly `buildPath`) now accepts all params as a single argument.
  - `$buildPathname` is added.
  - `buildRelativePath` is removed, and instead `$buildPath` and `$buildPathname` now accept a `relative` option.
  - `getUntypedParams`, `getUntypedSearchParams`, and `getUntypedState` were removed. Instead, `$buildPath`, `$buildSearch`, `$serializeSearchParams`, and `$buildState` now accept `untypedSearchParams` or `untypedState` options where applicable. When provided, the corresponding untyped parts will be added to the resulting path (the search part) or state. The corresponding option in `useTypedSearchParams` is also renamed.
  - `$serializeSearchParams` (formerly `getPlainSearchParams`) now returns a `URLSearchParams` instance for consistency with the rest of the API.
- **Breaking**: `route` API is changed. It now accepts a single argument with optional types, path, composed routes and children. By default, path is `undefined` (which means a pathless route).
- **Breaking**: Hash should now be specified as an array of strings or a type. Empty array now means "nothing" instead of "any string". For example:
  - `hashValues('about', 'info')` => `['about', 'info']`
  - `hashValues()` => `string()`
  - Default: `[]`
  - You can also use other types, like `number().default(-1)`
- **Breaking**: Array types like `string().array()` now filter `undefined` values upon parsing. The previous behavior broke a common pattern of changing a subset of search parameters:

```typescript
const FRAGMENT = route({ searchParams: { pages: number().array(), query: string() } });

const [{ pages, query }, setTypedSearchParams] = useTypedSearchParams(FRAGMENT);

setTypedSearchParams((prevParams) => ({
  // Previously, prevParams.pages would be (number|undefined)[],
  // which is not assignable to number[].
  ...prevParams,
  query: "hi",
}));
```

- **Breaking**: Similarly, `undefined` keys are now omitted from all parsed params to match how there are no such keys in raw `params` from React Router. [The reason](https://github.com/fenok/react-router-typesafe-routes/issues/10#issuecomment-1186573588) this behavior was originally introduced is not relevant anymore.
- **Breaking**: `$` no longer prevents pathname types inheritance.
- **Breaking**: Some types are changed for convenience and readability.
- **Breaking**: The minimal required version of TS is now `v5.0` with `strict` mode enabled.

### Removed

- **Breaking**: Removed all deprecated features.
- **Breaking**: Removed `hashValues()`. Pass an array of strings or a type instead.
- **Breaking**: Removed `types()`. Use composition API instead.

## [1.2.2] - 2024-04-21

### Fixed

- For routes without pathname/search/state params, non-empty objects are no longer accepted as these params.

## [1.2.1] - 2023-06-20

### Fixed

- Fix path generation when the first segment is optional. Previously, `route(":optional?/:required").buildPath({ required: "req" })` would be `"//req"`.

## [1.2.0] - 2023-04-22

### Added

- Add CommonJS support for environments that support the `exports` field in `package.json`.

## [1.1.0] - 2023-04-07

### Added

- Introduce type objects that allow to fine-tune parsing and serialization logic for every route part.
- Add helpers for creating these type objects. They can generally be used instead of the old ones (see [Migrating to Universal Types](docs/migrating-to-universal-types.md)). The helpers are:
  - `type()` for creating any type;
  - `parser()` for accessing the built-in parser, most likely for building custom wrappers around `type()`;
  - `string()`, `number()`, `boolean()`, and `date()` for creating types based on the corresponding primitives;
  - `union()` for creating unions of `string`, `number`, and `boolean` values;
  - `zod()` for creating types based on Zod Types;
  - `yup()` for creating types based on Yup Schemas.
- Route params input and output types are now much more readable in IDE hints.
- Specifying a path pattern with leading or trailing slashes or a child route starting with a lowercase letter will now lead to a human-readable error.

### Fixed

- For types of parsed path params, search params, and state fields, keys that correspond to type objects that return `undefined` upon a parsing error are no longer optional.

### Deprecated

- Deprecate old helpers for creating type objects: `createType()`, `stringType()`, `numberType()`, `booleanType()`, `dateType()`, `oneOfType()`, `arrayOfType()`, `throwable`, and all types that are exclusive to them.
- Deprecate `assertIsString()`, `assertIsNumber()`, `assertIsBoolean()`, `assertIsArray()`, and `assertIsValidDate()` because they are embedded in new helpers, which allow to run additional checks after these assertions.

## [1.0.0] - 2023-01-23

### Added

- Add support for optional path segments.
- Add `types()` helper for route types composition.
- Add `getUntypedParams()` method to route object.

### Fixed

- Intermediate splat (star) segments in absolute path patterns are now properly detected. Previously, their detection didn't work properly if dynamic segments were present. It means that such star params will now correctly appear in parsed (typed) path params.
- Multiple intermediate stars are now properly removed from relative path pattern. This also fixes building URL paths from such patterns.
- Upon building URL paths from patterns with only intermediate stars, the `*` parameter is not present anymore, because it doesn't actually do anything (intermediate stars are simply removed).

### Changed

- **Breaking**: Fallbacks are now run through type functions to ensure fallbacks validity, and therefore `TRetrieved` was replaced with `TOriginal` in their type. This is technically a breaking change, but it only affects custom types where `TRetrieved` is not assignable to `TOriginal`, which should be extremely rare.
- **Breaking**: Minimal required React Router version is changed to `6.7.0` due to optional path segments support.
- **Breaking**: Rename `ExtractRouteParams` to `PathParam` for parity with React Router.
- **Breaking**: In route object, `$` no longer contains undecorated child routes. Instead, it now contains routes that lack parent path pattern and path type objects, but inherit everything else.
- `buildPath`/`buildRelativePath` now accept additional arguments and behave exactly like `buildUrl`/`buildRelativeUrl`.
- `setTypedSearchParams` is switched to React Router implementation of functional updates.

### Deprecated

- `buildUrl`/`buildRelativeUrl` now behave exactly like `buildPath`/`buildRelativePath` and are therefore deprecated.

### Removed

- Remove all internal fields prefixed with `__` from route objects.

## [0.5.1] - 2022-12-14

### Added

- Add [CONTRIBUTING.md](./CONTRIBUTING.md)

### Fixed

- Sync node version requirements with React Router.

## [0.5.0] - 2022-09-14

### Added

- Expose route `types` (previously existed as internal `__options__`).

### Changed

- **Breaking**: Rename `CreateRouteOptions` and `RouteOptions` into `RouteOptions` and `RouteTypes` respectively.

## [0.4.3] - 2022-09-11

### Added

- Add `throwable` fallback.

## [0.4.2] - 2022-09-10

### Added

- Add CHANGELOG.md.
- Add `preserveUntyped` option to `setTypedSearchParams` from `useTypedSearchParams` hook.
- Add `getUntypedSearchParams` and `getUntypedState` methods to route object.

### Fixed

- Return value of `buildState` method is now properly typed as `Record<string, unknown>` instead of `unknown`.
- Hook dependencies are now properly listed, which is checked by ESLint. This fixes `useTypedSearchParams` for dynamic routes.
- Prevent access to internal `useUpdatingRef` helper.

[unreleased]: https://github.com/fenok/react-router-typesafe-routes/tree/dev
[1.2.2]: https://github.com/fenok/react-router-typesafe-routes/tree/v1.2.2
[1.2.1]: https://github.com/fenok/react-router-typesafe-routes/tree/v1.2.1
[1.2.0]: https://github.com/fenok/react-router-typesafe-routes/tree/v1.2.0
[1.1.0]: https://github.com/fenok/react-router-typesafe-routes/tree/v1.1.0
[1.0.0]: https://github.com/fenok/react-router-typesafe-routes/tree/v1.0.0
[0.5.1]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.5.1
[0.5.0]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.5.0
[0.4.3]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.4.3
[0.4.2]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.4.2
