import { Command } from "../../util/command.js";
import { createCmd } from "./create.js";
import { listCmd } from "./list.js";
import { deleteCmd } from "./delete.js";
import { getCmd } from "./get.js";
import { statsCmd } from "./stats.js";
import { resetPasswordCmd } from "./reset_password.js";
import { renameCmd } from "./rename.js";
import { enableMultizoneReplicationCmd } from "./enable_multizone_replication.js";
import { moveToTeamCmd } from "./move_to_team.js";
const redisCmd = new Command()
    .description("Manage redis database instances")
    .globalOption("--json=[boolean:boolean]", "Return raw json response")
    .command("create", createCmd)
    .command("list", listCmd)
    .command("get", getCmd)
    .command("delete", deleteCmd)
    .command("stats", statsCmd)
    .command("rename", renameCmd)
    .command("reset-password", resetPasswordCmd)
    .command("enable-multizone-replication", enableMultizoneReplicationCmd)
    .command("move-to-team", moveToTeamCmd);
redisCmd.reset().action(() => {
    redisCmd.showHelp();
});
export { redisCmd };
