# Migrating to Universal Types

| Old syntax                           | New syntax                                              |
| ------------------------------------ | ------------------------------------------------------- |
| `stringType`                         | `string()`[^1]                                          |
| `numberType`                         | `number()`[^1]                                          |
| `booleanType`                        | `boolean()`[^1]                                         |
| `dateType`                           | `date()`[^1]                                            |
| `oneOfType('foo', 'bar')`            | `union('foo', 'bar')`[^1]                               |
| `stringType('')`                     | `string().default('')`[^1][^2]                          |
| `stringType(throwable)`              | `string().defined()`[^1][^2]                            |
| `arrayOfType(stringType)`            | `string().array()`/`string().defined().array()`[^1][^3] |
| `arrayOfType(stringType(''))`        | `string().default('').array()`[^1][^2][^4]              |
| `arrayOfType(stringType(throwable))` | `string().defined().array()`[^1][^2][^4][^5]            |
| `arrayOfType(/*  */)([])`            | N/A[^6]                                                 |
| `arrayOfType(/*  */)(throwable)`     | N/A[^6]                                                 |

For additional info, check out [Advanced examples](../README.md#advanced-examples) in the README.

[^1]: With new syntax, for state fields, the value (or its parts) is not stringified or parsed (i.e. only validated).
[^2]: With old syntax, custom types could technically allow `undefined`, in which case `throwable` and a fallback value wouldn't be used for absent values. With new syntax, `undefined` can't be returned if `.default()` or `.defined()` are used.
[^3]: With old syntax, any invalid item fails the whole array, and that error is replaced with undefined. There is no equivalent new syntax, but `string().array()` should be more useful. It always returns an array, and invalid items are replaced with `undefined` (as of `v2.0.0`, `undefined` values are omitted). If you need to fail the whole array, the closest new syntax is `string().defined().array()`, which throws an error if any item is absent or invalid (though it's not very useful).
[^4]: With new syntax, array is always defined.
[^5]: This old syntax is unintuitive and unintentional, and therefore shouldn't be used at all.
[^6]: With new syntax, there are no tweaks on the array level because it's always defined and the only way to throw an error is to do it on the item level.
