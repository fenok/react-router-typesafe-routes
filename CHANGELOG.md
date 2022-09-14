# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2022-09-14

### Added

-   Expose route `types` (previously existed as internal `__options__`).

### Changed

-   Renamed `CreateRouteOptions` and `RouteOptions` into `RouteOptions` and `RouteTypes` respectively.

## [0.4.3] - 2022-09-11

### Added

-   Add `throwable` fallback.

## [0.4.2] - 2022-09-10

### Added

-   Add CHANGELOG.md.
-   Add `preserveUntyped` option to `setTypedSearchParams` from `useTypedSearchParams` hook.
-   Add `getUntypedSearchParams` and `getUntypedState` methods to route object.

### Fixed

-   Return value of `buildState` method is now properly typed as `Record<string, unknown>` instead of `unknown`.
-   Hook dependencies are now properly listed, which is checked by ESLint. This fixes `useTypedSearchParams` for dynamic routes.
-   Prevent access to internal `useUpdatingRef` helper.

[0.5.0]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.5.0
[0.4.3]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.4.3
[0.4.2]: https://github.com/fenok/react-router-typesafe-routes/tree/v0.4.2
