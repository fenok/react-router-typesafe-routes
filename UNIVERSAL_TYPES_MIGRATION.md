# Migrating to Universal Types

| Old syntax                       | New syntax                                              |
| -------------------------------- | ------------------------------------------------------- |
| `stringType`                     | `string()`[^1]                                          |
| `numberType`                     | `number()`[^1]                                          |
| `booleanType`                    | `boolean()`[^1]                                         |
| `dateType`                       | `date()`[^1]                                            |
| `oneOfType('foo', 'bar')`        | `union('foo', 'bar')`[^1]                               |
| `stringType('')`                 | `string().default('')`[^1][^2]                          |
| `stringType(throwable)`          | `string().defined()`[^1][^2]                            |
| `arrayOfType(stringType)`        | `string().array()`/`string().defined().array()`[^1][^3] |
| `arrayOfType(stringType(''))`    | `string().default('').array()`[^1][^2][^4]              |
| `arrayOfType(/*  */)([])`        | N/A[^5]                                                 |
| `arrayOfType(/*  */)(throwable)` | N/A[^5]                                                 |

If you need some behavior that can't be achieved with the new syntax, you can construct type objects manually.

[^1]: With new syntax, for state fields, the value (or its parts) is not stringified or parsed.
[^2]: With old syntax, custom types could technically allow `undefined`, in which case `throwable` and a fallback value wouldn't be used for absent values. With new syntax, `undefined` can't be returned if `.default()` or `.defined()` are used.
[^3]: With old syntax, any invalid item fails the whole array, and that error is replaced with undefined. There is no equivalent new syntax, but `string().array()` should be more useful. It always returns an array, and invalid items are replaced with `undefined`. If you need to fail the whole array, the closest new syntax is `string().defined().array()`, which throws an error if any item is absent or invalid (though it's not very useful).
[^4]: With new syntax, array is always defined.
[^5]: With new syntax, there are no tweaks on the array level because it's always defined and the only way to throw an error is to do it on the item level.
