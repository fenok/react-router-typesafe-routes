# Migrating to Universal Types

| Old syntax                       | New syntax                                                      |
| -------------------------------- | --------------------------------------------------------------- |
| `stringType`                     | `string()`<sup>1 </sup>                                         |
| `numberType`                     | `number()`<sup>1 </sup>                                         |
| `booleanType`                    | `boolean()`<sup>1 </sup>                                        |
| `dateType`                       | `date()`<sup>1 </sup>                                           |
| `oneOfType('foo', 'bar')`        | `union('foo', 'bar')`<sup>1 </sup>                              |
| `stringType('')`                 | `string().default('')`<sup>1, 2 </sup>                          |
| `stringType(throwable)`          | `string().defined()`<sup>1, 2 </sup>                            |
| `arrayOfType(stringType)`        | `string().array()`/`string().defined().array()`<sup>1, 3 </sup> |
| `arrayOfType(stringType(''))`    | `string().default('').array()`<sup>1, 2, 4 </sup>               |
| `arrayOfType(/*  */)([])`        | N/A<sup>5 </sup>                                                |
| `arrayOfType(/*  */)(throwable)` | N/A<sup>5 </sup>                                                |

1 - With new syntax, for state fields, the value (or its parts) is not stringified or parsed.

2 - With old syntax, custom types could technically allow `undefined`, in which case `throwable` and a fallback value wouldn't be used for `undefined` values. With new syntax, `undefined` can't be returned if `.default()` or `.defined()` are used.

3 - With old syntax, any invalid item fails the whole array, and that error is replaced with undefined. There is no equivalent new syntax, but `string().array()` should be more useful. It always returns an array, and invalid items are replaced with `undefined`. If you need to fail the whole array, the closest new syntax is `string().defined().array()`, which throws an error if any item is absent or invalid (though it's not very useful).

4 - With new syntax, array is always defined.

5 - With new syntax, there are no tweaks on the array level because it's always defined and the only way to throw an error is to do it on the item level.
