import { didYouMeanCommand } from "./_utils.js";
import { getFlag } from "../flags/_utils.js";
export class CommandError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CommandError.prototype);
    }
}
export class ValidationError extends CommandError {
    constructor(message, { exitCode } = {}) {
        super(message);
        Object.defineProperty(this, "exitCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.setPrototypeOf(this, ValidationError.prototype);
        this.exitCode = exitCode ?? 1;
    }
}
export class DuplicateOptionName extends CommandError {
    constructor(name) {
        super(`Option with name "${getFlag(name)}" already exists.`);
        Object.setPrototypeOf(this, DuplicateOptionName.prototype);
    }
}
export class MissingCommandName extends CommandError {
    constructor() {
        super("Missing command name.");
        Object.setPrototypeOf(this, MissingCommandName.prototype);
    }
}
export class DuplicateCommandName extends CommandError {
    constructor(name) {
        super(`Duplicate command name "${name}".`);
        Object.setPrototypeOf(this, DuplicateCommandName.prototype);
    }
}
export class DuplicateCommandAlias extends CommandError {
    constructor(alias) {
        super(`Duplicate command alias "${alias}".`);
        Object.setPrototypeOf(this, DuplicateCommandAlias.prototype);
    }
}
export class CommandNotFound extends CommandError {
    constructor(name, commands, excluded) {
        super(`Unknown command "${name}".${didYouMeanCommand(name, commands, excluded)}`);
        Object.setPrototypeOf(this, UnknownCommand.prototype);
    }
}
export class DuplicateType extends CommandError {
    constructor(name) {
        super(`Type with name "${name}" already exists.`);
        Object.setPrototypeOf(this, DuplicateType.prototype);
    }
}
export class DuplicateCompletion extends CommandError {
    constructor(name) {
        super(`Completion with name "${name}" already exists.`);
        Object.setPrototypeOf(this, DuplicateCompletion.prototype);
    }
}
export class DuplicateExample extends CommandError {
    constructor(name) {
        super(`Example with name "${name}" already exists.`);
        Object.setPrototypeOf(this, DuplicateExample.prototype);
    }
}
export class DuplicateEnvironmentVariable extends CommandError {
    constructor(name) {
        super(`Environment variable with name "${name}" already exists.`);
        Object.setPrototypeOf(this, DuplicateEnvironmentVariable.prototype);
    }
}
export class MissingRequiredEnvVar extends ValidationError {
    constructor(envVar) {
        super(`Missing required environment variable "${envVar.names[0]}".`);
        Object.setPrototypeOf(this, MissingRequiredEnvVar.prototype);
    }
}
export class EnvironmentVariableSingleValue extends CommandError {
    constructor(name) {
        super(`An environment variable can only have one value, but "${name}" has more than one.`);
        Object.setPrototypeOf(this, EnvironmentVariableSingleValue.prototype);
    }
}
export class EnvironmentVariableOptionalValue extends CommandError {
    constructor(name) {
        super(`An environment variable cannot have an optional value, but "${name}" is defined as optional.`);
        Object.setPrototypeOf(this, EnvironmentVariableOptionalValue.prototype);
    }
}
export class EnvironmentVariableVariadicValue extends CommandError {
    constructor(name) {
        super(`An environment variable cannot have an variadic value, but "${name}" is defined as variadic.`);
        Object.setPrototypeOf(this, EnvironmentVariableVariadicValue.prototype);
    }
}
export class DefaultCommandNotFound extends CommandError {
    constructor(name, commands) {
        super(`Default command "${name}" not found.${didYouMeanCommand(name, commands)}`);
        Object.setPrototypeOf(this, DefaultCommandNotFound.prototype);
    }
}
export class CommandExecutableNotFound extends CommandError {
    constructor(name) {
        super(`Command executable not found: ${name}`);
        Object.setPrototypeOf(this, CommandExecutableNotFound.prototype);
    }
}
export class UnknownCompletionCommand extends CommandError {
    constructor(name, commands) {
        super(`Auto-completion failed. Unknown command "${name}".${didYouMeanCommand(name, commands)}`);
        Object.setPrototypeOf(this, UnknownCompletionCommand.prototype);
    }
}
/* Validation errors. */
export class UnknownCommand extends ValidationError {
    constructor(name, commands, excluded) {
        super(`Unknown command "${name}".${didYouMeanCommand(name, commands, excluded)}`);
        Object.setPrototypeOf(this, UnknownCommand.prototype);
    }
}
export class NoArgumentsAllowed extends ValidationError {
    constructor(name) {
        super(`No arguments allowed for command "${name}".`);
        Object.setPrototypeOf(this, NoArgumentsAllowed.prototype);
    }
}
export class MissingArguments extends ValidationError {
    constructor(args) {
        super("Missing argument(s): " + args.join(", "));
        Object.setPrototypeOf(this, MissingArguments.prototype);
    }
}
export class MissingArgument extends ValidationError {
    constructor(arg) {
        super(`Missing argument "${arg}".`);
        Object.setPrototypeOf(this, MissingArgument.prototype);
    }
}
export class TooManyArguments extends ValidationError {
    constructor(args) {
        super(`Too many arguments: ${args.join(" ")}`);
        Object.setPrototypeOf(this, TooManyArguments.prototype);
    }
}
