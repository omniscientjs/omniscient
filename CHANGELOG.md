Changelog
====

Changelog with fixes and additions between each release.

## Version `v1.2.0`
## Additions
1. Adds possibility for overriding `component.isCursor`
1. Adds possibility for overriding `component.isEqualCursor`

## Version `v1.1.0`
### Fixes
1. Fixed bug with shouldComponentUpdate mixin, where the method couldn't be overridden.
2. Removed duplicated dependencies from `package.json`.

### Additions
1. Added component name support for debugging
```js
var Component = component(debugName, function () {});
```
2. Adds debug method for printing out valuable debug-information for shouldComponentRender and render.

## Version `v1.0.0`

Initial release with stable API.
