// deno-lint-ignore-file no-explicit-any
import * as dntShim from "../../../../../_dnt.shims.js";
import { UnknownType, ValidationError as FlagsValidationError, } from "../flags/_errors.js";
import { MissingRequiredEnvVar } from "./_errors.js";
import { parseFlags } from "../flags/flags.js";
import { getDescription, parseArgumentsDefinition, splitArguments, } from "./_utils.js";
import { blue, bold, red, yellow } from "./deps.js";
import { CommandExecutableNotFound, CommandNotFound, DefaultCommandNotFound, DuplicateCommandAlias, DuplicateCommandName, DuplicateCompletion, DuplicateEnvironmentVariable, DuplicateExample, DuplicateOptionName, DuplicateType, EnvironmentVariableOptionalValue, EnvironmentVariableSingleValue, EnvironmentVariableVariadicValue, MissingArgument, MissingArguments, MissingCommandName, NoArgumentsAllowed, TooManyArguments, UnknownCommand, ValidationError, } from "./_errors.js";
import { BooleanType } from "./types/boolean.js";
import { FileType } from "./types/file.js";
import { NumberType } from "./types/number.js";
import { StringType } from "./types/string.js";
import { Type } from "./type.js";
import { HelpGenerator } from "./help/_help_generator.js";
import { IntegerType } from "./types/integer.js";
import { underscoreToCamelCase } from "../flags/_utils.js";
export class Command {
    constructor() {
        Object.defineProperty(this, "types", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "rawArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "literalArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // @TODO: get script name: https://github.com/denoland/deno/pull/5034
        // private name: string = location.pathname.split( '/' ).pop() as string;
        Object.defineProperty(this, "_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "COMMAND"
        });
        Object.defineProperty(this, "_parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_globalParent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "desc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "_usage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "commands", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "examples", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "envVars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "aliases", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "completions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cmd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this
        });
        Object.defineProperty(this, "argsDefinition", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isExecutable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "throwOnError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_allowEmpty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_stopEarly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "defaultCommand", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_useRawArgs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "args", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "isHidden", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isGlobal", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "hasDefaults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_versionOption", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_helpOption", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_help", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_shouldExit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "_groupName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    versionOption(flags, desc, opts) {
        this._versionOption = flags === false ? flags : {
            flags,
            desc,
            opts: typeof opts === "function" ? { action: opts } : opts,
        };
        return this;
    }
    helpOption(flags, desc, opts) {
        this._helpOption = flags === false ? flags : {
            flags,
            desc,
            opts: typeof opts === "function" ? { action: opts } : opts,
        };
        return this;
    }
    /**
     * Add new sub-command.
     * @param nameAndArguments  Command definition. E.g: `my-command <input-file:string> <output-file:string>`
     * @param cmdOrDescription  The description of the new child command.
     * @param override          Override existing child command.
     */
    command(nameAndArguments, cmdOrDescription, override) {
        this.reset();
        const result = splitArguments(nameAndArguments);
        const name = result.flags.shift();
        const aliases = result.flags;
        if (!name) {
            throw new MissingCommandName();
        }
        if (this.getBaseCommand(name, true)) {
            if (!override) {
                throw new DuplicateCommandName(name);
            }
            this.removeCommand(name);
        }
        let description;
        let cmd;
        if (typeof cmdOrDescription === "string") {
            description = cmdOrDescription;
        }
        if (cmdOrDescription instanceof Command) {
            cmd = cmdOrDescription.reset();
        }
        else {
            cmd = new Command();
        }
        cmd._name = name;
        cmd._parent = this;
        if (description) {
            cmd.description(description);
        }
        if (result.typeDefinition) {
            cmd.arguments(result.typeDefinition);
        }
        aliases.forEach((alias) => cmd.alias(alias));
        this.commands.set(name, cmd);
        this.select(name);
        return this;
    }
    /**
     * Add new command alias.
     * @param alias Tha name of the alias.
     */
    alias(alias) {
        if (this.cmd._name === alias || this.cmd.aliases.includes(alias)) {
            throw new DuplicateCommandAlias(alias);
        }
        this.cmd.aliases.push(alias);
        return this;
    }
    /** Reset internal command reference to main command. */
    reset() {
        this._groupName = undefined;
        this.cmd = this;
        return this;
    }
    /**
     * Set internal command pointer to child command with given name.
     * @param name The name of the command to select.
     */
    select(name) {
        const cmd = this.getBaseCommand(name, true);
        if (!cmd) {
            throw new CommandNotFound(name, this.getBaseCommands(true));
        }
        this.cmd = cmd;
        return this;
    }
    /** ***************************************************************************
     * *** SUB HANDLER ************************************************************
     * *************************************************************************** */
    /** Set command name. */
    name(name) {
        this.cmd._name = name;
        return this;
    }
    /**
     * Set command version.
     * @param version Semantic version string string or method that returns the version string.
     */
    version(version) {
        if (typeof version === "string") {
            this.cmd.ver = () => version;
        }
        else if (typeof version === "function") {
            this.cmd.ver = version;
        }
        return this;
    }
    meta(name, value) {
        this.cmd._meta[name] = value;
        return this;
    }
    getMeta(name) {
        return typeof name === "undefined" ? this._meta : this._meta[name];
    }
    /**
     * Set command help.
     * @param help Help string, method, or config for generator that returns the help string.
     */
    help(help) {
        if (typeof help === "string") {
            this.cmd._help = () => help;
        }
        else if (typeof help === "function") {
            this.cmd._help = help;
        }
        else {
            this.cmd._help = (cmd, options) => HelpGenerator.generate(cmd, { ...help, ...options });
        }
        return this;
    }
    /**
     * Set the long command description.
     * @param description The command description.
     */
    description(description) {
        this.cmd.desc = description;
        return this;
    }
    /**
     * Set the command usage. Defaults to arguments.
     * @param usage The command usage.
     */
    usage(usage) {
        this.cmd._usage = usage;
        return this;
    }
    /**
     * Hide command from help, completions, etc.
     */
    hidden() {
        this.cmd.isHidden = true;
        return this;
    }
    /** Make command globally available. */
    global() {
        this.cmd.isGlobal = true;
        return this;
    }
    /** Make command executable. */
    executable() {
        this.cmd.isExecutable = true;
        return this;
    }
    /**
     * Set command arguments:
     *
     *   <requiredArg:string> [optionalArg: number] [...restArgs:string]
     */
    arguments(args) {
        this.cmd.argsDefinition = args;
        return this;
    }
    /**
     * Set command callback method.
     * @param fn Command action handler.
     */
    action(fn) {
        this.cmd.fn = fn;
        return this;
    }
    /**
     * Don't throw an error if the command was called without arguments.
     * @param allowEmpty Enable/disable allow empty.
     */
    allowEmpty(allowEmpty = true) {
        this.cmd._allowEmpty = allowEmpty;
        return this;
    }
    /**
     * Enable stop early. If enabled, all arguments starting from the first non
     * option argument will be passed as arguments with type string to the command
     * action handler.
     *
     * For example:
     *     `command --debug-level warning server --port 80`
     *
     * Will result in:
     *     - options: `{debugLevel: 'warning'}`
     *     - args: `['server', '--port', '80']`
     *
     * @param stopEarly Enable/disable stop early.
     */
    stopEarly(stopEarly = true) {
        this.cmd._stopEarly = stopEarly;
        return this;
    }
    /**
     * Disable parsing arguments. If enabled the raw arguments will be passed to
     * the action handler. This has no effect for parent or child commands. Only
     * for the command on which this method was called.
     * @param useRawArgs Enable/disable raw arguments.
     */
    useRawArgs(useRawArgs = true) {
        this.cmd._useRawArgs = useRawArgs;
        return this;
    }
    /**
     * Set default command. The default command is executed when the program
     * was called without any argument and if no action handler is registered.
     * @param name Name of the default command.
     */
    default(name) {
        this.cmd.defaultCommand = name;
        return this;
    }
    globalType(name, handler, options) {
        return this.type(name, handler, { ...options, global: true });
    }
    /**
     * Register custom type.
     * @param name    The name of the type.
     * @param handler The callback method to parse the type.
     * @param options Type options.
     */
    type(name, handler, options) {
        if (this.cmd.types.get(name) && !options?.override) {
            throw new DuplicateType(name);
        }
        this.cmd.types.set(name, { ...options, name, handler });
        if (handler instanceof Type &&
            (typeof handler.complete !== "undefined" ||
                typeof handler.values !== "undefined")) {
            const completeHandler = (cmd, parent) => handler.complete?.(cmd, parent) || [];
            this.complete(name, completeHandler, options);
        }
        return this;
    }
    globalComplete(name, complete, options) {
        return this.complete(name, complete, { ...options, global: true });
    }
    complete(name, complete, options) {
        if (this.cmd.completions.has(name) && !options?.override) {
            throw new DuplicateCompletion(name);
        }
        this.cmd.completions.set(name, {
            name,
            complete,
            ...options,
        });
        return this;
    }
    /**
     * Throw validation error's instead of calling `Deno.exit()` to handle
     * validation error's manually.
     *
     * A validation error is thrown when the command is wrongly used by the user.
     * For example: If the user passes some invalid options or arguments to the
     * command.
     *
     * This has no effect for parent commands. Only for the command on which this
     * method was called and all child commands.
     *
     * **Example:**
     *
     * ```
     * try {
     *   cmd.parse();
     * } catch(error) {
     *   if (error instanceof ValidationError) {
     *     cmd.showHelp();
     *     Deno.exit(1);
     *   }
     *   throw error;
     * }
     * ```
     *
     * @see ValidationError
     */
    throwErrors() {
        this.cmd.throwOnError = true;
        return this;
    }
    /**
     * Same as `.throwErrors()` but also prevents calling `Deno.exit` after
     * printing help or version with the --help and --version option.
     */
    noExit() {
        this.cmd._shouldExit = false;
        this.throwErrors();
        return this;
    }
    /** Check whether the command should throw errors or exit. */
    shouldThrowErrors() {
        return this.cmd.throwOnError || !!this.cmd._parent?.shouldThrowErrors();
    }
    /** Check whether the command should exit after printing help or version. */
    shouldExit() {
        return this.cmd._shouldExit ?? this.cmd._parent?.shouldExit() ?? true;
    }
    globalOption(flags, desc, opts) {
        if (typeof opts === "function") {
            return this.option(flags, desc, { value: opts, global: true });
        }
        return this.option(flags, desc, { ...opts, global: true });
    }
    /**
     * Enable grouping of options and set the name of the group.
     * All option which are added after calling the `.group()` method will be
     * grouped in the help output. If the `.group()` method can be use multiple
     * times to create more groups.
     *
     * @param name The name of the option group.
     */
    group(name) {
        this.cmd._groupName = name;
        return this;
    }
    option(flags, desc, opts) {
        if (typeof opts === "function") {
            return this.option(flags, desc, { value: opts });
        }
        const result = splitArguments(flags);
        const args = result.typeDefinition
            ? parseArgumentsDefinition(result.typeDefinition)
            : [];
        const option = {
            ...opts,
            name: "",
            description: desc,
            args,
            flags: result.flags,
            equalsSign: result.equalsSign,
            typeDefinition: result.typeDefinition,
            groupName: this._groupName,
        };
        if (option.separator) {
            for (const arg of args) {
                if (arg.list) {
                    arg.separator = option.separator;
                }
            }
        }
        for (const part of option.flags) {
            const arg = part.trim();
            const isLong = /^--/.test(arg);
            const name = isLong ? arg.slice(2) : arg.slice(1);
            if (this.cmd.getBaseOption(name, true)) {
                if (opts?.override) {
                    this.removeOption(name);
                }
                else {
                    throw new DuplicateOptionName(name);
                }
            }
            if (!option.name && isLong) {
                option.name = name;
            }
            else if (!option.aliases) {
                option.aliases = [name];
            }
            else {
                option.aliases.push(name);
            }
        }
        if (option.prepend) {
            this.cmd.options.unshift(option);
        }
        else {
            this.cmd.options.push(option);
        }
        return this;
    }
    /**
     * Add new command example.
     * @param name          Name of the example.
     * @param description   The content of the example.
     */
    example(name, description) {
        if (this.cmd.hasExample(name)) {
            throw new DuplicateExample(name);
        }
        this.cmd.examples.push({ name, description });
        return this;
    }
    globalEnv(name, description, options) {
        return this.env(name, description, { ...options, global: true });
    }
    env(name, description, options) {
        const result = splitArguments(name);
        if (!result.typeDefinition) {
            result.typeDefinition = "<value:boolean>";
        }
        if (result.flags.some((envName) => this.cmd.getBaseEnvVar(envName, true))) {
            throw new DuplicateEnvironmentVariable(name);
        }
        const details = parseArgumentsDefinition(result.typeDefinition);
        if (details.length > 1) {
            throw new EnvironmentVariableSingleValue(name);
        }
        else if (details.length && details[0].optionalValue) {
            throw new EnvironmentVariableOptionalValue(name);
        }
        else if (details.length && details[0].variadic) {
            throw new EnvironmentVariableVariadicValue(name);
        }
        this.cmd.envVars.push({
            name: result.flags[0],
            names: result.flags,
            description,
            type: details[0].type,
            details: details.shift(),
            ...options,
        });
        return this;
    }
    /** ***************************************************************************
     * *** MAIN HANDLER ***********************************************************
     * *************************************************************************** */
    /**
     * Parse command line arguments and execute matched command.
     * @param args Command line args to parse. Ex: `cmd.parse( Deno.args )`
     */
    async parse(args = dntShim.Deno.args) {
        try {
            this.reset();
            this.registerDefaults();
            this.rawArgs = args;
            if (args.length > 0) {
                const subCommand = this.getCommand(args[0], true);
                if (subCommand) {
                    subCommand._globalParent = this;
                    return subCommand.parse(this.rawArgs.slice(1));
                }
            }
            if (this.isExecutable) {
                await this.executeExecutable(this.rawArgs);
                return {
                    options: {},
                    args: [],
                    cmd: this,
                    literal: [],
                };
            }
            else if (this._useRawArgs) {
                const env = await this.parseEnvVars();
                return this.execute(env, ...this.rawArgs);
            }
            else {
                const env = await this.parseEnvVars();
                const { actionOption, flags, unknown, literal } = this
                    .parseFlags(this.rawArgs, env);
                this.literalArgs = literal;
                const options = { ...env, ...flags };
                const params = this.parseArguments(unknown, options);
                if (actionOption) {
                    await actionOption.action.call(this, options, ...params);
                    if (actionOption.standalone) {
                        return {
                            options,
                            args: params,
                            cmd: this,
                            literal: this.literalArgs,
                        };
                    }
                }
                return this.execute(options, ...params);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw this.error(error);
            }
            else {
                throw this.error(new Error(`[non-error-thrown] ${error}`));
            }
        }
    }
    /** Register default options like `--version` and `--help`. */
    registerDefaults() {
        if (this.hasDefaults || this.getParent()) {
            return this;
        }
        this.hasDefaults = true;
        this.reset();
        !this.types.has("string") &&
            this.type("string", new StringType(), { global: true });
        !this.types.has("number") &&
            this.type("number", new NumberType(), { global: true });
        !this.types.has("integer") &&
            this.type("integer", new IntegerType(), { global: true });
        !this.types.has("boolean") &&
            this.type("boolean", new BooleanType(), { global: true });
        !this.types.has("file") &&
            this.type("file", new FileType(), { global: true });
        if (!this._help) {
            this.help({
                hints: true,
                types: false,
            });
        }
        if (this._versionOption !== false && (this._versionOption || this.ver)) {
            this.option(this._versionOption?.flags || "-V, --version", this._versionOption?.desc ||
                "Show the version number for this program.", {
                standalone: true,
                prepend: true,
                action: async function () {
                    const long = this.getRawArgs().includes(`--${versionOption.name}`);
                    if (long) {
                        await this.checkVersion();
                        this.showLongVersion();
                    }
                    else {
                        this.showVersion();
                    }
                    this.exit();
                },
                ...(this._versionOption?.opts ?? {}),
            });
            const versionOption = this.options[0];
        }
        if (this._helpOption !== false) {
            this.option(this._helpOption?.flags || "-h, --help", this._helpOption?.desc || "Show this help.", {
                standalone: true,
                global: true,
                prepend: true,
                action: async function () {
                    const long = this.getRawArgs().includes(`--${helpOption.name}`);
                    await this.checkVersion();
                    this.showHelp({ long });
                    this.exit();
                },
                ...(this._helpOption?.opts ?? {}),
            });
            const helpOption = this.options[0];
        }
        return this;
    }
    /**
     * Execute command.
     * @param options A map of options.
     * @param args Command arguments.
     */
    async execute(options, ...args) {
        if (this.fn) {
            await this.fn(options, ...args);
        }
        else if (this.defaultCommand) {
            const cmd = this.getCommand(this.defaultCommand, true);
            if (!cmd) {
                throw new DefaultCommandNotFound(this.defaultCommand, this.getCommands());
            }
            cmd._globalParent = this;
            await cmd.execute(options, ...args);
        }
        return {
            options,
            args,
            cmd: this,
            literal: this.literalArgs,
        };
    }
    /**
     * Execute external sub-command.
     * @param args Raw command line arguments.
     */
    async executeExecutable(args) {
        const command = this.getPath().replace(/\s+/g, "-");
        await dntShim.Deno.permissions.request({ name: "run", command });
        try {
            const process = dntShim.Deno.run({
                cmd: [command, ...args],
            });
            const status = await process.status();
            if (!status.success) {
                dntShim.Deno.exit(status.code);
            }
        }
        catch (error) {
            if (error instanceof dntShim.Deno.errors.NotFound) {
                throw new CommandExecutableNotFound(command);
            }
            throw error;
        }
    }
    /**
     * Parse raw command line arguments.
     * @param args Raw command line arguments.
     */
    parseFlags(args, env) {
        try {
            let actionOption;
            const result = parseFlags(args, {
                stopEarly: this._stopEarly,
                allowEmpty: this._allowEmpty,
                flags: this.getOptions(true),
                ignoreDefaults: env,
                parse: (type) => this.parseType(type),
                option: (option) => {
                    if (!actionOption && option.action) {
                        actionOption = option;
                    }
                },
            });
            return { ...result, actionOption };
        }
        catch (error) {
            if (error instanceof FlagsValidationError) {
                throw new ValidationError(error.message);
            }
            throw error;
        }
    }
    /** Parse argument type. */
    parseType(type) {
        const typeSettings = this.getType(type.type);
        if (!typeSettings) {
            throw new UnknownType(type.type, this.getTypes().map((type) => type.name));
        }
        return typeSettings.handler instanceof Type
            ? typeSettings.handler.parse(type)
            : typeSettings.handler(type);
    }
    /** Validate environment variables. */
    async parseEnvVars() {
        const envVars = this.getEnvVars(true);
        const result = {};
        if (!envVars.length) {
            return result;
        }
        const hasEnvPermissions = (await dntShim.Deno.permissions.query({
            name: "env",
        })).state === "granted";
        for (const env of envVars) {
            const name = hasEnvPermissions && env.names.find((name) => !!dntShim.Deno.env.get(name));
            if (name) {
                const propertyName = underscoreToCamelCase(env.prefix
                    ? env.names[0].replace(new RegExp(`^${env.prefix}`), "")
                    : env.names[0]);
                result[propertyName] = this.parseType({
                    label: "Environment variable",
                    type: env.type,
                    name,
                    value: dntShim.Deno.env.get(name) ?? "",
                });
                if (env.value && typeof result[propertyName] !== "undefined") {
                    result[propertyName] = env.value(result[propertyName]);
                }
            }
            else if (env.required) {
                throw new MissingRequiredEnvVar(env);
            }
        }
        return result;
    }
    /**
     * Parse command-line arguments.
     * @param args  Raw command line arguments.
     * @param flags Parsed command line options.
     */
    parseArguments(args, flags) {
        const params = [];
        // remove array reference
        args = args.slice(0);
        if (!this.hasArguments()) {
            if (args.length) {
                if (this.hasCommands(true)) {
                    throw new UnknownCommand(args[0], this.getCommands());
                }
                else {
                    throw new NoArgumentsAllowed(this.getPath());
                }
            }
        }
        else {
            if (!args.length) {
                const required = this.getArguments()
                    .filter((expectedArg) => !expectedArg.optionalValue)
                    .map((expectedArg) => expectedArg.name);
                if (required.length) {
                    const flagNames = Object.keys(flags);
                    const hasStandaloneOption = !!flagNames.find((name) => this.getOption(name, true)?.standalone);
                    if (!hasStandaloneOption) {
                        throw new MissingArguments(required);
                    }
                }
            }
            else {
                for (const expectedArg of this.getArguments()) {
                    if (!args.length) {
                        if (expectedArg.optionalValue) {
                            break;
                        }
                        throw new MissingArgument(`Missing argument: ${expectedArg.name}`);
                    }
                    let arg;
                    if (expectedArg.variadic) {
                        arg = args.splice(0, args.length)
                            .map((value) => this.parseType({
                            label: "Argument",
                            type: expectedArg.type,
                            name: expectedArg.name,
                            value,
                        }));
                    }
                    else {
                        arg = this.parseType({
                            label: "Argument",
                            type: expectedArg.type,
                            name: expectedArg.name,
                            value: args.shift(),
                        });
                    }
                    if (typeof arg !== "undefined") {
                        params.push(arg);
                    }
                }
                if (args.length) {
                    throw new TooManyArguments(args);
                }
            }
        }
        return params;
    }
    /**
     * Handle error. If `throwErrors` is enabled the error will be returned,
     * otherwise a formatted error message will be printed and `Deno.exit(1)`
     * will be called.
     * @param error Error to handle.
     */
    error(error) {
        if (this.shouldThrowErrors() || !(error instanceof ValidationError)) {
            return error;
        }
        this.showHelp();
        console.error(red(`  ${bold("error")}: ${error.message}\n`));
        dntShim.Deno.exit(error instanceof ValidationError ? error.exitCode : 1);
    }
    /** ************************************************************************** *
     * *** GETTER **************************************************************** *
     * *************************************************************************** */
    /** Get command name. */
    getName() {
        return this._name;
    }
    /** Get parent command. */
    getParent() {
        return this._parent;
    }
    /**
     * Get parent command from global executed command.
     * Be sure, to call this method only inside an action handler. Unless this or any child command was executed,
     * this method returns always undefined.
     */
    getGlobalParent() {
        return this._globalParent;
    }
    /** Get main command. */
    getMainCommand() {
        return this._parent?.getMainCommand() ?? this;
    }
    /** Get command name aliases. */
    getAliases() {
        return this.aliases;
    }
    /** Get full command path. */
    getPath() {
        return this._parent
            ? this._parent.getPath() + " " + this._name
            : this._name;
    }
    /** Get arguments definition. E.g: <input-file:string> <output-file:string> */
    getArgsDefinition() {
        return this.argsDefinition;
    }
    /**
     * Get argument by name.
     * @param name Name of the argument.
     */
    getArgument(name) {
        return this.getArguments().find((arg) => arg.name === name);
    }
    /** Get arguments. */
    getArguments() {
        if (!this.args.length && this.argsDefinition) {
            this.args = parseArgumentsDefinition(this.argsDefinition);
        }
        return this.args;
    }
    /** Check if command has arguments. */
    hasArguments() {
        return !!this.argsDefinition;
    }
    /** Get command version. */
    getVersion() {
        return this.getVersionHandler()?.call(this, this);
    }
    /** Get help handler method. */
    getVersionHandler() {
        return this.ver ?? this._parent?.getVersionHandler();
    }
    /** Get command description. */
    getDescription() {
        // call description method only once
        return typeof this.desc === "function"
            ? this.desc = this.desc()
            : this.desc;
    }
    getUsage() {
        return this._usage ?? this.getArgsDefinition();
    }
    /** Get short command description. This is the first line of the description. */
    getShortDescription() {
        return getDescription(this.getDescription(), true);
    }
    /** Get original command-line arguments. */
    getRawArgs() {
        return this.rawArgs;
    }
    /** Get all arguments defined after the double dash. */
    getLiteralArgs() {
        return this.literalArgs;
    }
    /** Output generated help without exiting. */
    showVersion() {
        console.log(this.getVersion());
    }
    /** Returns command name, version and meta data. */
    getLongVersion() {
        return `${bold(this.getMainCommand().getName())} ${blue(this.getVersion() ?? "")}` +
            Object.entries(this.getMeta()).map(([k, v]) => `\n${bold(k)} ${blue(v)}`).join("");
    }
    /** Outputs command name, version and meta data. */
    showLongVersion() {
        console.log(this.getLongVersion());
    }
    /** Output generated help without exiting. */
    showHelp(options) {
        console.log(this.getHelp(options));
    }
    /** Get generated help. */
    getHelp(options) {
        this.registerDefaults();
        return this.getHelpHandler().call(this, this, options ?? {});
    }
    /** Get help handler method. */
    getHelpHandler() {
        return this._help ?? this._parent?.getHelpHandler();
    }
    exit(code = 0) {
        if (this.shouldExit()) {
            dntShim.Deno.exit(code);
        }
    }
    /** Check if new version is available and add hint to version. */
    async checkVersion() {
        const mainCommand = this.getMainCommand();
        const upgradeCommand = mainCommand.getCommand("upgrade");
        if (isUpgradeCommand(upgradeCommand)) {
            const latestVersion = await upgradeCommand.getLatestVersion();
            const currentVersion = mainCommand.getVersion();
            if (currentVersion !== latestVersion) {
                mainCommand.version(`${currentVersion}  ${bold(yellow(`(New version available: ${latestVersion}. Run '${mainCommand.getName()} upgrade' to upgrade to the latest version!)`))}`);
            }
        }
    }
    /** ************************************************************************** *
     * *** Options GETTER ******************************************************** *
     * *************************************************************************** */
    /**
     * Checks whether the command has options or not.
     * @param hidden Include hidden options.
     */
    hasOptions(hidden) {
        return this.getOptions(hidden).length > 0;
    }
    /**
     * Get options.
     * @param hidden Include hidden options.
     */
    getOptions(hidden) {
        return this.getGlobalOptions(hidden).concat(this.getBaseOptions(hidden));
    }
    /**
     * Get base options.
     * @param hidden Include hidden options.
     */
    getBaseOptions(hidden) {
        if (!this.options.length) {
            return [];
        }
        return hidden
            ? this.options.slice(0)
            : this.options.filter((opt) => !opt.hidden);
    }
    /**
     * Get global options.
     * @param hidden Include hidden options.
     */
    getGlobalOptions(hidden) {
        const getOptions = (cmd, options = [], names = []) => {
            if (cmd) {
                if (cmd.options.length) {
                    cmd.options.forEach((option) => {
                        if (option.global &&
                            !this.options.find((opt) => opt.name === option.name) &&
                            names.indexOf(option.name) === -1 &&
                            (hidden || !option.hidden)) {
                            names.push(option.name);
                            options.push(option);
                        }
                    });
                }
                return getOptions(cmd._parent, options, names);
            }
            return options;
        };
        return getOptions(this._parent);
    }
    /**
     * Checks whether the command has an option with given name or not.
     * @param name Name of the option. Must be in param-case.
     * @param hidden Include hidden options.
     */
    hasOption(name, hidden) {
        return !!this.getOption(name, hidden);
    }
    /**
     * Get option by name.
     * @param name Name of the option. Must be in param-case.
     * @param hidden Include hidden options.
     */
    getOption(name, hidden) {
        return this.getBaseOption(name, hidden) ??
            this.getGlobalOption(name, hidden);
    }
    /**
     * Get base option by name.
     * @param name Name of the option. Must be in param-case.
     * @param hidden Include hidden options.
     */
    getBaseOption(name, hidden) {
        const option = this.options.find((option) => option.name === name);
        return option && (hidden || !option.hidden) ? option : undefined;
    }
    /**
     * Get global option from parent command's by name.
     * @param name Name of the option. Must be in param-case.
     * @param hidden Include hidden options.
     */
    getGlobalOption(name, hidden) {
        if (!this._parent) {
            return;
        }
        const option = this._parent.getBaseOption(name, hidden);
        if (!option || !option.global) {
            return this._parent.getGlobalOption(name, hidden);
        }
        return option;
    }
    /**
     * Remove option by name.
     * @param name Name of the option. Must be in param-case.
     */
    removeOption(name) {
        const index = this.options.findIndex((option) => option.name === name);
        if (index === -1) {
            return;
        }
        return this.options.splice(index, 1)[0];
    }
    /**
     * Checks whether the command has sub-commands or not.
     * @param hidden Include hidden commands.
     */
    hasCommands(hidden) {
        return this.getCommands(hidden).length > 0;
    }
    /**
     * Get commands.
     * @param hidden Include hidden commands.
     */
    getCommands(hidden) {
        return this.getGlobalCommands(hidden).concat(this.getBaseCommands(hidden));
    }
    /**
     * Get base commands.
     * @param hidden Include hidden commands.
     */
    getBaseCommands(hidden) {
        const commands = Array.from(this.commands.values());
        return hidden ? commands : commands.filter((cmd) => !cmd.isHidden);
    }
    /**
     * Get global commands.
     * @param hidden Include hidden commands.
     */
    getGlobalCommands(hidden) {
        const getCommands = (cmd, commands = [], names = []) => {
            if (cmd) {
                if (cmd.commands.size) {
                    cmd.commands.forEach((cmd) => {
                        if (cmd.isGlobal &&
                            this !== cmd &&
                            !this.commands.has(cmd._name) &&
                            names.indexOf(cmd._name) === -1 &&
                            (hidden || !cmd.isHidden)) {
                            names.push(cmd._name);
                            commands.push(cmd);
                        }
                    });
                }
                return getCommands(cmd._parent, commands, names);
            }
            return commands;
        };
        return getCommands(this._parent);
    }
    /**
     * Checks whether a child command exists by given name or alias.
     * @param name Name or alias of the command.
     * @param hidden Include hidden commands.
     */
    hasCommand(name, hidden) {
        return !!this.getCommand(name, hidden);
    }
    /**
     * Get command by name or alias.
     * @param name Name or alias of the command.
     * @param hidden Include hidden commands.
     */
    getCommand(name, hidden) {
        return this.getBaseCommand(name, hidden) ??
            this.getGlobalCommand(name, hidden);
    }
    /**
     * Get base command by name or alias.
     * @param name Name or alias of the command.
     * @param hidden Include hidden commands.
     */
    getBaseCommand(name, hidden) {
        for (const cmd of this.commands.values()) {
            if (cmd._name === name || cmd.aliases.includes(name)) {
                return (cmd && (hidden || !cmd.isHidden) ? cmd : undefined);
            }
        }
    }
    /**
     * Get global command by name or alias.
     * @param name Name or alias of the command.
     * @param hidden Include hidden commands.
     */
    getGlobalCommand(name, hidden) {
        if (!this._parent) {
            return;
        }
        const cmd = this._parent.getBaseCommand(name, hidden);
        if (!cmd?.isGlobal) {
            return this._parent.getGlobalCommand(name, hidden);
        }
        return cmd;
    }
    /**
     * Remove sub-command by name or alias.
     * @param name Name or alias of the command.
     */
    removeCommand(name) {
        const command = this.getBaseCommand(name, true);
        if (command) {
            this.commands.delete(command._name);
        }
        return command;
    }
    /** Get types. */
    getTypes() {
        return this.getGlobalTypes().concat(this.getBaseTypes());
    }
    /** Get base types. */
    getBaseTypes() {
        return Array.from(this.types.values());
    }
    /** Get global types. */
    getGlobalTypes() {
        const getTypes = (cmd, types = [], names = []) => {
            if (cmd) {
                if (cmd.types.size) {
                    cmd.types.forEach((type) => {
                        if (type.global &&
                            !this.types.has(type.name) &&
                            names.indexOf(type.name) === -1) {
                            names.push(type.name);
                            types.push(type);
                        }
                    });
                }
                return getTypes(cmd._parent, types, names);
            }
            return types;
        };
        return getTypes(this._parent);
    }
    /**
     * Get type by name.
     * @param name Name of the type.
     */
    getType(name) {
        return this.getBaseType(name) ?? this.getGlobalType(name);
    }
    /**
     * Get base type by name.
     * @param name Name of the type.
     */
    getBaseType(name) {
        return this.types.get(name);
    }
    /**
     * Get global type by name.
     * @param name Name of the type.
     */
    getGlobalType(name) {
        if (!this._parent) {
            return;
        }
        const cmd = this._parent.getBaseType(name);
        if (!cmd?.global) {
            return this._parent.getGlobalType(name);
        }
        return cmd;
    }
    /** Get completions. */
    getCompletions() {
        return this.getGlobalCompletions().concat(this.getBaseCompletions());
    }
    /** Get base completions. */
    getBaseCompletions() {
        return Array.from(this.completions.values());
    }
    /** Get global completions. */
    getGlobalCompletions() {
        const getCompletions = (cmd, completions = [], names = []) => {
            if (cmd) {
                if (cmd.completions.size) {
                    cmd.completions.forEach((completion) => {
                        if (completion.global &&
                            !this.completions.has(completion.name) &&
                            names.indexOf(completion.name) === -1) {
                            names.push(completion.name);
                            completions.push(completion);
                        }
                    });
                }
                return getCompletions(cmd._parent, completions, names);
            }
            return completions;
        };
        return getCompletions(this._parent);
    }
    /**
     * Get completion by name.
     * @param name Name of the completion.
     */
    getCompletion(name) {
        return this.getBaseCompletion(name) ?? this.getGlobalCompletion(name);
    }
    /**
     * Get base completion by name.
     * @param name Name of the completion.
     */
    getBaseCompletion(name) {
        return this.completions.get(name);
    }
    /**
     * Get global completions by name.
     * @param name Name of the completion.
     */
    getGlobalCompletion(name) {
        if (!this._parent) {
            return;
        }
        const completion = this._parent.getBaseCompletion(name);
        if (!completion?.global) {
            return this._parent.getGlobalCompletion(name);
        }
        return completion;
    }
    /**
     * Checks whether the command has environment variables or not.
     * @param hidden Include hidden environment variable.
     */
    hasEnvVars(hidden) {
        return this.getEnvVars(hidden).length > 0;
    }
    /**
     * Get environment variables.
     * @param hidden Include hidden environment variable.
     */
    getEnvVars(hidden) {
        return this.getGlobalEnvVars(hidden).concat(this.getBaseEnvVars(hidden));
    }
    /**
     * Get base environment variables.
     * @param hidden Include hidden environment variable.
     */
    getBaseEnvVars(hidden) {
        if (!this.envVars.length) {
            return [];
        }
        return hidden
            ? this.envVars.slice(0)
            : this.envVars.filter((env) => !env.hidden);
    }
    /**
     * Get global environment variables.
     * @param hidden Include hidden environment variable.
     */
    getGlobalEnvVars(hidden) {
        const getEnvVars = (cmd, envVars = [], names = []) => {
            if (cmd) {
                if (cmd.envVars.length) {
                    cmd.envVars.forEach((envVar) => {
                        if (envVar.global &&
                            !this.envVars.find((env) => env.names[0] === envVar.names[0]) &&
                            names.indexOf(envVar.names[0]) === -1 &&
                            (hidden || !envVar.hidden)) {
                            names.push(envVar.names[0]);
                            envVars.push(envVar);
                        }
                    });
                }
                return getEnvVars(cmd._parent, envVars, names);
            }
            return envVars;
        };
        return getEnvVars(this._parent);
    }
    /**
     * Checks whether the command has an environment variable with given name or not.
     * @param name Name of the environment variable.
     * @param hidden Include hidden environment variable.
     */
    hasEnvVar(name, hidden) {
        return !!this.getEnvVar(name, hidden);
    }
    /**
     * Get environment variable by name.
     * @param name Name of the environment variable.
     * @param hidden Include hidden environment variable.
     */
    getEnvVar(name, hidden) {
        return this.getBaseEnvVar(name, hidden) ??
            this.getGlobalEnvVar(name, hidden);
    }
    /**
     * Get base environment variable by name.
     * @param name Name of the environment variable.
     * @param hidden Include hidden environment variable.
     */
    getBaseEnvVar(name, hidden) {
        const envVar = this.envVars.find((env) => env.names.indexOf(name) !== -1);
        return envVar && (hidden || !envVar.hidden) ? envVar : undefined;
    }
    /**
     * Get global environment variable by name.
     * @param name Name of the environment variable.
     * @param hidden Include hidden environment variable.
     */
    getGlobalEnvVar(name, hidden) {
        if (!this._parent) {
            return;
        }
        const envVar = this._parent.getBaseEnvVar(name, hidden);
        if (!envVar?.global) {
            return this._parent.getGlobalEnvVar(name, hidden);
        }
        return envVar;
    }
    /** Checks whether the command has examples or not. */
    hasExamples() {
        return this.examples.length > 0;
    }
    /** Get all examples. */
    getExamples() {
        return this.examples;
    }
    /** Checks whether the command has an example with given name or not. */
    hasExample(name) {
        return !!this.getExample(name);
    }
    /** Get example with given name. */
    getExample(name) {
        return this.examples.find((example) => example.name === name);
    }
}
function isUpgradeCommand(command) {
    return command instanceof Command && "getLatestVersion" in command;
}
