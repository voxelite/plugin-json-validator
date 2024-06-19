const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

const voxeliteOfficial = core.getInput("official") === 'true';

function checkApiVersion(api_version)
{
    switch(typeof api_version)
    {
        default:
            core.error("Invalid type of `api_version`, use number");
            return;
        case "string":
            core.warning("`api_version` should be a number");
            if(api_version !== "1")
            {
                core.error("`api_version` only supports value of 1");
                return;
            }
            break;
        case "number":
            if(api_version !== 1)
            {
                core.error("`api_version` only supports value of 1");
                return;
            }
            break;
    }
}
function validateCodename(field, value)
{
    if(typeof value !== "string")
    {
        core.error(field + " must be a string");
        return;
    }

    if(value.length === 0)
    {
        core.error(field + " cannot be empty");
        return;
    }
    else if(value.length < 2)
    {
        core.error(field + " must be at least 2 characters");
        return;
    }
    else if(value.length < 8)
        core.warning(field + " should be at least 8 characters");

    {
        // - Only alphanumeric characters
        // - No underscore at the beginning and the end
        // - No double underscore
        // - No number at the beginning (but may be at the end)
        const regex_req = /^[a-zA-Z]([_a-zA-Z0-9]?[a-zA-Z0-9])*$/;
        const regex_min = /^[a-z]([_a-z0-9]?[a-z0-9])*$/;
        if(!regex_req.test(value))
        {
            core.error(field + " does not match required format - only alphanumeric characters with optional underscore");
            return;
        }
        else if(!regex_min.test(value))
            core.warning(field + " does not match expected format - only lowercase letters, numbers and optional underscores");
    }

    if(value.startsWith('vl_') || value.startsWith('VL_') || value.startsWith('voxelite_') || value.startsWith('VOXELITE_'))
    {
        if(!voxeliteOfficial)
            core.warning("It looks like you are using " + field + " similar to official Voxelite ones, please choose a different prefix");
    }
}
function checkCodename(codename)
{
    validateCodename("`codename`", codename);
}
function checkAlias(alias)
{
    validateCodename(`alias '${alias}'`, alias);
}
function checkAliases(alias)
{
    switch(typeof alias)
    {
        case "string":
        {
            checkAlias(alias);
            return [ alias ];
        }
        case "object":
        {
            if(Array.isArray(alias) && alias.every(item => typeof item === "string"))
            {
                alias.forEach(value => {
                   checkAlias(value);
                });
                return alias;
            }
            else
            {
                core.error("`alias` should be a string or an array");
                return [];
            }
        }
        default:
            core.error("`alias` should be a string or an array");
            return [];
    }
}
function validateNonPrintCharacter(field, value)
{
    for(let i = 0; i < value.length; i++)
    {
        const c = value.charCodeAt(i);
        if(c < 32 /* space character */)
        {
            if(c === 13 /* \r */ || c === 10 /* \n */)
            {
                core.error(field + " cannot contain a new line");
                return;
            }
            else if(c === 9 /* \t */)
            {
                core.error(field + " cannot contain tab character");
                return;
            }
            else
            {
                core.error(field + " cannot contain non-printable character (first 32 ASCII characters) - found character " + c);
                return;
            }
        }
    }
}
function checkName(name)
{
    if(typeof name !== "string")
    {
        core.error("`name` must be a string");
        return;
    }

    if(name.length === 0)
    {
        core.error("`name` cannot be empty");
        return;
    }
    else if(name.length < 2)
    {
        core.error("`name` must be at least 2 characters");
        return;
    }
    else if(name.length < 8)
        core.warning("`name` should be at least 8 characters which '" + name + "' is not");

    if(name.startsWith(' ') || name.endsWith(' '))
        core.warning("`name` should not start or end with a space character");
    if(name.indexOf("  ") !== -1)
        core.warning("`name` should not contain multiple consecutive space characters");

    validateNonPrintCharacter('`name`', name);
}
function checkVersion(version)
{
    if(typeof version !== "string")
    {
        core.error("`version` must be a string in a specific format - see Semantic Versioning ( https://semver.org/ )");
        return;
    }

    {
        //const regex = /^([0-9]+)\.([0-9]+)(\.([0-9]+))?$/
        const regex = /^(?<major>[0-9]+)\.(?<minor>[0-9]+)(?:\.(?<patch>[0-9]+))?$/
        if(!regex.test(version))
        {
            core.error("`version` does not match Semantic Versioning ( https://semver.org/ ) format of `major.minor.patch` or `major.minor`");
            return;
        }
        /*
        const matches = regex.exec(version);
        if(matches != null)
        {
            const groups = matches.groups
            core.info(`Found version ${groups['major']}.${groups['minor']}.${groups['patch'] || 0}`);
        }
        */
    }
}
function checkDescription(description)
{
    if(typeof description !== "string")
    {
        core.error("`description` must be a string");
        return;
    }

    if(description.length === 0)
    {
        core.error("`description` cannot be empty");
        return;
    }
    else if(description.length < 16)
    {
        core.error("`description` must be at least 16 characters (or not present)");
        return;
    }

    if(description.startsWith(' ') || description.endsWith(' '))
        core.warning("`description` should not start or end with a space character");
    if(description.indexOf("  ") !== -1)
        core.warning("`description` should not contain multiple consecutive space characters");

    validateNonPrintCharacter('`description`', description);
}
function checkWebsite(website)
{
    if(typeof website !== "string")
    {
        core.error("`website` must be a string");
        return;
    }

    if(website.length === 0)
    {
        core.error("`website` cannot be empty");
        return;
    }
    else if(website.length < 10)
    {
        core.error("`website` must be at least 10 characters (or not present)");
        return;
    }

    if(website.startsWith(' ') || website.endsWith(' '))
        core.warning("`website` should not start or end with a space character");
    if(website.indexOf("  ") !== -1)
        core.warning("`website` should not contain multiple consecutive space characters");

    if(!website.startsWith("http://") && !website.startsWith("https://"))
    {
        core.error("`website` must start with `https://`");
        return;
    }
    if(website.startsWith("http://"))
        core.warning("Consider using `https://` instead of `http://` for `website`");

    validateNonPrintCharacter('`website`', website);

    if(website.includes('voxelite.net'))
    {
        if(!voxeliteOfficial)
            core.warning("It looks like you are using official Voxelite `website`, please use your own website or don't include any `website` info");
    }
}
function checkAuthor(author)
{
    if(typeof author !== "string")
    {
        core.error("`author` must be a string");
        return;
    }

    if(author.length === 0)
    {
        core.error("`author` cannot be empty");
        return;
    }
    else if(author.length < 2)
    {
        core.error("`author` must be at least 2 characters");
        return;
    }
    else if(author.length < 8)
        core.warning("`author` should be at least 8 characters which '" + author + "' is not");


    if(author.startsWith(' ') || author.endsWith(' '))
        core.warning("`author` should not start or end with a space character");
    if(author.indexOf("  ") !== -1)
        core.warning("`author` should not contain multiple consecutive space characters");

    validateNonPrintCharacter('`author`', author);

    if(author === 'vl' || author === 'voxelite')
    {
        if(!voxeliteOfficial)
            core.warning("Please don't include `voxelite` in the list of authors");
    }
}
function checkPermission(permission)
{
    if(typeof permission !== "string")
    {
        core.error("Each item in `permissions` must be a string");
        return;
    }

    if(permission.length === 0)
    {
        core.error("Permission cannot be empty");
        return;
    }
    else if(permission.length < 2)
    {
        core.error("Permission must be at least 2 characters which '" + permission + "' is not");
        return;
    }

    if(permission.startsWith(' ') || permission.endsWith(' '))
        core.warning("`permissions` item should not start or end with a space character");
    if(permission.indexOf("  ") !== -1)
        core.warning("`permissions` item should not contain multiple consecutive space characters");

    //TODO Check against list of known permissions

    validateNonPrintCharacter('`permission`', permission);

    {
        const regex = /^([a-z]([_a-z0-9]?[a-z0-9])*)(\.([a-z]([_a-z0-9]?[a-z0-9])*))*$/
        if(!regex.test(permission))
        {
            core.error(`Wrong permission format for '${permission}' - is the permission correct?`);
            return;
        }
    }
}
function checkPluginRelations(field, value, allowRelative)
{
    if(typeof value == "object" && Object.keys(value).every(item => typeof item === "string") && Object.values(value).every(item => typeof item === "string"))
    {
        const versionRegex = /^([0-9]+(\.[0-9]+){0,2})?$/

        let pluginNames = new Set();
        Object.keys(value).forEach(key => {
            let keyValue = value[key];

            validateCodename(`${field} plugin`, key);
            pluginNames.add(key);

            // Validate version in `value` with `allowRelative` option
            if(allowRelative)
            {
                if(keyValue.startsWith('<') || keyValue.startsWith('>') || keyValue.startsWith('='))
                    keyValue = keyValue.substring(1);
                if(keyValue.startsWith('<=') || keyValue.startsWith('>='))
                    keyValue = keyValue.substring(2);
            }
            if(!versionRegex.test(keyValue))
                core.error("Invalid version string: " + keyValue);

            //TODO Check for colliding dependencies (same plugin but incompatible versions)
        });
        return pluginNames;
    }
    else
    {
        core.error(field + " plugin should be a string or an array");
        return new Set();
    }
}

