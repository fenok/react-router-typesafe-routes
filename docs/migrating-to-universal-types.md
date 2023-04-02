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

[^1]: With new syntax, for state fields, the value (or its parts) is not stringified or parsed (i.e. only validated).
[^2]: With old syntax, custom types could technically allow `undefined`, in which case `throwable` and a fallback value wouldn't be used for absent values. With new syntax, `undefined` can't be returned if `.default()` or `.defined()` are used.
[^3]: With old syntax, any invalid item fails the whole array, and that error is replaced with undefined. There is no equivalent new syntax, but `string().array()` should be more useful. It always returns an array, and invalid items are replaced with `undefined`. If you need to fail the whole array, the closest new syntax is `string().defined().array()`, which throws an error if any item is absent or invalid (though it's not very useful).
[^4]: With new syntax, array is always defined.
[^5]: This old syntax is unintuitive and unintentional, and therefore shouldn't be used at all.
[^6]: With new syntax, there are no tweaks on the array level because it's always defined and the only way to throw an error is to do it on the item level.

## Custom validation

If you used custom types for additional validation, there is a good chance that you can use universal types instead.

Old syntax:

```tsx
import { route, createType, assertIsString, assertIsNumber } from "react-router-typesafe-routes/dom"; // Or /native

export const integerType = createType<number, string, number>({
    getPlain(value) {
        // We have to convert number to string.
        return JSON.stringify(value);
    },
    getTyped(value) {
        // We expect the result from getPlain here, which is string.
        // We use a built-in helper.
        assertIsString(value);

        // Then we try to parse it.
        const parsedValue: unknown = JSON.parse(value);

        // And we assert that it's a number.
        // We use a built-in helper.
        assertIsNumber(parsedValue);

        // Finally, we check if the number is an integer.
        if (!Number.isInteger(parsedValue)) {
            throw new Error(`Expected ${parsedValue} to be integer.`);
        }

        return value;
    },
});

const ROUTE = route("", {
    // number() only accepts validators that return numbers.
    searchParams: { page: integerType },
});
```

New syntax:

```tsx
import { route, number } from "react-router-typesafe-routes/dom"; // Or /native

// Note that we don't need to check that value is a number.
// This is possible because number() helper has this check built-it.
const integer = (value: number) => {
    if (!Number.isInteger(value)) {
        throw new Error(`Expected ${value} to be integer.`);
    }

    return value;
};

const ROUTE = route("", {
    // number() only accepts validators that return numbers.
    searchParams: { page: number(integer) },
});
```

If you used a third-party validation library, you should use the `type()` helper to integrate it. If you're using Zod or Yup, you can use `zod()` or `yup()` helpers.

Zod:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { zod } from "react-router-typesafe-routes/zod";
import { z } from "zod";

const ROUTE = route(":id", {
    // You should only describe a string, number, boolean, or date (possibly optional).
    // Otherwise, the value is stringified and parsed by JSON.
    params: { id: zod(z.string().uuid()) },
});
```

> ❗Zod doesn't do coercion by default, but you may need it for complex values returned from `JSON.parse` (for instance, a date wrapped in an object).

Yup:

```tsx
import { route } from "react-router-typesafe-routes/dom"; // Or /native
import { yup } from "react-router-typesafe-routes/yup";
import { string } from "yup";

const ROUTE = route(":id", {
    // You should only describe a string, number, boolean, or date (possibly optional).
    // Otherwise, the value is stringified and parsed by JSON.
    params: { id: yup(string().uuid()) },
});
```

Arbitrary third-party validation library:

```tsx
import { type, parser, UniversalType, ParserHint } from "react-router-typesafe-routes/dom"; // Or /native
// Schema is a library-specific interface.
import { v, Schema } from "third-party-library";

function getTypeHint(schema: Schema): ParserHint {
    // This is the most tricky part.
    // We determine if the schema type is assignable to 'string', 'number', 'boolean', or 'date'.
    // If so, we return the corresponding hint, and 'unknown' otherwise.
    // The type can also be optional, e.g. 'string | undefined' should use 'string' hint.
    return schema.type;
}

function valid<T>(schema: Schema<T>): UniversalType<T> {
    // We use library-specific validation logic.
    return type((value: unknown) => schema.validate(value), parser(getTypeHint(schema)));
}

const ROUTE = route(":id", {
    params: { id: valid(v.string().uuid()) },
});
```

## Custom types

If you need some behavior that can't be achieved with the new syntax, you can construct type objects manually.

They have to implement some or all of these interfaces:

```typescript
// Can be used for path params
interface ParamType<TOut, TIn = TOut> {
    getPlainParam: (originalValue: Exclude<TIn, undefined>) => string;
    getTypedParam: (plainValue: string | undefined) => TOut;
}

// Can be used for search params
interface SearchParamType<TOut, TIn = TOut> {
    getPlainSearchParam: (originalValue: Exclude<TIn, undefined>) => string[] | string;
    getTypedSearchParam: (plainValue: string[]) => TOut;
}

// Can be used for state fields
interface StateParamType<TOut, TIn = TOut> {
    getPlainStateParam: (originalValue: Exclude<TIn, undefined>) => unknown;
    getTypedStateParam: (plainValue: unknown) => TOut;
}
```
