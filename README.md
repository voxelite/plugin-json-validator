# Voxelite plugin.json Validator

GitHub Action to validate [Voxelite](https://github.com/voxelite)'s `plugin.json` (main information about the plugin).

Checks:
- Presence of all required fields
- Valid characters (especially for plugin's codename)
- Impersonation prevention

## Inputs

### `file`

**Required**

Path to your `plugin.json`.
Default `"plugin.json"` (=in root directory of your repository).

### `official`

Set to `true` for official Voxelite plugins.
Causes the validator to not check against official names.

## Example usage

```yaml
- name: plugin.json validation
  uses: voxelite/plugin-json-validator@v1
```

For `plugin.json` format look into official documentation, some examples can be found in [test directory](test).
