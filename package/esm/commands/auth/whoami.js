import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { loadConfig } from "../../config.js";
export const whoamiCmd = new Command()
    .name("whoami")
    .description("Return the current users email")
    .action((options) => {
    const config = loadConfig(options.config);
    if (!config) {
        throw new Error("You are not logged in, please run `upstash auth login`");
    }
    console.log(`Currently logged in as ${cliffy.colors.brightGreen(config.email)}`);
});
