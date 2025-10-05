import { cliffy } from "../../deps.js";
import { Command } from "../../util/command.js";
import { parseAuth } from "../../util/auth.js";
import { http } from "../../util/http.js";
var Role;
(function (Role) {
    Role["admin"] = "admin";
    Role["dev"] = "dev";
    Role["finance"] = "finance";
})(Role || (Role = {}));
export const addMemberCmd = new Command()
    .name("add-member")
    .description("Add a new member to a team")
    .type("role", new cliffy.EnumType(Role))
    .option("--id <string:string>", "The id of your team", { required: true })
    .option("--member-email <string:string>", "The email of a user you want to add.", {
    required: true,
})
    .option("--role <string:role>", "The role for the new user", {
    required: true,
})
    .example("Add new developer", `upstash team add-member --id=f860e7e2-27b8-4166-90d5-ea41e90b4809 --member-email=bob@acme.com --role=${Role.dev}`)
    .action(async (options) => {
    const authorization = await parseAuth(options);
    if (!options.id) {
        if (options.ci) {
            throw new cliffy.ValidationError("id");
        }
        const teams = await http.request({
            method: "GET",
            authorization,
            path: ["v2", "teams"],
        });
        options.id = await cliffy.Select.prompt({
            message: "Select a team",
            options: teams.map(({ team_name, team_id }) => ({
                name: team_name,
                value: team_id,
            })),
        });
    }
    if (!options.memberEmail) {
        if (options.ci) {
            throw new cliffy.ValidationError("memberEmail");
        }
        options.memberEmail = await cliffy.Input.prompt("Enter the user's email");
    }
    if (!options.role) {
        if (options.ci) {
            throw new cliffy.ValidationError("role");
        }
        options.role = (await cliffy.Select.prompt({
            message: "Select a role",
            options: Object.entries(Role).map(([name, value]) => ({
                name,
                value,
            })),
        }));
    }
    const res = await http.request({
        method: "POST",
        authorization,
        path: ["v2", "teams", "member"],
        body: {
            team_id: options.id,
            member_email: options.memberEmail,
            member_role: options.role,
        },
    });
    if (options.json) {
        console.log(JSON.stringify(res, null, 2));
        return;
    }
    console.log(cliffy.colors.brightGreen(`${res.member_email} has been invited to join ${res.team_name} as ${res.member_role}`));
});
