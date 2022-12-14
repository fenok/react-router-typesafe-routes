## Branches

-   `main` represents the latest published version. It can only be updated automatically.
-   `dev` represents a stable version used for development. At some point, `dev` is published and merged into `main`.

## Pull Requests

All code changes have to be done via pull requests to `dev` branch.

Every pull request have to specify a deferred version bump via [yarn version](https://yarnpkg.com/cli/version) like this:

```bash
yarn version patch --deferred
```

It's also recommended to specify the changes in [CHANGELOG.md](./CHANGELOG.md). If needed, create an entry under `## [Unreleased]` header (right above the latest entry) and the corresponding link (`[unreleased]: https://github.com/fenok/react-router-typesafe-routes/tree/dev`). Upon release, it will be automatically replaced with an actual version and date.
