import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { parseAuth } from "../../util/auth.js";
import { http } from "../../util/http.js";
export const removeMemberCmd = new Command()
    .name("remove-member")
    .description("Remove a member from a team")
    .option("--id=<string>", "The uuid of the team")
    .option("--email=<string>", "The email of the member")
    .example("Remove", `upstash team remove-member f860e7e2-27b8-4166-90d5-ea41e90b4809 f860e7e2-27b8-4166-90d5-ea41e90b4809`)
    .action(async (options) => {
    const authorization = await parseAuth(options);
    // if (!options.id) {
    //   if (options.ci) {
    //     throw new cliffy.ValidationError("id");
    //   }
    //   const teams = await http.request<
    //     { team_name: string; team_id: string }[]
    //   >({
    //     method: "GET",
    //     authorization,
    //     path: ["v2", "teams"],
    //   });
    //   options.id = await cliffy.Select.prompt({
    //     message: "Select a team",
    //     options: teams.map(({ team_name, team_id }) => ({
    //       name: team_name,
    //       value: team_id,
    //     })),
    //   });
    // }
    // if (!options.email) {
    //   if (options.ci) {
    //     throw new cliffy.ValidationError("email");
    //   }
    //   options.email = await cliffy.Input.prompt("Enter the user's email");
    // }
    const team = await http.request({
        method: "DELETE",
        authorization,
        path: ["v2", "teams", "member"],
        body: {
            team_id: options.id,
            member_email: options.email,
        },
    });
    if (options.json) {
        console.log(JSON.stringify(team, null, 2));
        return;
    }
    console.log(cliffy.colors.brightGreen("Member has been removed"));
});
