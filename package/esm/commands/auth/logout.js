import { Command } from "../../util/command.js";
import { deleteConfig } from "../../config.js";
export const logoutCmd = new Command()
    .name("logout")
    .description("Delete local configuration")
    .action((options) => {
    try {
        deleteConfig(options.config);
        console.log("You have been logged out");
    }
    catch {
        console.log("You were not logged in");
    }
});