try
{
    const filename = core.getInput('file');
    if(!fs.existsSync(filename))
    {
        core.error("Input file not found");
        return;
    }

    fs.readFile(
        filename,
        "utf-8",
        (error, data) =>
        {
            if(error)
                throw error;
            else
            {
                const json = JSON.parse(data);

                // api_version
                if(!json.hasOwnProperty("api_version"))
                    core.error('Missing `api_version`');
                else
                    checkApiVersion(json['api_version']);
                // codename
                if(!json.hasOwnProperty("codename"))
                    core.error('Missing `codename`');
                else
                {
                    checkCodename(json['codename']);
                    core.setOutput('codename', json['codename']);
                }
                // alias
                if(json.hasOwnProperty("alias"))
                {
                    const alias = checkAliases(json['alias']);
                    core.setOutput('alias', alias.join(','));
                }
                // version
                if(!json.hasOwnProperty("version"))
                    core.error('Missing `version`');
                else
                {
                    checkVersion(json['version']);
                    core.setOutput('version', json['version']);
                }
                // name
                if(!json.hasOwnProperty("name"))
                    core.warning('Missing `name`, `codename` will be used instead');
                else
                    checkName(json['name']);
                // description
                if(json.hasOwnProperty("description"))
                    checkDescription(json['description']);
                // website
                if(json.hasOwnProperty("website"))
                    checkWebsite(json['website']);
                // author
                if(json.hasOwnProperty("author"))
                {
                    const jsonAuthor = json["author"];
                    if(typeof jsonAuthor === "string")
                        checkAuthor(jsonAuthor)
                    else if(Array.isArray(jsonAuthor) && jsonAuthor.every(item => typeof item === "string"))
                    {
                        jsonAuthor.forEach((author) => checkAuthor(author));
                    }
                    else
                        console.error("Unsupported data type for `author` - use a string or an array of strings")
                }
                // permissions
                if(json.hasOwnProperty("permissions"))
                {
                    const jsonPermissions = json["permissions"];
                    if(Array.isArray(jsonPermissions) && jsonPermissions.every(item => typeof item === "string"))
                    {
                        jsonPermissions.forEach((permission) => checkPermission(permission));
                    }
                    else
                        console.error("Unsupported data type for `permissions` - use an array of strings")
                }
                // Relations with other plugins
                {
                    let mentionedPlugins = new Set();
                    if(json.hasOwnProperty("depends"))
                    {
                        checkPluginRelations("`depends`", json["depends"], true).forEach(item => mentionedPlugins.add(item));
                        core.setOutput("depends", Array.from(mentionedPlugins).join(','));
                    }
                    if(json.hasOwnProperty("recommends"))
                    {
                        checkPluginRelations("`recommends`", json["recommends"], true).forEach(item => mentionedPlugins.add(item));
                    }
                    if(json.hasOwnProperty("suggests"))
                    {
                        checkPluginRelations("`suggests`", json["suggests"], true).forEach(item => mentionedPlugins.add(item));
                    }
                    if(json.hasOwnProperty("breaks"))
                    {
                        checkPluginRelations("`breaks`", json["breaks"], true).forEach(item => mentionedPlugins.add(item));
                    }
                    if(json.hasOwnProperty("replaces"))
                    {
                        checkPluginRelations("`replaces`", json["replaces"], false).forEach(item => mentionedPlugins.add(item));
                    }

                    core.setOutput("other_plugins", Array.from(mentionedPlugins).join(','));
                }
            }
        }
    );
}
catch(error)
{
    core.setFailed(error.message);
}
