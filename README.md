# Voxelite plugin.json Validator

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `file`

**Required** Path to your `plugin.json`. Default `"plugin.json"` (=root directory of your repository).

### `official`

Set to `true` for official Voxelite plugins.
Causes the validator to not check against official names.

## Example usage

```yaml
uses: voxelite/plugin-json-validator
```

For `plugin.json` format look into official documentation, some examples can be found in [test directory](test).