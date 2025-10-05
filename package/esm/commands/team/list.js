import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { parseAuth } from "../../util/auth.js";
import { http } from "../../util/http.js";
export const listCmd = new Command()
    .name("list")
    .description("list all your teams")
    .example("List", "upstash team list")
    .action(async (options) => {
    const authorization = await parseAuth(options);
    const teams = await http.request({
        method: "GET",
        authorization,
        path: ["v2", "teams"],
    });
    if (options.json) {
        console.log(JSON.stringify(teams, null, 2));
        return;
    }
    teams.forEach((team) => {
        console.log();
        console.log();
        console.log(cliffy.colors.underline(cliffy.colors.brightGreen(team.team_name)));
        console.log();
        console.log(cliffy.Table.from(Object.entries(team).map(([k, v]) => [k.toString(), v.toString()])).toString());
    });
});
