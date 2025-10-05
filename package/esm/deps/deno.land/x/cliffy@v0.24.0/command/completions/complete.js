import * as dntShim from "../../../../../../_dnt.shims.js";
import { Command } from "../command.js";
import { UnknownCompletionCommand } from "../_errors.js";
/** Execute auto completion method of command and action. */
export class CompleteCommand extends Command {
    constructor(cmd) {
        super();
        return this
            .description("Get completions for given action from given command.")
            .arguments("<action:string> [command...:string]")
            .action(async (_, action, commandNames) => {
            let parent;
            const completeCommand = commandNames
                ?.reduce((cmd, name) => {
                parent = cmd;
                const childCmd = cmd.getCommand(name, false);
                if (!childCmd) {
                    throw new UnknownCompletionCommand(name, cmd.getCommands());
                }
                return childCmd;
            }, cmd || this.getMainCommand()) ?? (cmd || this.getMainCommand());
            const completion = completeCommand
                .getCompletion(action);
            const result = await completion?.complete(completeCommand, parent) ?? [];
            if (result?.length) {
                dntShim.Deno.stdout.writeSync(new TextEncoder().encode(result.join("\n")));
            }
        })
            .reset();
    }
}
