# Naming rationale

Params can undergo the following transformations:

- _Serialization_, which consists of:
  - _Intermediate serialization_ (for the lack of a better name) - converting a JS value into a serializable format.
  - _Stringification_ - converting the transformed JS value into a string.
- _Deserialization_, which consists of:
  - _Parsing_ - converting a string into a JS value.
  - _Validation_ - checking the type and constraints of the JS value.

Despite the name, it's allowed to change the value to make it valid during _validation_ (for convenience).

State params don't require _stringification_ and _parsing_.

_Intermediate serialization_ is only possible in custom type objects and should be extremely rare.

The `type()` helper is only concerned about _stringification_, _parsing_, and _validation_ (and state params are only validated). In this context, _stringification_ and _parsing_ are the opposite operations, so they are packed into a `Parser` with `stringify` and `parse` fields (which `JSON` is conveniently compatible with). `type()` also accepts a `Validator` function for _validation_.

Type objects have two fields:

- The field for _serialization_ starts with `serialize`.
- The field for _deserialization_ starts with `deserialize`.

Route API methods for params _serialization_ start with `serialize`, and methods for _deserialization_ start with `deserialize`. Methods for building route parts start with `build` despite the fact that they _serialize_ params under the hood (it would be weird to `serializePath()`).
