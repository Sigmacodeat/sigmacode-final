import { Command } from "../../util/command.js";
import { createCmd } from "./create.js";
import { listCmd } from "./list.js";
import { deleteCmd } from "./delete.js";
import { addMemberCmd } from "./add_member.js";
import { removeMemberCmd } from "./remove_member.js";
import { listMembersCmd } from "./list_members.js";
export const teamCmd = new Command()
    .description("Manage your teams and their members")
    .globalOption("--json=[boolean:boolean]", "Return raw json response")
    .command("create", createCmd)
    .command("list", listCmd)
    .command("delete", deleteCmd)
    .command("add-member", addMemberCmd)
    .command("remove-member", removeMemberCmd)
    .command("list-members", listMembersCmd);
teamCmd.reset().action(() => {
    teamCmd.showHelp();
});
