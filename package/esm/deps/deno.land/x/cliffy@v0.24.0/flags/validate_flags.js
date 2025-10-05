import { getDefaultValue, getOption, paramCaseToCamelCase } from "./_utils.js";
import { ConflictingOption, DependingOption, MissingOptionValue, MissingRequiredOption, OptionNotCombinable, UnknownOption, } from "./_errors.js";
/**
 * Flags post validation. Validations that are not already done by the parser.
 *
 * @param opts            Parse options.
 * @param values          Flag values.
 * @param optionNameMap   Option name mappings: propertyName -> option.name
 */
export function validateFlags(opts, values, optionNameMap = {}) {
    if (!opts.flags?.length) {
        return;
    }
    const defaultValues = setDefaultValues(opts, values, optionNameMap);
    const optionNames = Object.keys(values);
    if (!optionNames.length && opts.allowEmpty) {
        return;
    }
    const options = optionNames.map((name) => ({
        name,
        option: getOption(opts.flags, optionNameMap[name]),
    }));
    for (const { name, option } of options) {
        if (!option) {
            throw new UnknownOption(name, opts.flags);
        }
        if (validateStandaloneOption(option, options, optionNames, defaultValues)) {
            return;
        }
        validateConflictingOptions(option, values);
        validateDependingOptions(option, values, defaultValues);
        validateRequiredValues(option, values, name);
    }
    validateRequiredOptions(options, values, opts);
}
/**
 * Adds all default values on the values object and returns a new object with
 * only the default values.
 *
 * @param opts
 * @param values
 * @param optionNameMap
 */
function setDefaultValues(opts, values, optionNameMap = {}) {
    const defaultValues = {};
    if (!opts.flags?.length) {
        return defaultValues;
    }
    // Set default value's
    for (const option of opts.flags) {
        let name;
        let defaultValue = undefined;
        // if --no-[flag] is present set --[flag] default value to true
        if (option.name.startsWith("no-")) {
            const propName = option.name.replace(/^no-/, "");
            if (propName in values) {
                continue;
            }
            const positiveOption = getOption(opts.flags, propName);
            if (positiveOption) {
                continue;
            }
            name = paramCaseToCamelCase(propName);
            defaultValue = true;
        }
        if (!name) {
            name = paramCaseToCamelCase(option.name);
        }
        if (!(name in optionNameMap)) {
            optionNameMap[name] = option.name;
        }
        const hasDefaultValue = (!opts.ignoreDefaults ||
            typeof opts.ignoreDefaults[name] === "undefined") &&
            typeof values[name] === "undefined" && (typeof option.default !== "undefined" ||
            typeof defaultValue !== "undefined");
        if (hasDefaultValue) {
            values[name] = getDefaultValue(option) ?? defaultValue;
            defaultValues[option.name] = true;
            if (typeof option.value === "function") {
                values[name] = option.value(values[name]);
            }
        }
    }
    return defaultValues;
}
function validateStandaloneOption(option, options, optionNames, defaultValues) {
    if (!option.standalone) {
        return false;
    }
    if (optionNames.length === 1) {
        return true;
    }
    // don't throw an error if all values are coming from the default option.
    if (options.every((opt) => opt.option &&
        (option === opt.option || defaultValues[opt.option.name]))) {
        return true;
    }
    throw new OptionNotCombinable(option.name);
}
function validateConflictingOptions(option, values) {
    option.conflicts?.forEach((flag) => {
        if (isset(flag, values)) {
            throw new ConflictingOption(option.name, flag);
        }
    });
}
function validateDependingOptions(option, values, defaultValues) {
    option.depends?.forEach((flag) => {
        // don't throw an error if the value is coming from the default option.
        if (!isset(flag, values) && !defaultValues[option.name]) {
            throw new DependingOption(option.name, flag);
        }
    });
}
function validateRequiredValues(option, values, name) {
    const isArray = (option.args?.length || 0) > 1;
    option.args?.forEach((arg, i) => {
        if (arg.requiredValue &&
            (typeof values[name] === "undefined" ||
                (isArray &&
                    typeof values[name][i] === "undefined"))) {
            throw new MissingOptionValue(option.name);
        }
    });
}
function validateRequiredOptions(options, values, opts) {
    if (!opts.flags?.length) {
        return;
    }
    for (const option of opts.flags) {
        if (option.required && !(paramCaseToCamelCase(option.name) in values)) {
            if ((!option.conflicts ||
                !option.conflicts.find((flag) => !!values[flag])) &&
                !options.find((opt) => opt.option?.conflicts?.find((flag) => flag === option.name))) {
                throw new MissingRequiredOption(option.name);
            }
        }
    }
}
/**
 * Check if value exists for flag.
 * @param flag    Flag name.
 * @param values  Parsed values.
 */
function isset(flag, values) {
    const name = paramCaseToCamelCase(flag);
    // return typeof values[ name ] !== 'undefined' && values[ name ] !== false;
    return typeof values[name] !== "undefined";
}
