# Voxelite plugin.json Validator

GitHub Action to validate [Voxelite](https://voxelite.net)'s `plugin.json` (main information about the plugin).

Checks:
- Presence of all required fields
- Valid characters (especially for plugin's codename)
- Voxelite impersonation prevention

## Inputs

### `file`

**Required**

Path to your `plugin.json`.
Default `"plugin.json"` in current directory.

### `official`

Set to `true` for official Voxelite plugins.
Causes the validator to not check against official names.

Do not use this unless you are an official plugin.
It does not give you any advantage, just ignores checks for official-sounding names.

## Outputs

### `codename`

Parsed codename from the plugin.

### `version`

Parsed version from the plugin.

### `alias`

Comma-separated list of codenames.

### `depends`

Plugins this one directly depends on.

### `other_plugins`

Other plugins mentioned in plugin relations like `depends` or `recommends`.

## Example usage

```yaml
- name: plugin.json validation
  uses: voxelite/plugin-json-validator@v1
```

```yaml
- name: plugin.json validation
  uses: voxelite/plugin-json-validator@v1
  with:
    file: path/to/plugin.json
```

For `plugin.json` format look into official documentation, some examples can be found in [test directory](test).
