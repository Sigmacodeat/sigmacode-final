#!/usr/bin/env node
import * as dntShim from "./_dnt.shims.js";
import { authCmd } from "./commands/auth/mod.js";
import { redisCmd } from "./commands/redis/mod.js";
import { teamCmd } from "./commands/team/mod.js";
import { Command } from "./util/command.js";
import { cliffy } from "./deps.js";
import { VERSION } from "./version.js";
import { DEFAULT_CONFIG_PATH } from "./config.js";
const cmd = new Command()
    .name("upstash")
    .version(VERSION)
    .description("Official cli for Upstash products")
    .globalEnv("UPSTASH_EMAIL=<string>", "The email you use on upstash")
    .globalEnv("UPSTASH_API_KEY=<string>", "The api key from upstash")
    // .globalEnv(
    //   "CI=<boolean>",
    //   "Disable interactive prompts and throws an error instead",
    //   { hidden: true }
    // )
    // .globalOption(
    //   "--non-interactive [boolean]",
    //   "Disable interactive prompts and throws an error instead",
    //   { hidden: true }
    // )
    .globalOption("-c, --config=<string>", "Path to .upstash.json file", {
    default: DEFAULT_CONFIG_PATH,
})
    /**
     * Nested commands don't seem to work as expected, or maybe I'm just not understanding them.
     * The workaround is to cast as `Command`
     */
    .command("auth", authCmd)
    .command("redis", redisCmd)
    .command("team", teamCmd);
cmd.reset().action(() => {
    cmd.showHelp();
});
await cmd.parse(dntShim.Deno.args).catch((err) => {
    if (err instanceof cliffy.ValidationError) {
        cmd.showHelp();
        console.error("Usage error: %s", err.message);
        dntShim.Deno.exit(err.exitCode);
    }
    else {
        console.error(`Error: ${err.message}`);
        dntShim.Deno.exit(1);
    }
});
